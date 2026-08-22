from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_pipeline_scenario_1_agriculture():
    response = client.post(
        "/process",
        json={
            "title": "Tomatoes spoil before reaching the market",
            "description": "Farmers in a rural area lose tomatoes because affordable cold storage facilities are unavailable.",
            "context": {"locationContext": "Northern Plains"},
        },
    )
    assert response.status_code == 200
    data = response.json()

    # Check Analysis
    analysis = data["analysis"]
    assert analysis["domain"] == "Agriculture"
    # No invented population numbers
    assert "150" not in analysis["affectedPopulation"]
    assert "2,000" not in analysis["affectedPopulation"]
    assert "2000" not in analysis["affectedPopulation"]
    # Check that unsupported key factors are filtered
    for factor in analysis["keyFactors"]:
        # "Extreme temperatures" or "unreliable grid" should not appear if they are not in the input description
        assert "unreliable grid" not in factor.lower()
        assert "temperature" not in factor.lower()

    # Check Similarity Search
    similar_challenges = data["similarChallenges"]
    assert len(similar_challenges) > 0

    # Check Gap Analysis
    gap_analysis = data["gapAnalysis"]
    assert gap_analysis["gapType"] in [
        "adaptation",
        "technology",
        "research",
        "data",
        "expertise",
    ]
    assert len(gap_analysis["requiredExpertise"]) > 0

    # Check University Matching
    matches = data["institutionMatches"]
    assert len(matches) > 0
    # AgriTech University should be first or rank higher than non-agricultural/urban ones
    assert matches[0]["universityId"] == "uni_agritech"
    for match in matches:
        # Irrelevant ones should be filtered out
        assert match["universityId"] not in ["uni_metrotech", "uni_traffic_sci"]


def test_pipeline_scenario_2_non_agriculture():
    response = client.post(
        "/process",
        json={
            "title": "Borewell water fluoride contamination",
            "description": "Fluoride in primary school well water causes severe tooth decay and skeletal fluorosis in village children. Tests show high natural fluoride levels.",
            "context": {"locationContext": "Southern Drylands"},
        },
    )
    assert response.status_code == 200
    data = response.json()

    # Check Analysis
    analysis = data["analysis"]
    assert analysis["domain"] == "Water Management"
    assert "400" not in analysis["affectedPopulation"]

    # Check University Matching
    matches = data["institutionMatches"]
    assert len(matches) > 0
    # Relevant water university should rank high
    assert any(
        m["universityId"] in ["uni_water_eng", "uni_ecoscience"] for m in matches[:2]
    )
    # Unrelated institutions must not rank above the relevant ones
    for match in matches[:2]:
        assert match["universityId"] not in [
            "uni_metrotech",
            "uni_traffic_sci",
            "uni_spec_needs",
        ]
