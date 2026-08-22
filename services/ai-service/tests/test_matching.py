from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_university_matching():
    response = client.post(
        "/matches",
        json={
            "challengeId": "ch_tomato_spoilage",
            "description": "Vegetables spoil due to lack of cold storage.",
            "gapAnalysis": {
                "id": "gap_1",
                "challengeId": "ch_tomato_spoilage",
                "gapType": "adaptation",
                "description": "Need passive cooling",
                "rationale": "no refrigeration",
                "recommendedAction": "build zero energy chambers",
                "requiredExpertise": [
                    "Agricultural Engineering",
                    "Thermal Engineering",
                ],
                "confidence": 0.88,
            },
        },
    )
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    # First match should be State AgriTech University since it has Agronomy & Agricultural Engineering!
    assert results[0]["universityId"] == "uni_agritech"
    # Ensure scores are between 0 and 100
    for r in results:
        assert 0.0 <= r["matchScore"] <= 100.0
        assert len(r["reasons"]) > 0
