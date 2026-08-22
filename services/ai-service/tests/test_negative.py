from app.schemas.models import InnovationGap
from app.services.capability_matching_service import capability_matching_service
from app.services.challenge_analyzer import challenge_analyzer
from app.services.classification_service import classification_service
from app.services.evidence_service import evidence_service
from app.services.evidence_validator import evidence_validator
from app.services.similarity_service import similarity_service


def test_does_not_invent_population():
    # Test that analyzer does not invent numeric population stats
    analysis = challenge_analyzer.analyze(
        "ch_neg_1",
        "Crop failure",
        "Farming crops are failing in our block due to dry weather.",
    )
    validated = evidence_validator.validate_analysis_against_input(
        "Crop failure",
        "Farming crops are failing in our block due to dry weather.",
        analysis,
    )
    assert "100" not in validated.affectedPopulation
    assert "1000" not in validated.affectedPopulation
    assert "500" not in validated.affectedPopulation


def test_does_not_assume_electricity_problem():
    # Description does not mention electricity/grid
    analysis = challenge_analyzer.analyze(
        "ch_neg_2",
        "Crop storage issue",
        "Farmers are losing tomatoes in the afternoon because there is no cool storage space.",
    )
    validated = evidence_validator.validate_analysis_against_input(
        "Crop storage issue",
        "Farmers are losing tomatoes in the afternoon because there is no cool storage space.",
        analysis,
    )
    # Validate grid power is NOT a key factor
    assert not any(
        "grid" in kf.lower() or "electricity" in kf.lower()
        for kf in validated.keyFactors
    )


def test_does_not_force_domain_for_irrelevant_input():
    res = classification_service.classify(
        "birthday party",
        "Need help organizing my private birthday party with 20 guests.",
    )
    assert res["domain"] == "Other"
    assert res["classificationStatus"] in ["insufficient_information", "classified"]


def test_does_not_match_battery_lab_to_cold_storage():
    gap = InnovationGap(
        id="g_neg",
        challengeId="ch_neg_3",
        gapType="adaptation",
        description="Need cold storage facility for agricultural harvest.",
        rationale="Rotting crop produce",
        recommendedAction="Design passive clay-based cold storage chambers.",
        requiredExpertise=["Thermal Engineering", "Agricultural Engineering"],
        confidence=0.90,
    )
    matches = capability_matching_service.find_matches(
        domain="Agriculture",
        description="Vegetables spoil due to lack of cold storage.",
        gap_analysis=gap,
    )

    # Assert that battery labs or unrelated universities are not in the top match or have zero infra score
    for m in matches:
        if m.universityId == "uni_energy_tech":
            # uni_energy_tech has "Battery Stress Test Lab", which is zero relevance to cold storage/cooling!
            assert m.explainability["infrastructureScore"] == 0


def test_does_not_call_related_case_duplicate():
    # Compare unrelated / weakly related cases
    matches = similarity_service.find_similar(
        title="Tomato crop spoilage due to storage issues",
        description="Farmers lose tomatoes because affordable cold storage is unavailable.",
        limit=5,
    )
    for m in matches:
        if m.score < 0.85:
            assert m.relationship != "duplicate"


def test_returns_unknown_for_ambiguous_input():
    res = classification_service.classify("Problem", "Problem in village")
    assert res["classificationStatus"] == "insufficient_information"
    assert len(res["missingInformation"]) > 0


def test_marks_multi_domain_problem_correctly():
    res = classification_service.classify(
        "Flooding and road damage",
        "Severe flooding has contaminated our drinking water wells and washed away the main roads.",
    )
    assert "Water Management" in [res["primaryDomain"]] + res["secondaryDomains"]
    assert any(
        d in res["secondaryDomains"]
        for d in ["Disaster Management", "Urban Infrastructure", "Transportation"]
    )


def test_does_not_convert_hypothesis_to_fact():
    extracted = evidence_service.extract_evidence(
        "Crop issue",
        "Farmers lose tomatoes. Perhaps high temperature makes them spoil.",
        "Agriculture",
    )
    # "Perhaps high temperature makes them spoil" should be a hypothesis, not a supported fact
    assert any("temperature" in h.lower() for h in extracted["hypotheses"])
    assert not any("temperature" in f.lower() for f in extracted["supported_facts"])


def test_filters_low_relevance_institution():
    gap = InnovationGap(
        id="g_neg_4",
        challengeId="ch_neg_4",
        gapType="adaptation",
        description="Accessibility ramps for wheelchair users.",
        rationale="Public buildings lack ramps.",
        recommendedAction="Install portable wheelchair ramps.",
        requiredExpertise=["Accessibility Engineering"],
        confidence=0.90,
    )
    matches = capability_matching_service.find_matches(
        domain="Accessibility",
        description="Government offices lack wheelchair ramps.",
        gap_analysis=gap,
    )
    # Totally unrelated universities should be excluded or have very low score below 15
    for m in matches:
        assert m.universityId != "uni_agritech" or m.matchScore < 15.0
