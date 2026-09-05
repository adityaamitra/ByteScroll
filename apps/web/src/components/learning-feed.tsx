"use client";

import { useEffect, useMemo, useState } from "react";
import { starterCards } from "@/lib/cards";
import {
  EMPTY_PROGRESS,
  LearnerProgress,
  completeSession,
  loadProgress,
  recordAttempt,
  saveProgress,
} from "@/lib/progress";

const cardTypeLabels = {
  concept: "Learn",
  predict: "Predict",
  debug: "Debug",
  quiz: "Quick check",
};

const focusConcepts = ["Variables", "Data types", "Strings", "Conditionals", "Lists"];

export function LearningFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [progress, setProgress] = useState<LearnerProgress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setReady(true);
  }, []);

  const card = starterCards[currentIndex];
  const percentComplete = Math.round(((currentIndex + (revealed ? 1 : 0)) / starterCards.length) * 100);
  const accuracy = progress.totalAnswered
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;
  const level = Math.floor(progress.totalXp / 250) + 1;
  const xpIntoLevel = progress.totalXp % 250;

  const conceptMastery = useMemo(
    () =>
      focusConcepts.map((concept) => {
        const value = progress.concepts[concept];
        return {
          concept,
          percent: value?.attempts ? Math.round((value.correct / value.attempts) * 100) : 0,
        };
      }),
    [progress],
  );

  function chooseAnswer(optionId: string) {
    if (revealed) return;

    const isCorrect = optionId === card.correct_option_id;
    const earnedXp = isCorrect ? 15 : 5;
    const nextProgress = recordAttempt(progress, card.concept, isCorrect, earnedXp);

    setSelectedOption(optionId);
    setRevealed(true);
    setSessionXp((value) => value + earnedXp);
    setSessionCorrect((value) => value + (isCorrect ? 1 : 0));
    setProgress(nextProgress);
    saveProgress(nextProgress);
  }

  function continueFeed() {
    if (!revealed) return;

    if (currentIndex === starterCards.length - 1) {
      const completedProgress = completeSession(progress);
      setProgress(completedProgress);
      saveProgress(completedProgress);
      setFinished(true);
      return;
    }

    setCurrentIndex((value) => value + 1);
    setSelectedOption(null);
    setRevealed(false);
  }

  function replaySession() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setRevealed(false);
    setFinished(false);
    setSessionXp(0);
    setSessionCorrect(0);
  }

  function resetDemo() {
    window.localStorage.removeItem("bytescroll-progress-v1");
    setProgress(EMPTY_PROGRESS);
    replaySession();
  }

  if (!ready) return <main className="loading-screen">Preparing today&apos;s scroll…</main>;

  return (
    <main className="app-shell">
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="ByteScroll home">
          <span className="brand-mark">B</span>
          <span>ByteScroll</span>
        </a>
        <p className="tagline">Trade scrolling for skill.</p>
        <div className="topbar-stats">
          <span className="streak-pill"><span aria-hidden="true">◆</span> {progress.streak} day streak</span>
          <span className="avatar" aria-label="Learner profile">AM</span>
        </div>
      </header>

      <section className="dashboard" id="top">
        <aside className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Your progress</span>
              <h2>Level {level}</h2>
            </div>
            <span className="level-badge">{progress.totalXp} XP</span>
          </div>

          <div className="xp-track" aria-label={`${xpIntoLevel} of 250 XP to next level`}>
            <span style={{ width: `${(xpIntoLevel / 250) * 100}%` }} />
          </div>
          <p className="muted copy-small">{250 - xpIntoLevel} XP until Level {level + 1}</p>

          <div className="stat-grid">
            <div className="mini-stat">
              <strong>{progress.sessionsCompleted}</strong>
              <span>Sessions</span>
            </div>
            <div className="mini-stat">
              <strong>{accuracy}%</strong>
              <span>Accuracy</span>
            </div>
          </div>

          <div className="section-rule" />
          <span className="eyebrow">Learning path</span>
          <div className="path-list">
            {conceptMastery.map((item, index) => (
              <div className="path-row" key={item.concept}>
                <span className={`path-dot ${item.percent > 0 ? "active" : ""}`}>
                  {item.percent === 100 ? "✓" : index + 1}
                </span>
                <div className="path-copy">
                  <div><span>{item.concept}</span><small>{item.percent}%</small></div>
                  <div className="micro-track"><span style={{ width: `${item.percent}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="feed-column" aria-live="polite">
          <div className="daily-heading">
            <div>
              <span className="eyebrow mint">Morning mission</span>
              <h1>Your Daily 10</h1>
            </div>
            <span className="session-count">{finished ? 10 : currentIndex + 1} / {starterCards.length}</span>
          </div>
          <div className="session-track"><span style={{ width: `${finished ? 100 : percentComplete}%` }} /></div>

          {finished ? (
            <article className="learning-card completion-card">
              <div className="completion-orbit"><span>✓</span></div>
              <span className="eyebrow mint">Morning mission complete</span>
              <h2>You turned ten scrolls into progress.</h2>
              <p>Your first Python foundations session is in the books. The cards you missed can return in a future spaced-repetition review.</p>
              <div className="completion-stats">
                <div><strong>{sessionCorrect}/10</strong><span>correct</span></div>
                <div><strong>+{sessionXp}</strong><span>XP earned</span></div>
                <div><strong>{progress.streak}</strong><span>day streak</span></div>
              </div>
              <button className="primary-button" onClick={replaySession}>Replay the prototype</button>
            </article>
          ) : (
            <article className="learning-card">
              <div className="card-meta">
                <span className={`type-chip ${card.type}`}>{cardTypeLabels[card.type]}</span>
                <span className="concept-label">{card.eyebrow}</span>
              </div>

              <h2>{card.title}</h2>
              <p className="prompt">{card.prompt}</p>

              {card.code && (
                <pre className="code-block"><code>{card.code}</code></pre>
              )}

              <div className="options" role="group" aria-label="Answer choices">
                {card.options.map((option, index) => {
                  const isCorrectOption = option.id === card.correct_option_id;
                  const isSelected = option.id === selectedOption;
                  const classNames = [
                    "option-button",
                    revealed && isCorrectOption ? "correct" : "",
                    revealed && isSelected && !isCorrectOption ? "incorrect" : "",
                  ].filter(Boolean).join(" ");

                  return (
                    <button
                      className={classNames}
                      disabled={revealed}
                      key={option.id}
                      onClick={() => chooseAnswer(option.id)}
                    >
                      <span className="option-key">{String.fromCharCode(65 + index)}</span>
                      <span>{option.label}</span>
                      {revealed && isCorrectOption && <span className="answer-icon">✓</span>}
                      {revealed && isSelected && !isCorrectOption && <span className="answer-icon">×</span>}
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div className={`feedback ${selectedOption === card.correct_option_id ? "success" : "retry"}`}>
                  <div className="feedback-title">
                    <strong>{selectedOption === card.correct_option_id ? "Nicely reasoned." : "Good miss—this one will come back."}</strong>
                    <span>+{selectedOption === card.correct_option_id ? 15 : 5} XP</span>
                  </div>
                  <p>{card.explanation}</p>
                </div>
              )}

              <button className="primary-button" disabled={!revealed} onClick={continueFeed}>
                {currentIndex === starterCards.length - 1 ? "Finish session" : "Keep scrolling"}
                <span aria-hidden="true">→</span>
              </button>
            </article>
          )}

          <p className="feed-note">One intentional session. No infinite feed.</p>
        </section>

        <aside className="right-rail">
          <section className="panel morning-card">
            <span className="sun-icon" aria-hidden="true">✦</span>
            <span className="eyebrow">Why this works</span>
            <h2>Active beats passive.</h2>
            <p>You answer before the explanation appears, turning every card into a tiny retrieval practice.</p>
          </section>

          <section className="panel next-card">
            <span className="eyebrow">Up next</span>
            <div className="next-row">
              <span className="next-icon">[]</span>
              <div><strong>Python lists</strong><small>4 minute lesson</small></div>
            </div>
            <div className="next-row locked">
              <span className="next-icon">◇</span>
              <div><strong>Mini challenge</strong><small>Unlocks at Level 2</small></div>
            </div>
          </section>

          <button className="reset-button" onClick={resetDemo}>Reset prototype progress</button>
        </aside>
      </section>
    </main>
  );
}
