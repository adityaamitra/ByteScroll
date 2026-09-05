"use client";

import { useState } from "react";
import type { TrackId } from "@/lib/curriculum";
import type { LearnerSettings } from "@/lib/progress";
import { ArrowIcon, CheckIcon } from "@/components/app-icons";

interface OnboardingProps {
  onComplete: (value: {
    activeTrack: TrackId;
    experience: LearnerSettings["experience"];
    dailyGoal: LearnerSettings["dailyGoal"];
  }) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [track, setTrack] = useState<TrackId>("python");
  const [experience, setExperience] = useState<LearnerSettings["experience"]>("new");
  const [dailyGoal, setDailyGoal] = useState<LearnerSettings["dailyGoal"]>(10);

  return (
    <main className="onboarding-shell">
      <section className="onboarding-card">
        <div className="onboarding-brand"><span className="brand-mark">B</span><span>ByteScroll</span></div>
        <span className="overline accent">Set your starting point</span>
        <h1>Turn your next scrolls into a skill.</h1>
        <p className="onboarding-intro">Pick a track and pace. You can change both whenever you want.</p>

        <fieldset className="choice-group">
          <legend>What do you want to learn first?</legend>
          <div className="choice-grid two">
            <ChoiceCard selected={track === "python"} onClick={() => setTrack("python")} icon="Py" title="Python" detail="Start with variables" />
            <ChoiceCard selected={track === "system-design"} onClick={() => setTrack("system-design")} icon="SD" title="System Design" detail="Start with requests" />
          </div>
        </fieldset>

        <fieldset className="choice-group compact">
          <legend>Where are you starting?</legend>
          <div className="segmented-control">
            <button className={experience === "new" ? "selected" : ""} onClick={() => setExperience("new")}>From scratch</button>
            <button className={experience === "some" ? "selected" : ""} onClick={() => setExperience("some")}>I know a little</button>
          </div>
        </fieldset>

        <fieldset className="choice-group compact">
          <legend>Daily goal</legend>
          <div className="segmented-control goals">
            {([5, 10, 20] as const).map((cards) => (
              <button className={dailyGoal === cards ? "selected" : ""} onClick={() => setDailyGoal(cards)} key={cards}>{cards} cards</button>
            ))}
          </div>
        </fieldset>

        <button className="primary-button onboarding-action" onClick={() => onComplete({ activeTrack: track, experience, dailyGoal })}>
          Start my first lesson <ArrowIcon />
        </button>
        <p className="privacy-note"><CheckIcon /> No account required. Progress starts on this device.</p>
      </section>
    </main>
  );
}

function ChoiceCard({ selected, onClick, icon, title, detail }: { selected: boolean; onClick: () => void; icon: string; title: string; detail: string }) {
  return (
    <button className={`choice-card ${selected ? "selected" : ""}`} onClick={onClick} type="button">
      <span className="track-glyph">{icon}</span>
      <span><strong>{title}</strong><small>{detail}</small></span>
      <span className="choice-check">{selected ? "✓" : ""}</span>
    </button>
  );
}
