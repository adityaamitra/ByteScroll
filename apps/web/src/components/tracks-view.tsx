import { ArrowIcon, CheckIcon, LockIcon } from "@/components/app-icons";
import { isModuleUnlocked, moduleCompletion, moduleStatus } from "@/lib/course-engine";
import { tracks, type TrackId } from "@/lib/curriculum";
import type { LearnerProgress } from "@/lib/progress";

export function TracksView({
  progress,
  onSelect,
}: {
  progress: LearnerProgress;
  onSelect: (track: TrackId, moduleId: string) => void;
}) {
  return (
    <section className="view-page tracks-view">
      <header className="view-header simple"><div><span className="overline accent">Learning paths</span><h1>Choose what to understand next.</h1><p>Python grows into DSA. System Design grows into distributed systems and full interview cases.</p></div></header>
      <div className="track-card-grid">
        {(Object.keys(tracks) as TrackId[]).map((trackId) => {
          const track = tracks[trackId];
          const trackProgress = progress.tracks[trackId];
          const complete = trackProgress.completedStepIds.length;
          const percent = Math.min(100, Math.round((complete / track.steps.length) * 100));
          return (
            <article className={`track-card surface-panel ${track.accent}`} key={trackId}>
              <div className="track-card-top"><span className="track-glyph large">{track.icon}</span>{progress.activeTrack === trackId && <span className="current-chip"><CheckIcon /> Current track</span>}</div>
              <h2>{track.name}</h2>
              <p>{track.description}</p>
              <div className="track-card-progress"><div><span>{complete} of {track.steps.length} cards</span><strong>{percent}%</strong></div><div className="large-progress"><span style={{ width: `${percent}%` }} /></div></div>

              <div className="module-list">
                {track.modules.map((module, index) => {
                  const unlocked = isModuleUnlocked(progress, trackId, index);
                  const completion = moduleCompletion(progress, trackId, module);
                  const status = moduleStatus(progress, trackId, module, index);
                  const selected = trackProgress.selectedModuleId === module.id;
                  return (
                    <button className={`module-row ${selected ? "selected" : ""}`} disabled={!unlocked} onClick={() => onSelect(trackId, module.id)} key={module.id}>
                      <span className="module-index">{!unlocked ? <LockIcon /> : completion === 100 ? <CheckIcon /> : index + 1}</span>
                      <span className="module-copy"><strong>{module.title}</strong><small>{module.level} · {status === "locked" ? "Complete the previous module" : `${completion}% complete`}</small></span>
                      {unlocked && <ArrowIcon />}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
