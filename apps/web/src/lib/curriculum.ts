import pythonSteps from "../../../../content/python/learning-path.json";
import systemDesignSteps from "../../../../content/system-design/foundations.json";

export type TrackId = "python" | "system-design";
export type StepKind = "learn" | "example" | "quiz" | "review";

export interface StepOption {
  id: string;
  label: string;
}

export interface LearningStep {
  id: string;
  kind: StepKind;
  concept: string;
  title: string;
  body: string;
  code?: string;
  visual?: string;
  takeaway?: string;
  options?: StepOption[];
  correct_option_id?: string;
  explanation?: string;
  wrong_feedback?: Record<string, string>;
  hint?: string;
  xp: number;
}

export interface TrackDefinition {
  id: TrackId;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  icon: string;
  concepts: string[];
  upcoming: string[];
  steps: LearningStep[];
}

export const tracks: Record<TrackId, TrackDefinition> = {
  python: {
    id: "python",
    name: "Python foundations",
    shortName: "Python",
    description: "Build programming intuition one tiny program at a time.",
    accent: "mint",
    icon: "Py",
    concepts: ["Variables", "Data types", "Conditionals", "Loops", "Functions", "Collections", "OOP"],
    upcoming: ["Loops", "Functions", "Lists"],
    steps: pythonSteps as LearningStep[],
  },
  "system-design": {
    id: "system-design",
    name: "System design foundations",
    shortName: "System Design",
    description: "Understand how reliable software grows from one request to millions.",
    accent: "violet",
    icon: "SD",
    concepts: ["Client and server", "Performance", "Caching", "Databases", "Load balancing", "Queues", "Scaling"],
    upcoming: ["Databases", "Load balancing", "Message queues"],
    steps: systemDesignSteps as LearningStep[],
  },
};

export function isQuestion(step: LearningStep): boolean {
  return step.kind === "quiz" || step.kind === "review";
}
