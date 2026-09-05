import { tracks, type TrackId } from "@/lib/curriculum";
import type { LearnerProgress, TrackProgress } from "@/lib/progress";
import { FlameIcon } from "@/components/app-icons";
import { dueReviewCount } from "@/lib/course-engine";

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
        <Metric label="Ready to review" value={(dueReviewCount(progress, "python") + dueReviewCount(progress, "system-design")).toString()} detail="Due memory cards" />
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
        {track.modules.map((module, index) => {
          const percent = moduleCompletionForTrack(progress, module.steps.map((step) => step.id));
          const status = moduleStatusForTrack(trackId, progress, index, percent);
          const unlocked = status !== "locked";
          return (
            <div className={`mastery-row ${unlocked ? "" : "locked"}`} key={module.id}>
              <span className="mastery-index">{percent === 100 ? "✓" : index + 1}</span>
              <div><div><strong>{module.title}</strong><small>{unlocked ? `${percent}%` : "Locked"}</small></div><div className="micro-track"><span style={{ width: `${percent}%` }} /></div></div>
            </div>
          );
        })}
      </div>
      <footer><span>{progress.sessionsCompleted} sessions</span><span>{progress.totalXp} XP</span></footer>
    </section>
  );
}

function moduleCompletionForTrack(progress: TrackProgress, stepIds: string[]): number {
  const completed = new Set(progress.completedStepIds);
  return Math.round((stepIds.filter((id) => completed.has(id)).length / stepIds.length) * 100);
}

function moduleStatusForTrack(trackId: TrackId, progress: TrackProgress, index: number, percent: number) {
  if (percent === 100) return "complete";
  if (percent > 0) return "in-progress";
  if (index === 0) return "available";
  const previous = tracks[trackId].modules[index - 1];
  return moduleCompletionForTrack(progress, previous.steps.map((step) => step.id)) >= 80 ? "available" : "locked";
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
