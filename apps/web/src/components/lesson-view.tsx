"use client";

import { useEffect, useMemo, useState } from "react";
import { isQuestion, tracks, type TrackId } from "@/lib/curriculum";
import {
  completeLearningStep,
  completeSession,
  recordConfidence,
  restartTrackSession,
  toggleBookmark,
  type LearnerProgress,
} from "@/lib/progress";
import { ArrowIcon, BookmarkIcon, CheckIcon, LightbulbIcon } from "@/components/app-icons";

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
  const currentIndex = Math.min(trackProgress.currentStep, track.steps.length);
  const step = track.steps[currentIndex];
  const finished = currentIndex >= track.steps.length;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    setSelectedOption(null);
    setHintOpen(false);
    setConfidence(null);
  }, [step?.id, trackId]);

  const conceptPosition = useMemo(() => {
    if (!step) return 0;
    return track.concepts.indexOf(step.concept) + 1;
  }, [step, track.concepts]);

  function continueLesson() {
    if (!step) return;
    const correct = isQuestion(step) ? selectedOption === step.correct_option_id : undefined;
    if (isQuestion(step) && selectedOption === null) return;

    let next = completeLearningStep(progress, trackId, step, correct);
    if (confidence) next = recordConfidence(next, trackId, step.concept, confidence);
    if (currentIndex === track.steps.length - 1) next = completeSession(next, trackId);
    onProgressChange(next);
  }

  function replay() {
    onProgressChange(restartTrackSession(progress, trackId));
  }

  function bookmark() {
    if (!step) return;
    onProgressChange(toggleBookmark(progress, trackId, step.id));
  }

  const isBookmarked = step ? trackProgress.bookmarks.includes(step.id) : false;
  const answeredCorrectly = step && selectedOption === step.correct_option_id;

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
          <div><span className="overline accent">Morning mission · {track.shortName}</span><h1>Your Daily 10</h1></div>
          <span className="step-count">{finished ? 10 : currentIndex + 1} / {track.steps.length}</span>
        </header>
        <div className="step-dots" aria-label={`${finished ? 10 : currentIndex} of ${track.steps.length} completed`}>
          {track.steps.map((item, index) => <span className={`${index < currentIndex || finished ? "complete" : ""} ${index === currentIndex && !finished ? "current" : ""}`} key={item.id} />)}
        </div>

        {finished ? (
          <article className="lesson-card completion-card">
            <div className="completion-mark"><CheckIcon /></div>
            <span className="overline accent">Daily 10 complete</span>
            <h2>You learned, practiced, and stopped on purpose.</h2>
            <p>Your progress is saved. Anything you missed is waiting in tomorrow&apos;s review queue—not an endless feed.</p>
            <div className="completion-stats">
              <div><strong>{trackProgress.totalXp}</strong><span>track XP</span></div>
              <div><strong>{trackProgress.totalCorrect}/{trackProgress.totalAnswered}</strong><span>correct</span></div>
              <div><strong>{trackProgress.reviewQueue.length}</strong><span>to review</span></div>
            </div>
            <button className="primary-button" onClick={replay}>Review this lesson again <ArrowIcon /></button>
            <span className="stop-message">You&apos;re done for now. Close ByteScroll and start your day.</span>
          </article>
        ) : (
          <article className={`lesson-card ${step.kind}`}>
            <div className="card-topline">
              <div><span className={`step-kind ${step.kind}`}>{stepLabels[step.kind]}</span><span className="concept-name">{step.concept}</span></div>
              <button className={`icon-button ${isBookmarked ? "active" : ""}`} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this card"} onClick={bookmark}><BookmarkIcon /></button>
            </div>

            <div className="card-copy">
              <span className="lesson-index">Concept {conceptPosition || 1}</span>
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

                {!selectedOption && step.hint && (
                  <button className="hint-button" onClick={() => setHintOpen((value) => !value)}><LightbulbIcon />{hintOpen ? "Hide hint" : "Need a hint?"}</button>
                )}
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
              {step.kind === "learn" ? "Show me an example" : step.kind === "example" ? "Let me try" : currentIndex === track.steps.length - 1 ? "Finish today’s session" : "Continue"}
              <ArrowIcon />
            </button>
          </article>
        )}
        <p className="finite-note">A finite session by design · progress saves automatically</p>
      </div>

      <aside className="lesson-rail">
        <section className="surface-panel today-panel">
          <span className="overline">Today&apos;s path</span>
          <h2>{track.name}</h2>
          <div className="today-steps">
            {["Learn", "See", "Try", "Review"].map((label, index) => {
              const thresholds = [1, 2, 3, 10];
              const complete = currentIndex >= thresholds[index];
              return <div className={complete ? "complete" : ""} key={label}><span>{complete ? "✓" : index + 1}</span><strong>{label}</strong></div>;
            })}
          </div>
        </section>
        <section className="surface-panel review-panel">
          <span className="overline">Memory queue</span>
          <strong>{trackProgress.reviewQueue.length}</strong>
          <p>{trackProgress.reviewQueue.length === 1 ? "card is scheduled for another look." : "cards are scheduled for another look."}</p>
        </section>
      </aside>
    </section>
  );
}
