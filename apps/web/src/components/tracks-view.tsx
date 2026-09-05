import { tracks, type TrackId } from "@/lib/curriculum";
import type { LearnerProgress } from "@/lib/progress";
import { ArrowIcon, CheckIcon, LockIcon } from "@/components/app-icons";

export function TracksView({ progress, onSelect }: { progress: LearnerProgress; onSelect: (track: TrackId) => void }) {
  return (
    <section className="view-page tracks-view">
      <header className="view-header simple"><div><span className="overline accent">Learning tracks</span><h1>Choose what to understand next.</h1><p>Each track keeps its own place, mastery, and review queue.</p></div></header>
      <div className="track-card-grid">
        {(Object.keys(tracks) as TrackId[]).map((trackId) => {
          const track = tracks[trackId];
          const trackProgress = progress.tracks[trackId];
          const complete = trackProgress.completedStepIds.length;
          const percent = Math.min(100, Math.round((complete / track.steps.length) * 100));
          return (
            <article className={`track-card surface-panel ${track.accent}`} key={trackId}>
              <div className="track-card-top"><span className="track-glyph large">{track.icon}</span>{progress.activeTrack === trackId && <span className="current-chip"><CheckIcon /> Current</span>}</div>
              <h2>{track.name}</h2>
              <p>{track.description}</p>
              <div className="track-card-progress"><div><span>{complete} of {track.steps.length} cards</span><strong>{percent}%</strong></div><div className="large-progress"><span style={{ width: `${percent}%` }} /></div></div>
              <div className="curriculum-preview">
                {track.concepts.slice(0, 4).map((concept, index) => <div key={concept}><span>{index < 3 ? index + 1 : <LockIcon />}</span><strong>{concept}</strong></div>)}
              </div>
              <button className="secondary-button" onClick={() => onSelect(trackId)}>{complete ? "Continue track" : "Start track"}<ArrowIcon /></button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
