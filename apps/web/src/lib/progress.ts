import type { LearningStep, TrackId } from "@/lib/curriculum";

export type AppTab = "learn" | "progress" | "tracks" | "profile";

export interface ConceptProgress {
  seen: number;
  attempts: number;
  correct: number;
  confidenceTotal: number;
}

export interface ReviewItem {
  stepId: string;
  dueAt: string;
}

export interface TrackProgress {
  totalXp: number;
  totalAnswered: number;
  totalCorrect: number;
  sessionsCompleted: number;
  currentStep: number;
  completedStepIds: string[];
  lastSessionDate: string | null;
  concepts: Record<string, ConceptProgress>;
  reviewQueue: ReviewItem[];
  bookmarks: string[];
}

export interface LearnerSettings {
  onboardingComplete: boolean;
  experience: "new" | "some";
  dailyGoal: 5 | 10 | 15;
  displayName: string;
}

export interface LearnerProgress {
  version: 2;
  activeTrack: TrackId;
  activeTab: AppTab;
  streak: number;
  totalLearningDays: number;
  lastLearningDate: string | null;
  activityDates: string[];
  settings: LearnerSettings;
  tracks: Record<TrackId, TrackProgress>;
}

const STORAGE_KEY = "bytescroll-progress-v2";
const LEGACY_STORAGE_KEY = "bytescroll-progress-v1";

function emptyTrack(): TrackProgress {
  return {
    totalXp: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    sessionsCompleted: 0,
    currentStep: 0,
    completedStepIds: [],
    lastSessionDate: null,
    concepts: {},
    reviewQueue: [],
    bookmarks: [],
  };
}

export function createEmptyProgress(): LearnerProgress {
  return {
    version: 2,
    activeTrack: "python",
    activeTab: "learn",
    streak: 0,
    totalLearningDays: 0,
    lastLearningDate: null,
    activityDates: [],
    settings: {
      onboardingComplete: false,
      experience: "new",
      dailyGoal: 10,
      displayName: "",
    },
    tracks: {
      python: emptyTrack(),
      "system-design": emptyTrack(),
    },
  };
}

export const EMPTY_PROGRESS = createEmptyProgress();

export function loadProgress(): LearnerProgress {
  if (typeof window === "undefined") return createEmptyProgress();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeProgress(JSON.parse(stored));

    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) return migrateLegacyProgress(JSON.parse(legacy));
  } catch {
    return createEmptyProgress();
  }

  return createEmptyProgress();
}

export function saveProgress(progress: LearnerProgress): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}

export function normalizeProgress(value: Partial<LearnerProgress>): LearnerProgress {
  const empty = createEmptyProgress();
  return {
    ...empty,
    ...value,
    version: 2,
    settings: { ...empty.settings, ...value.settings },
    tracks: {
      python: { ...empty.tracks.python, ...value.tracks?.python },
      "system-design": { ...empty.tracks["system-design"], ...value.tracks?.["system-design"] },
    },
  };
}

export function setActiveTab(progress: LearnerProgress, tab: AppTab): LearnerProgress {
  return { ...progress, activeTab: tab };
}

export function setActiveTrack(progress: LearnerProgress, trackId: TrackId): LearnerProgress {
  return { ...progress, activeTrack: trackId, activeTab: "learn" };
}

export function finishOnboarding(
  progress: LearnerProgress,
  settings: Pick<LearnerSettings, "experience" | "dailyGoal"> & { activeTrack: TrackId },
): LearnerProgress {
  return {
    ...progress,
    activeTrack: settings.activeTrack,
    settings: {
      ...progress.settings,
      onboardingComplete: true,
      experience: settings.experience,
      dailyGoal: settings.dailyGoal,
    },
  };
}

export function completeLearningStep(
  progress: LearnerProgress,
  trackId: TrackId,
  step: LearningStep,
  isCorrect?: boolean,
): LearnerProgress {
  const track = progress.tracks[trackId];
  const alreadyCompleted = track.completedStepIds.includes(step.id);
  const concept = track.concepts[step.concept] ?? {
    seen: 0,
    attempts: 0,
    correct: 0,
    confidenceTotal: 0,
  };
  const isQuestion = typeof isCorrect === "boolean";
  const reviewQueue = updateReviewQueue(track.reviewQueue, step.id, isCorrect);

  return {
    ...progress,
    tracks: {
      ...progress.tracks,
      [trackId]: {
        ...track,
        totalXp: track.totalXp + (alreadyCompleted ? 0 : step.xp),
        totalAnswered: track.totalAnswered + (isQuestion ? 1 : 0),
        totalCorrect: track.totalCorrect + (isCorrect ? 1 : 0),
        currentStep: Math.min(track.currentStep + 1, 10),
        completedStepIds: alreadyCompleted
          ? track.completedStepIds
          : [...track.completedStepIds, step.id],
        concepts: {
          ...track.concepts,
          [step.concept]: {
            ...concept,
            seen: concept.seen + (alreadyCompleted ? 0 : 1),
            attempts: concept.attempts + (isQuestion ? 1 : 0),
            correct: concept.correct + (isCorrect ? 1 : 0),
          },
        },
        reviewQueue,
      },
    },
  };
}

export function recordConfidence(
  progress: LearnerProgress,
  trackId: TrackId,
  conceptName: string,
  confidence: 1 | 2 | 3,
): LearnerProgress {
  const track = progress.tracks[trackId];
  const concept = track.concepts[conceptName];
  if (!concept) return progress;

  return {
    ...progress,
    tracks: {
      ...progress.tracks,
      [trackId]: {
        ...track,
        concepts: {
          ...track.concepts,
          [conceptName]: {
            ...concept,
            confidenceTotal: concept.confidenceTotal + confidence,
          },
        },
      },
    },
  };
}

export function completeSession(progress: LearnerProgress, trackId: TrackId): LearnerProgress {
  const today = new Date();
  const todayKey = dateKey(today);
  const track = progress.tracks[trackId];
  const alreadyCompletedToday = track.lastSessionDate === todayKey;
  const learnedOnPreviousDay = progress.lastLearningDate === dateKey(offsetDate(today, -1));
  const isNewLearningDay = progress.lastLearningDate !== todayKey;

  return {
    ...progress,
    streak: isNewLearningDay ? (learnedOnPreviousDay ? progress.streak + 1 : 1) : progress.streak,
    totalLearningDays: progress.totalLearningDays + (isNewLearningDay ? 1 : 0),
    lastLearningDate: todayKey,
    activityDates: isNewLearningDay
      ? [...progress.activityDates.filter((item) => item !== todayKey), todayKey]
      : progress.activityDates,
    tracks: {
      ...progress.tracks,
      [trackId]: {
        ...track,
        sessionsCompleted: track.sessionsCompleted + (alreadyCompletedToday ? 0 : 1),
        lastSessionDate: todayKey,
      },
    },
  };
}

export function restartTrackSession(progress: LearnerProgress, trackId: TrackId): LearnerProgress {
  return {
    ...progress,
    tracks: {
      ...progress.tracks,
      [trackId]: { ...progress.tracks[trackId], currentStep: 0 },
    },
  };
}

export function toggleBookmark(
  progress: LearnerProgress,
  trackId: TrackId,
  stepId: string,
): LearnerProgress {
  const track = progress.tracks[trackId];
  const bookmarks = track.bookmarks.includes(stepId)
    ? track.bookmarks.filter((id) => id !== stepId)
    : [...track.bookmarks, stepId];

  return {
    ...progress,
    tracks: {
      ...progress.tracks,
      [trackId]: { ...track, bookmarks },
    },
  };
}

export function updateSettings(
  progress: LearnerProgress,
  settings: Partial<LearnerSettings>,
): LearnerProgress {
  return { ...progress, settings: { ...progress.settings, ...settings } };
}

function updateReviewQueue(
  queue: ReviewItem[],
  stepId: string,
  isCorrect?: boolean,
): ReviewItem[] {
  if (typeof isCorrect !== "boolean") return queue;
  const withoutCurrent = queue.filter((item) => item.stepId !== stepId);
  if (isCorrect) return withoutCurrent;

  const due = offsetDate(new Date(), 1);
  return [...withoutCurrent, { stepId, dueAt: dateKey(due) }];
}

function migrateLegacyProgress(legacy: Record<string, unknown>): LearnerProgress {
  const progress = createEmptyProgress();
  const concepts = (legacy.concepts ?? {}) as Record<string, { attempts?: number; correct?: number }>;

  progress.settings.onboardingComplete = true;
  progress.streak = Number(legacy.streak ?? 0);
  progress.lastLearningDate = (legacy.lastSessionDate as string | null) ?? null;
  progress.tracks.python.totalXp = Number(legacy.totalXp ?? 0);
  progress.tracks.python.totalAnswered = Number(legacy.totalAnswered ?? 0);
  progress.tracks.python.totalCorrect = Number(legacy.totalCorrect ?? 0);
  progress.tracks.python.sessionsCompleted = Number(legacy.sessionsCompleted ?? 0);
  progress.tracks.python.lastSessionDate = (legacy.lastSessionDate as string | null) ?? null;
  progress.tracks.python.concepts = Object.fromEntries(
    Object.entries(concepts).map(([name, value]) => [
      name,
      {
        seen: value.attempts ?? 0,
        attempts: value.attempts ?? 0,
        correct: value.correct ?? 0,
        confidenceTotal: 0,
      },
    ]),
  );

  return progress;
}

function offsetDate(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}
