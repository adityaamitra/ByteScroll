import { tracks, type TrackId } from "@/lib/curriculum";
import type { LearnerProgress, TrackProgress } from "@/lib/progress";
import { FlameIcon } from "@/components/app-icons";

export function ProgressView({ progress }: { progress: LearnerProgress }) {
  const totalXp = progress.tracks.python.totalXp + progress.tracks["system-design"].totalXp;
  const totalAnswered = progress.tracks.python.totalAnswered + progress.tracks["system-design"].totalAnswered;
  const totalCorrect = progress.tracks.python.totalCorrect + progress.tracks["system-design"].totalCorrect;
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <section className="view-page progress-view">
      <header className="view-header">
        <div><span className="overline accent">Your progress</span><h1>Small steps, visible growth.</h1></div>
        <div className="streak-card"><FlameIcon /><strong>{progress.streak}</strong><span>day streak</span></div>
      </header>

      <div className="metric-grid">
        <Metric label="Total XP" value={totalXp.toLocaleString()} detail={`Level ${Math.floor(totalXp / 250) + 1}`} />
        <Metric label="Learning days" value={progress.totalLearningDays.toString()} detail="Across both tracks" />
        <Metric label="Accuracy" value={`${accuracy}%`} detail={`${totalAnswered} answers`} />
        <Metric label="Ready to review" value={(progress.tracks.python.reviewQueue.length + progress.tracks["system-design"].reviewQueue.length).toString()} detail="Scheduled cards" />
      </div>

      <section className="activity-panel surface-panel">
        <div className="section-heading"><div><span className="overline">Last 7 days</span><h2>Learning activity</h2></div><span className="quiet-label">Your timezone</span></div>
        <ActivityStrip activeDates={progress.activityDates} />
      </section>

      <div className="track-progress-grid">
        {(Object.keys(tracks) as TrackId[]).map((trackId) => (
          <TrackMastery key={trackId} trackId={trackId} progress={progress.tracks[trackId]} />
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="metric-card surface-panel"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function TrackMastery({ trackId, progress }: { trackId: TrackId; progress: TrackProgress }) {
  const track = tracks[trackId];
  const completion = Math.min(100, Math.round((progress.completedStepIds.length / track.steps.length) * 100));

  return (
    <section className={`surface-panel mastery-panel ${track.accent}`}>
      <div className="track-title-row"><span className="track-glyph">{track.icon}</span><div><span className="overline">{completion}% path complete</span><h2>{track.shortName}</h2></div></div>
      <div className="large-progress"><span style={{ width: `${completion}%` }} /></div>
      <div className="mastery-list">
        {track.concepts.slice(0, 5).map((concept, index) => {
          const record = progress.concepts[concept];
          const percent = masteryPercent(record);
          const unlocked = index < 3 || Boolean(record);
          return (
            <div className={`mastery-row ${unlocked ? "" : "locked"}`} key={concept}>
              <span className="mastery-index">{percent === 100 ? "✓" : index + 1}</span>
              <div><div><strong>{concept}</strong><small>{unlocked ? `${percent}%` : "Locked"}</small></div><div className="micro-track"><span style={{ width: `${percent}%` }} /></div></div>
            </div>
          );
        })}
      </div>
      <footer><span>{progress.sessionsCompleted} sessions</span><span>{progress.totalXp} XP</span></footer>
    </section>
  );
}

function masteryPercent(record: TrackProgress["concepts"][string] | undefined): number {
  if (!record) return 0;
  if (!record.attempts) return Math.min(35, record.seen * 15);
  return Math.round((record.correct / record.attempts) * 100);
}

function ActivityStrip({ activeDates }: { activeDates: string[] }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { key, label: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2), active: activeDates.includes(key), today: index === 6 };
  });

  return <div className="activity-strip">{days.map((day) => <div key={day.key}><span className={`${day.active ? "active" : ""} ${day.today ? "today" : ""}`}>{day.active ? "✓" : ""}</span><small>{day.label}</small></div>)}</div>;
}
