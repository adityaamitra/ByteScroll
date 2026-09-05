from datetime import datetime

from pydantic import BaseModel, Field


class OptionOut(BaseModel):
    id: str
    label: str


class CardOut(BaseModel):
    id: str
    kind: str
    concept: str
    title: str
    body: str
    code: str | None = None
    visual: str | None = None
    takeaway: str | None = None
    hint: str | None = None
    options: list[OptionOut] = Field(default_factory=list)


class DailySessionOut(BaseModel):
    session_id: str
    track_id: str
    generated_at: datetime
    cards: list[CardOut]


class AttemptCreate(BaseModel):
    learner_id: str = Field(default="demo-learner", min_length=1, max_length=100)
    card_id: str
    selected_option_id: str


class AttemptResult(BaseModel):
    attempt_id: str
    is_correct: bool
    correct_option_id: str
    explanation: str
    xp_earned: int


class ConceptProgress(BaseModel):
    attempts: int
    correct: int
    mastery_percent: int


class ProgressOut(BaseModel):
    learner_id: str
    total_xp: int
    total_answered: int
    total_correct: int
    accuracy_percent: int
    concepts: dict[str, ConceptProgress]
