import { getStep, isQuestion, tracks, type CourseModule, type TrackId } from "@/lib/curriculum";
import { dateKey, setStudySession, type LearnerProgress, type StudySession } from "@/lib/progress";

export type ModuleStatus = "complete" | "in-progress" | "available" | "locked";

export function moduleCompletion(
  progress: LearnerProgress,
  trackId: TrackId,
  module: CourseModule,
): number {
  const completed = new Set(progress.tracks[trackId].completedStepIds);
  const count = module.steps.filter((step) => completed.has(step.id)).length;
  return module.steps.length ? Math.round((count / module.steps.length) * 100) : 0;
}

export function isModuleUnlocked(
  progress: LearnerProgress,
  trackId: TrackId,
  moduleIndex: number,
): boolean {
  if (moduleIndex === 0) return true;
  const previous = tracks[trackId].modules[moduleIndex - 1];
  return moduleCompletion(progress, trackId, previous) >= 80;
}

export function moduleStatus(
  progress: LearnerProgress,
  trackId: TrackId,
  module: CourseModule,
  moduleIndex: number,
): ModuleStatus {
  const completion = moduleCompletion(progress, trackId, module);
  if (completion === 100) return "complete";
  if (completion > 0) return "in-progress";
  return isModuleUnlocked(progress, trackId, moduleIndex) ? "available" : "locked";
}

export function dueReviewCount(progress: LearnerProgress, trackId: TrackId): number {
  const today = dateKey();
  return progress.tracks[trackId].reviewQueue.filter((item) => item.dueAt <= today).length;
}

export function ensureStudySession(
  progress: LearnerProgress,
  trackId: TrackId,
): LearnerProgress {
  const session = progress.tracks[trackId].session;
  if (session?.date === dateKey() && session.stepIds.length > 0) return progress;
  return replaceSession(progress, trackId, chooseCards(progress, trackId, progress.settings.dailyGoal));
}

export function extendStudySession(
  progress: LearnerProgress,
  trackId: TrackId,
  count = 5,
): LearnerProgress {
  const previous = progress.tracks[trackId].session;
  if (!previous) return ensureStudySession(progress, trackId);
  const additional = chooseCards(progress, trackId, count, previous.stepIds);
  return setStudySession(progress, trackId, {
    ...previous,
    stepIds: [...previous.stepIds, ...additional],
    checkpointSize: previous.stepIds.length + additional.length,
  });
}

export function startMistakeReview(
  progress: LearnerProgress,
  trackId: TrackId,
): LearnerProgress {
  const trackProgress = progress.tracks[trackId];
  const today = dateKey();
  const dueIds = trackProgress.reviewQueue
    .filter((item) => item.dueAt <= today)
    .map((item) => item.stepId);
  const mistakeIds = trackProgress.session?.missedStepIds ?? [];
  const ids = unique([...mistakeIds, ...dueIds]).filter((id) => {
    const step = getStep(trackId, id);
    return Boolean(step && isQuestion(step));
  });
  return ids.length ? replaceSession(progress, trackId, ids) : progress;
}

function replaceSession(
  progress: LearnerProgress,
  trackId: TrackId,
  stepIds: string[],
): LearnerProgress {
  const session: StudySession = {
    stepIds,
    cursor: 0,
    startedAt: new Date().toISOString(),
    date: dateKey(),
    checkpointSize: stepIds.length,
    missedStepIds: [],
  };
  return setStudySession(progress, trackId, session);
}

function chooseCards(
  progress: LearnerProgress,
  trackId: TrackId,
  count: number,
  excludedIds: string[] = [],
): string[] {
  const track = tracks[trackId];
  const trackProgress = progress.tracks[trackId];
  const completed = new Set(trackProgress.completedStepIds);
  const excluded = new Set(excludedIds);
  const today = dateKey();
  const selectedIndex = Math.max(
    0,
    track.modules.findIndex((module) => module.id === trackProgress.selectedModuleId),
  );
  const orderedModules = [
    ...track.modules.slice(selectedIndex),
    ...track.modules.slice(0, selectedIndex),
  ];

  const dueReviews = trackProgress.reviewQueue
    .filter((item) => item.dueAt <= today)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .map((item) => item.stepId);
  const newCards = orderedModules.flatMap((module) => module.steps)
    .filter((step) => !completed.has(step.id))
    .map((step) => step.id);
  const weakConcepts = new Set(
    Object.entries(trackProgress.concepts)
      .filter(([, item]) => item.attempts > 0 && item.correct / item.attempts < 0.7)
      .map(([concept]) => concept),
  );
  const weakQuestions = track.steps
    .filter((step) => isQuestion(step) && weakConcepts.has(step.concept))
    .map((step) => step.id);
  const practicedQuestions = track.steps
    .filter((step) => isQuestion(step) && completed.has(step.id))
    .map((step) => step.id);
  const firstPass = unique([...dueReviews, ...newCards, ...weakQuestions, ...practicedQuestions])
    .filter((id) => !excluded.has(id));
  const result = firstPass.slice(0, count);

  // Once all unique cards are exhausted, cycle through quiz cards. This keeps
  // "Continue +5" genuinely open-ended while avoiding back-to-back duplicates.
  const repeatPool = unique([...dueReviews, ...weakQuestions, ...practicedQuestions, ...track.steps.filter(isQuestion).map((step) => step.id)]);
  let repeatIndex = 0;
  while (result.length < count && repeatPool.length > 0) {
    const candidate = repeatPool[repeatIndex % repeatPool.length];
    if (candidate !== result[result.length - 1]) result.push(candidate);
    repeatIndex += 1;
    if (repeatPool.length === 1 && result[result.length - 1] === candidate && result.length < count) {
      result.push(candidate);
    }
  }

  return result;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
