import os

from fastapi.testclient import TestClient

from app.main import app
from app.providers.mock_llm import MockLLMProvider
from app.repositories.local_repository import LocalRepository
from app.services.evidence_validator import evidence_validator
from app.services.matching_service import matching_service
from app.services.similarity_service import similarity_service

client = TestClient(app)


def test_analysis_does_not_invent_population_numbers():
    provider = MockLLMProvider()
    res = provider.analyze_challenge(
        challenge_id="ch_test_1",
        title="Tomato preservation cooling",
        description="Farmers need cooling systems to preserve harvested crops.",
    )
    # Check that mock LLM provider does not output hallucinated numbers
    assert "150" not in res.affectedPopulation
    assert "2,000" not in res.affectedPopulation


def test_analysis_moves_unknown_infrastructure_to_missing_information():
    # Input has no mention of grid power/electricity
    provider = MockLLMProvider()
    res = provider.analyze_challenge(
        challenge_id="ch_test_2",
        title="Tomato preservation cooling",
        description="Farmers need cooling systems to preserve harvested crops.",
    )
    # Run evidence validator
    validated = evidence_validator.validate_analysis_against_input(
        title="Tomato preservation cooling",
        description="Farmers need cooling systems to preserve harvested crops.",
        analysis=res,
    )
    # Check key factors do not include unreliable grid power
    for factor in validated.keyFactors:
        assert "grid" not in factor.lower()
        assert "electricity" not in factor.lower()
    # Validate missing information
    assert "Electricity availability and reliability" in validated.missingInformation


def test_similarity_relationship_thresholds():
    # Test threshold classification matching the upgraded rules:
    # >= 0.85 -> duplicate
    # >= 0.65 -> related
    # < 0.65 -> weakly_related or filtered
    matches = similarity_service.find_similar(
        title="Tomatoes spoil at market",
        description="Farmers lose fresh tomatoes because cold storage is not available in the afternoon.",
        domain="Agriculture",
        limit=5,
    )
    for match in matches:
        if match.score >= 0.85:
            assert match.relationship == "duplicate"
        elif match.score >= 0.65:
            assert match.relationship == "related"
        else:
            assert match.relationship == "weakly_related"


def test_seed_dataset_is_not_modified_by_similarity_search():
    repo = LocalRepository()
    challenges_file = repo.challenges_file

    # Get file modification time before
    mtime_before = os.path.getmtime(challenges_file)

    # Run similarity search
    similarity_service.find_similar(
        title="Random search query",
        description="Search description to trigger similarity calculations.",
        limit=2,
    )

    # Check modification time after remains the same
    mtime_after = os.path.getmtime(challenges_file)
    assert mtime_before == mtime_after


def test_matching_prioritizes_domain_relevance():
    # Agriculture domain matching
    matches = matching_service.find_matches(
        domain="Agriculture",
        description="Farmers lose crops because cold storage is unavailable.",
        location_context=None,
    )
    assert len(matches) > 0
    # Agritech university should rank at the top
    assert matches[0].universityId == "uni_agritech"


def test_irrelevant_university_does_not_receive_location_baseline_score():
    # Location context provided but university is completely unrelated
    matches = matching_service.find_matches(
        domain="Agriculture",
        description="Farmers lose crops because cold storage is unavailable.",
        location_context="Metro Region",
    )
    # Unrelated institutions must either have 0 or be completely filtered out
    for m in matches:
        if m.universityId in ["uni_metrotech", "uni_traffic_sci"]:
            # If present, they must have matchScore < 15 or not be in final results
            assert m.matchScore < 15.0


def test_pipeline_returns_complete_intelligence_result():
    response = client.post(
        "/process",
        json={
            "title": "Vegetables spoil due to heat",
            "description": "Farmers need local cooling systems to prevent post-harvest spoilage.",
            "context": {"locationContext": "Northern Plains"},
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "analysis" in data
    assert "similarChallenges" in data
    assert "gapAnalysis" in data
    assert "institutionMatches" in data
