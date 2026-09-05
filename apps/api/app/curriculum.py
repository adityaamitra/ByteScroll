import json
from pathlib import Path
from typing import Any


CURRICULUM_PATH = Path(__file__).resolve().parents[3] / "content" / "python" / "foundations.json"


def load_cards() -> list[dict[str, Any]]:
    with CURRICULUM_PATH.open(encoding="utf-8") as curriculum_file:
        return json.load(curriculum_file)


CARDS = load_cards()
CARD_INDEX = {card["id"]: card for card in CARDS}


def public_card(card: dict[str, Any]) -> dict[str, Any]:
    return {
        key: value
        for key, value in card.items()
        if key not in {"correct_option_id", "explanation"}
    }
