import json
from pathlib import Path
from typing import Any


CONTENT_ROOT = Path(__file__).resolve().parents[3] / "content"
CATALOG_PATH = CONTENT_ROOT / "course-catalog.json"
CURRICULUM_PATHS = {
    "python": CONTENT_ROOT / "python" / "learning-path.json",
    "system-design": CONTENT_ROOT / "system-design" / "foundations.json",
}


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as curriculum_file:
        return json.load(curriculum_file)


def load_cards(path: Path) -> list[dict[str, Any]]:
    return load_json(path)


TRACK_CARDS = {track_id: load_cards(path) for track_id, path in CURRICULUM_PATHS.items()}
CATALOG = load_json(CATALOG_PATH)
CARDS = [card for cards in TRACK_CARDS.values() for card in cards]
CARD_INDEX = {card["id"]: card for card in CARDS}


def public_card(card: dict[str, Any]) -> dict[str, Any]:
    return {
        key: value
        for key, value in card.items()
        if key not in {"correct_option_id", "explanation", "wrong_feedback"}
    }
