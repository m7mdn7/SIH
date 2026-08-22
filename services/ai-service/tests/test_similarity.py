from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_similarity():
    # tomatoes vs tomatoes should have higher score than tomatoes vs classroom
    response_a = client.post(
        "/similarity",
        json={
            "title": "Vegetable rot at coop",
            "description": "Vegetables spoil due to lack of cold storage.",
            "domain": "Agriculture",
        },
    )
    assert response_a.status_code == 200
    results = response_a.json()

    # Verify that the tomato_spoilage challenge is in the results
    tomato_match = [r for r in results if r["challengeId"] == "ch_tomato_spoilage"]
    assert len(tomato_match) > 0
    assert tomato_match[0]["score"] > 0.50
