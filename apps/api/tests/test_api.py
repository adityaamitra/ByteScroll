from fastapi.testclient import TestClient

from app.curriculum import CARDS, TRACK_CARDS
from app.main import app


def test_health_check() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_daily_session_does_not_leak_answers() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/sessions/daily?limit=3")

    assert response.status_code == 200
    assert len(response.json()["cards"]) == 3
    assert all("correct_option_id" not in card for card in response.json()["cards"])
    assert all("explanation" not in card for card in response.json()["cards"])
    assert response.json()["cards"][0]["kind"] == "learn"


def test_attempt_returns_feedback() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/attempts",
            json={
                "learner_id": "test-learner",
                "card_id": "py-quiz-variables",
                "selected_option_id": "b",
            },
        )

    assert response.status_code == 201
    assert response.json()["is_correct"] is True
    assert response.json()["xp_earned"] == 15


def test_curriculum_ids_and_answers_are_valid() -> None:
    card_ids = [card["id"] for card in CARDS]

    assert len(card_ids) == len(set(card_ids))
    assert all(len(cards) == 10 for cards in TRACK_CARDS.values())
    questions = [card for card in CARDS if card["kind"] in {"quiz", "review"}]
    assert all(card["correct_option_id"] in {option["id"] for option in card["options"]} for card in questions)
    assert all(card.get("wrong_feedback") for card in questions)
