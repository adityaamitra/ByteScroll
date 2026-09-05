export interface ConceptProgress {
  attempts: number;
  correct: number;
}

export interface LearnerProgress {
  totalXp: number;
  totalAnswered: number;
  totalCorrect: number;
  sessionsCompleted: number;
  streak: number;
  lastSessionDate: string | null;
  concepts: Record<string, ConceptProgress>;
}

export const EMPTY_PROGRESS: LearnerProgress = {
  totalXp: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  sessionsCompleted: 0,
  streak: 0,
  lastSessionDate: null,
  concepts: {},
};

const STORAGE_KEY = "bytescroll-progress-v1";

export function loadProgress(): LearnerProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...EMPTY_PROGRESS, ...JSON.parse(stored) } : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: LearnerProgress): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordAttempt(
  progress: LearnerProgress,
  concept: string,
  isCorrect: boolean,
  xp: number,
): LearnerProgress {
  const currentConcept = progress.concepts[concept] ?? { attempts: 0, correct: 0 };

  return {
    ...progress,
    totalXp: progress.totalXp + xp,
    totalAnswered: progress.totalAnswered + 1,
    totalCorrect: progress.totalCorrect + (isCorrect ? 1 : 0),
    concepts: {
      ...progress.concepts,
      [concept]: {
        attempts: currentConcept.attempts + 1,
        correct: currentConcept.correct + (isCorrect ? 1 : 0),
      },
    },
  };
}

export function completeSession(progress: LearnerProgress): LearnerProgress {
  const today = new Date();
  const todayKey = dateKey(today);

  if (progress.lastSessionDate === todayKey) return progress;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const continued = progress.lastSessionDate === dateKey(yesterday);

  return {
    ...progress,
    sessionsCompleted: progress.sessionsCompleted + 1,
    streak: continued ? progress.streak + 1 : 1,
    lastSessionDate: todayKey,
  };
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}
