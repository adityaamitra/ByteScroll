from contextlib import asynccontextmanager
from datetime import date, datetime, timezone
from random import Random
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .curriculum import CARDS, CARD_INDEX, public_card
from .database import Base, engine, get_db
from .models import Attempt
from .schemas import AttemptCreate, AttemptResult, DailySessionOut, ProgressOut


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ByteScroll API",
    version="0.1.0",
    description="Adaptive, short-form learning sessions without an infinite feed.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/sessions/daily", response_model=DailySessionOut)
def daily_session(
    learner_id: str = Query(default="demo-learner", min_length=1, max_length=100),
    limit: int = Query(default=10, ge=1, le=10),
) -> dict:
    cards = CARDS.copy()
    Random(f"{date.today().isoformat()}:{learner_id}").shuffle(cards)
    return {
        "session_id": str(uuid4()),
        "generated_at": datetime.now(timezone.utc),
        "cards": [public_card(card) for card in cards[:limit]],
    }


@app.post("/api/v1/attempts", response_model=AttemptResult, status_code=201)
def create_attempt(payload: AttemptCreate, db: Session = Depends(get_db)) -> dict:
    card = CARD_INDEX.get(payload.card_id)
    if card is None:
        raise HTTPException(status_code=404, detail="Learning card not found")

    option_ids = {option["id"] for option in card["options"]}
    if payload.selected_option_id not in option_ids:
        raise HTTPException(status_code=422, detail="Selected option does not belong to this card")

    is_correct = payload.selected_option_id == card["correct_option_id"]
    xp_earned = 15 if is_correct else 5
    attempt = Attempt(
        learner_id=payload.learner_id,
        card_id=payload.card_id,
        concept=card["concept"],
        selected_option_id=payload.selected_option_id,
        is_correct=is_correct,
        xp_earned=xp_earned,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "attempt_id": attempt.id,
        "is_correct": is_correct,
        "correct_option_id": card["correct_option_id"],
        "explanation": card["explanation"],
        "xp_earned": xp_earned,
    }


@app.get("/api/v1/progress/{learner_id}", response_model=ProgressOut)
def learner_progress(learner_id: str, db: Session = Depends(get_db)) -> dict:
    attempts = list(db.scalars(select(Attempt).where(Attempt.learner_id == learner_id)))
    concept_totals: dict[str, dict[str, int]] = {}

    for attempt in attempts:
        concept = concept_totals.setdefault(attempt.concept, {"attempts": 0, "correct": 0})
        concept["attempts"] += 1
        concept["correct"] += int(attempt.is_correct)

    concepts = {
        name: {
            **values,
            "mastery_percent": round(values["correct"] / values["attempts"] * 100),
        }
        for name, values in concept_totals.items()
    }
    total_correct = sum(int(attempt.is_correct) for attempt in attempts)
    total_answered = len(attempts)

    return {
        "learner_id": learner_id,
        "total_xp": sum(attempt.xp_earned for attempt in attempts),
        "total_answered": total_answered,
        "total_correct": total_correct,
        "accuracy_percent": round(total_correct / total_answered * 100) if total_answered else 0,
        "concepts": concepts,
    }
