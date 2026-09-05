import { tracks, type LearningStep, type TrackId } from "@/lib/curriculum";

export type AppTab = "learn" | "progress" | "tracks" | "profile";
export type DailyGoal = 5 | 10 | 20;

export interface ConceptProgress {
  seen: number;
  attempts: number;
  correct: number;
  confidenceTotal: number;
}

export interface ReviewItem {
  stepId: string;
  dueAt: string;
  intervalDays: number;
  repetitions: number;
}

export interface StudySession {
  stepIds: string[];
  cursor: number;
  startedAt: string;
  date: string;
  checkpointSize: number;
  missedStepIds: string[];
}

export interface TrackProgress {
  totalXp: number;
  totalAnswered: number;
  totalCorrect: number;
  sessionsCompleted: number;
  selectedModuleId: string;
  completedStepIds: string[];
  lastSessionDate: string | null;
  concepts: Record<string, ConceptProgress>;
  reviewQueue: ReviewItem[];
  bookmarks: string[];
  session: StudySession | null;
}

export interface LearnerSettings {
  onboardingComplete: boolean;
  experience: "new" | "some";
  dailyGoal: DailyGoal;
  displayName: string;
}

export interface LearnerProgress {
  version: 3;
  activeTrack: TrackId;
  activeTab: AppTab;
  streak: number;
  totalLearningDays: number;
  lastLearningDate: string | null;
  activityDates: string[];
  settings: LearnerSettings;
  tracks: Record<TrackId, TrackProgress>;
}

const STORAGE_KEY = "bytescroll-progress-v3";
const OLD_STORAGE_KEYS = ["bytescroll-progress-v2", "bytescroll-progress-v1"];

function emptyTrack(trackId: TrackId): TrackProgress {
  return {
    totalXp: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    sessionsCompleted: 0,
    selectedModuleId: tracks[trackId].modules[0].id,
    completedStepIds: [],
    lastSessionDate: null,
    concepts: {},
    reviewQueue: [],
    bookmarks: [],
    session: null,
  };
}

export function createEmptyProgress(): LearnerProgress {
  return {
    version: 3,
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
      python: emptyTrack("python"),
      "system-design": emptyTrack("system-design"),
    },
  };
}

export const EMPTY_PROGRESS = createEmptyProgress();

export function loadProgress(): LearnerProgress {
  if (typeof window === "undefined") return createEmptyProgress();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeProgress(JSON.parse(stored));

    for (const key of OLD_STORAGE_KEYS) {
      const previous = window.localStorage.getItem(key);
      if (previous) {
        const parsed = JSON.parse(previous) as Record<string, unknown>;
        return key.endsWith("v1") ? migrateLegacyProgress(parsed) : normalizeProgress(parsed);
      }
    }
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

export function normalizeProgress(value: Partial<LearnerProgress> & Record<string, unknown>): LearnerProgress {
  const empty = createEmptyProgress();
  const rawSettings = value.settings as Partial<LearnerSettings> | undefined;
  const legacyGoal = Number(rawSettings?.dailyGoal ?? empty.settings.dailyGoal);
  const dailyGoal: DailyGoal = legacyGoal === 5 || legacyGoal === 20 ? legacyGoal : 10;
  const rawTracks = value.tracks as Partial<Record<TrackId, Partial<TrackProgress>>> | undefined;

  return {
    ...empty,
    ...value,
    version: 3,
    settings: { ...empty.settings, ...rawSettings, dailyGoal },
    tracks: {
      python: normalizeTrack("python", rawTracks?.python),
      "system-design": normalizeTrack("system-design", rawTracks?.["system-design"]),
    },
  };
}

function normalizeTrack(trackId: TrackId, value?: Partial<TrackProgress>): TrackProgress {
  const empty = emptyTrack(trackId);
  const validModule = tracks[trackId].modules.some((module) => module.id === value?.selectedModuleId);
  return {
    ...empty,
    ...value,
    selectedModuleId: validModule ? value?.selectedModuleId as string : empty.selectedModuleId,
    completedStepIds: Array.isArray(value?.completedStepIds) ? value.completedStepIds : [],
    bookmarks: Array.isArray(value?.bookmarks) ? value.bookmarks : [],
    concepts: value?.concepts ?? {},
    reviewQueue: Array.isArray(value?.reviewQueue)
      ? value.reviewQueue.map((item) => ({
          ...item,
          intervalDays: Number(item.intervalDays ?? 1),
          repetitions: Number(item.repetitions ?? 0),
        }))
      : [],
    session: isValidSession(value?.session) ? value.session : null,
  };
}

function isValidSession(value: StudySession | null | undefined): value is StudySession {
  return Boolean(
    value &&
      Array.isArray(value.stepIds) &&
      typeof value.cursor === "number" &&
      typeof value.date === "string" &&
      typeof value.checkpointSize === "number" &&
      Array.isArray(value.missedStepIds),
  );
}

export function setActiveTab(progress: LearnerProgress, tab: AppTab): LearnerProgress {
  return { ...progress, activeTab: tab };
}

export function setActiveTrack(progress: LearnerProgress, trackId: TrackId): LearnerProgress {
  return { ...progress, activeTrack: trackId, activeTab: "learn" };
}

export function selectModule(
  progress: LearnerProgress,
  trackId: TrackId,
  moduleId: string,
): LearnerProgress {
  return {
    ...progress,
    activeTrack: trackId,
    activeTab: "learn",
    tracks: {
      ...progress.tracks,
      [trackId]: {
        ...progress.tracks[trackId],
        selectedModuleId: moduleId,
        session: null,
      },
    },
  };
}

export function setStudySession(
  progress: LearnerProgress,
  trackId: TrackId,
  session: StudySession,
): LearnerProgress {
  return {
    ...progress,
    tracks: {
      ...progress.tracks,
      [trackId]: { ...progress.tracks[trackId], session },
    },
  };
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
  const answered = typeof isCorrect === "boolean";
  const session = track.session
    ? {
        ...track.session,
        cursor: Math.min(track.session.cursor + 1, track.session.stepIds.length),
        missedStepIds: isCorrect === false && !track.session.missedStepIds.includes(step.id)
          ? [...track.session.missedStepIds, step.id]
          : track.session.missedStepIds,
      }
    : null;

  return {
    ...progress,
    tracks: {
      ...progress.tracks,
      [trackId]: {
        ...track,
        totalXp: track.totalXp + (alreadyCompleted ? 0 : step.xp),
        totalAnswered: track.totalAnswered + (answered ? 1 : 0),
        totalCorrect: track.totalCorrect + (isCorrect ? 1 : 0),
        completedStepIds: alreadyCompleted ? track.completedStepIds : [...track.completedStepIds, step.id],
        concepts: {
          ...track.concepts,
          [step.concept]: {
            ...concept,
            seen: concept.seen + (alreadyCompleted ? 0 : 1),
            attempts: concept.attempts + (answered ? 1 : 0),
            correct: concept.correct + (isCorrect ? 1 : 0),
          },
        },
        reviewQueue: updateReviewQueue(track.reviewQueue, step.id, isCorrect),
        session,
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
          [conceptName]: { ...concept, confidenceTotal: concept.confidenceTotal + confidence },
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

export function toggleBookmark(progress: LearnerProgress, trackId: TrackId, stepId: string): LearnerProgress {
  const track = progress.tracks[trackId];
  const bookmarks = track.bookmarks.includes(stepId)
    ? track.bookmarks.filter((id) => id !== stepId)
    : [...track.bookmarks, stepId];

  return {
    ...progress,
    tracks: { ...progress.tracks, [trackId]: { ...track, bookmarks } },
  };
}

export function updateSettings(
  progress: LearnerProgress,
  settings: Partial<LearnerSettings>,
): LearnerProgress {
  return { ...progress, settings: { ...progress.settings, ...settings } };
}

function updateReviewQueue(queue: ReviewItem[], stepId: string, isCorrect?: boolean): ReviewItem[] {
  if (typeof isCorrect !== "boolean") return queue;
  const previous = queue.find((item) => item.stepId === stepId);
  const withoutCurrent = queue.filter((item) => item.stepId !== stepId);
  const intervalDays = isCorrect
    ? previous ? Math.min(30, Math.max(3, previous.intervalDays * 2)) : 3
    : 1;
  const repetitions = isCorrect ? (previous?.repetitions ?? 0) + 1 : 0;

  return [
    ...withoutCurrent,
    { stepId, dueAt: dateKey(offsetDate(new Date(), intervalDays)), intervalDays, repetitions },
  ];
}

function migrateLegacyProgress(legacy: Record<string, unknown>): LearnerProgress {
  const progress = createEmptyProgress();
  const concepts = (legacy.concepts ?? {}) as Record<string, { attempts?: number; correct?: number }>;
  const lastSessionDate = (legacy.lastSessionDate as string | null) ?? null;
  progress.settings.onboardingComplete = true;
  progress.streak = Number(legacy.streak ?? 0);
  progress.lastLearningDate = lastSessionDate;
  progress.tracks.python.totalXp = Number(legacy.totalXp ?? 0);
  progress.tracks.python.totalAnswered = Number(legacy.totalAnswered ?? 0);
  progress.tracks.python.totalCorrect = Number(legacy.totalCorrect ?? 0);
  progress.tracks.python.sessionsCompleted = Number(legacy.sessionsCompleted ?? 0);
  progress.tracks.python.lastSessionDate = lastSessionDate;
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

export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function offsetDate(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
