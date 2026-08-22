from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_analyze_agriculture():
    response = client.post(
        "/analyze",
        json={
            "id": "test_1",
            "title": "tomato spoilage",
            "description": "veggies are rotting in cold storage",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["domain"] == "Agriculture"
    assert data["severity"] in ["low", "medium", "high"]
    assert len(data["keyFactors"]) > 0
    assert data["confidence"] > 0.0


def test_analyze_empty_input():
    response = client.post(
        "/analyze", json={"id": "test_err", "title": "", "description": ""}
    )
    assert response.status_code == 422 or response.status_code == 400
