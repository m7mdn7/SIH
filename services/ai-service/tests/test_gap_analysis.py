from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_gap_analysis():
    response = client.post(
        "/gap-analysis",
        json={
            "challengeId": "ch_test",
            "description": "Farmers require passive sand-clay cooling chambers to stop vegetables from rotting in local coops.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["gapType"] in [
        "research",
        "technology",
        "adaptation",
        "data",
        "expertise",
    ]
    assert data["confidence"] >= 0.0
    assert len(data["requiredExpertise"]) > 0
