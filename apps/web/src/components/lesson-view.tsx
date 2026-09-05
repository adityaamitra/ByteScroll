"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowIcon, BookmarkIcon, CheckIcon, LightbulbIcon } from "@/components/app-icons";
import { dueReviewCount, ensureStudySession, extendStudySession, startMistakeReview } from "@/lib/course-engine";
import { getStep, isQuestion, tracks, type TrackId } from "@/lib/curriculum";
import {
  completeLearningStep,
  completeSession,
  dateKey,
  recordConfidence,
  toggleBookmark,
  type LearnerProgress,
} from "@/lib/progress";

interface LessonViewProps {
  progress: LearnerProgress;
  onProgressChange: (progress: LearnerProgress) => void;
  onTrackChange: (track: TrackId) => void;
}

const stepLabels = {
  learn: "Learn",
  example: "See it work",
  quiz: "Try it",
  review: "Review",
};

export function LessonView({ progress, onProgressChange, onTrackChange }: LessonViewProps) {
  const trackId = progress.activeTrack;
  const track = tracks[trackId];
  const trackProgress = progress.tracks[trackId];
  const session = trackProgress.session;
  const currentIndex = session?.cursor ?? 0;
  const step = session ? getStep(trackId, session.stepIds[currentIndex]) : undefined;
  const finished = Boolean(session && currentIndex >= session.stepIds.length);
  const module = step ? track.modules.find((item) => item.id === step.moduleId) : undefined;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | null>(null);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (!session || session.date !== dateKey()) {
      onProgressChange(ensureStudySession(progress, trackId));
    }
    // The session itself is the initialization boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, session?.date]);

  useEffect(() => {
    setSelectedOption(null);
    setHintOpen(false);
    setConfidence(null);
    setStopped(false);
  }, [step?.id, trackId, session?.stepIds.length]);

  const conceptPosition = useMemo(() => {
    if (!step || !module) return 0;
    const concepts = [...new Set(module.steps.map((item) => item.concept))];
    return concepts.indexOf(step.concept) + 1;
  }, [step, module]);

  function continueLesson() {
    if (!step || !session) return;
    const correct = isQuestion(step) ? selectedOption === step.correct_option_id : undefined;
    if (isQuestion(step) && selectedOption === null) return;

    let next = completeLearningStep(progress, trackId, step, correct);
    if (confidence) next = recordConfidence(next, trackId, step.concept, confidence);
    if (currentIndex === session.stepIds.length - 1) next = completeSession(next, trackId);
    onProgressChange(next);
  }

  function continueFive() {
    setStopped(false);
    onProgressChange(extendStudySession(progress, trackId, 5));
  }

  function reviewMistakes() {
    setStopped(false);
    onProgressChange(startMistakeReview(progress, trackId));
  }

  function bookmark() {
    if (!step) return;
    onProgressChange(toggleBookmark(progress, trackId, step.id));
  }

  const isBookmarked = step ? trackProgress.bookmarks.includes(step.id) : false;
  const answeredCorrectly = step && selectedOption === step.correct_option_id;
  const mistakeCount = session?.missedStepIds.length ?? 0;
  const reviewCount = dueReviewCount(progress, trackId);

  return (
    <section className={`lesson-layout ${track.accent}`}>
      <div className="lesson-main">
        <div className="track-switcher" role="tablist" aria-label="Learning track">
          {(Object.keys(tracks) as TrackId[]).map((id) => (
            <button role="tab" aria-selected={trackId === id} className={trackId === id ? "active" : ""} key={id} onClick={() => onTrackChange(id)}>
              <span>{tracks[id].icon}</span>{tracks[id].shortName}
            </button>
          ))}
        </div>

        <header className="daily-header">
          <div><span className="overline accent">Morning mission · {track.shortName}</span><h1>Today&apos;s session</h1></div>
          <span className="step-count">{session ? Math.min(currentIndex + (finished ? 0 : 1), session.stepIds.length) : 0} / {session?.stepIds.length ?? progress.settings.dailyGoal}</span>
        </header>
        <div className="step-dots" aria-label={`${currentIndex} of ${session?.stepIds.length ?? 0} completed`}>
          {session?.stepIds.map((id, index) => <span className={`${index < currentIndex || finished ? "complete" : ""} ${index === currentIndex && !finished ? "current" : ""}`} key={`${id}-${index}`} />)}
        </div>

        {!session ? (
          <article className="lesson-card loading-card"><span className="brand-mark">B</span><p>Building your session…</p></article>
        ) : finished ? (
          <article className="lesson-card completion-card">
            <div className="completion-mark"><CheckIcon /></div>
            <span className="overline accent">Checkpoint reached</span>
            <h2>{stopped ? "Good stopping point. Go start your day." : `You finished ${session.stepIds.length} focused cards.`}</h2>
            <p>Your progress is saved. Continue while you have energy, or stop without losing your place.</p>
            <div className="completion-stats">
              <div><strong>{trackProgress.totalXp}</strong><span>track XP</span></div>
              <div><strong>{trackProgress.totalCorrect}/{trackProgress.totalAnswered}</strong><span>correct</span></div>
              <div><strong>{mistakeCount}</strong><span>missed now</span></div>
            </div>
            <div className="checkpoint-actions">
              <button className="primary-button" onClick={continueFive}>Continue +5 <ArrowIcon /></button>
              <button className="secondary-button" disabled={!mistakeCount && !reviewCount} onClick={reviewMistakes}>Review mistakes</button>
              <button className={`quiet-button ${stopped ? "selected" : ""}`} onClick={() => setStopped(true)}>{stopped ? "Finished for today ✓" : "Finish for today"}</button>
            </div>
            <span className="stop-message">There is no hard card limit—you choose when the session ends.</span>
          </article>
        ) : step ? (
          <article className={`lesson-card ${step.kind}`}>
            <div className="card-topline">
              <div><span className={`step-kind ${step.kind}`}>{stepLabels[step.kind]}</span><span className="concept-name">{step.concept}</span></div>
              <button className={`icon-button ${isBookmarked ? "active" : ""}`} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this card"} onClick={bookmark}><BookmarkIcon /></button>
            </div>

            <div className="card-copy">
              <span className="lesson-index">{module?.title ?? track.name} · Concept {conceptPosition || 1}</span>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>

            {step.code && <pre className="code-block"><code>{step.code}</code></pre>}
            {step.visual && <div className="system-visual"><pre>{step.visual}</pre></div>}
            {step.takeaway && <div className="takeaway"><LightbulbIcon /><div><span>Keep this</span><p>{step.takeaway}</p></div></div>}

            {isQuestion(step) && (
              <>
                <div className="answer-list" role="group" aria-label="Answer choices">
                  {step.options?.map((option, index) => {
                    const correctOption = option.id === step.correct_option_id;
                    const selected = option.id === selectedOption;
                    return (
                      <button
                        className={`answer-option ${selectedOption && correctOption ? "correct" : ""} ${selected && !correctOption ? "incorrect" : ""}`}
                        disabled={selectedOption !== null}
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                      >
                        <span>{String.fromCharCode(65 + index)}</span><strong>{option.label}</strong>
                        {selectedOption && correctOption && <CheckIcon />}
                        {selected && !correctOption && <b>×</b>}
                      </button>
                    );
                  })}
                </div>

                {!selectedOption && step.hint && <button className="hint-button" onClick={() => setHintOpen((value) => !value)}><LightbulbIcon />{hintOpen ? "Hide hint" : "Need a hint?"}</button>}
                {hintOpen && !selectedOption && <p className="hint-copy">{step.hint}</p>}

                {selectedOption && (
                  <div className={`answer-feedback ${answeredCorrectly ? "success" : "retry"}`}>
                    <div><strong>{answeredCorrectly ? "That’s it." : "Useful miss. Let’s fix it."}</strong><span>+{trackProgress.completedStepIds.includes(step.id) ? 0 : step.xp} XP</span></div>
                    <p>{answeredCorrectly ? step.explanation : step.wrong_feedback?.[selectedOption] ?? step.explanation}</p>
                    <div className="confidence-row"><span>How sure were you?</span>{([1, 2, 3] as const).map((value) => <button className={confidence === value ? "selected" : ""} onClick={() => setConfidence(value)} key={value}>{value === 1 ? "Guessed" : value === 2 ? "Somewhat" : "Confident"}</button>)}</div>
                  </div>
                )}
              </>
            )}

            <button className="primary-button card-action" disabled={isQuestion(step) && !selectedOption} onClick={continueLesson}>
              {step.kind === "learn" ? "Show me an example" : step.kind === "example" ? "Let me try" : currentIndex === session.stepIds.length - 1 ? "Reach checkpoint" : "Continue"}
              <ArrowIcon />
            </button>
          </article>
        ) : (
          <article className="lesson-card completion-card"><h2>This card moved.</h2><p>Start a fresh session to continue from your saved progress.</p><button className="primary-button" onClick={continueFive}>Build five cards <ArrowIcon /></button></article>
        )}
        <p className="finite-note">A checkpoint, not a cutoff · progress saves automatically</p>
      </div>

      <aside className="lesson-rail">
        <section className="surface-panel today-panel">
          <span className="overline">Current module</span>
          <h2>{module?.title ?? track.modules.find((item) => item.id === trackProgress.selectedModuleId)?.title}</h2>
          <p className="rail-copy">{module?.description ?? "Your selected path will continue in the next session."}</p>
          <div className="today-steps">
            {["Learn", "See", "Try"].map((label, index) => {
              const position = currentIndex % 3;
              const complete = position > index || finished;
              return <div className={complete ? "complete" : ""} key={label}><span>{complete ? "✓" : index + 1}</span><strong>{label}</strong></div>;
            })}
          </div>
        </section>
        <section className="surface-panel review-panel">
          <span className="overline">Due now</span>
          <strong>{reviewCount}</strong>
          <p>{reviewCount === 1 ? "memory card is ready for another look." : "memory cards are ready for another look."}</p>
        </section>
      </aside>
    </section>
  );
}
