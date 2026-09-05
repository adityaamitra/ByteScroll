import pythonFoundationSteps from "../../../../content/python/learning-path.json";
import systemDesignFoundationSteps from "../../../../content/system-design/foundations.json";
import type { CourseModule, LearningStep, TrackId } from "@/lib/course-model";
import { pythonModules } from "@/lib/python-course";
import { systemDesignModules } from "@/lib/system-design-course";

export type {
  CourseModule,
  LearningStep,
  ModuleLevel,
  StepKind,
  StepOption,
  TrackId,
} from "@/lib/course-model";

export interface TrackDefinition {
  id: TrackId;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  icon: string;
  modules: CourseModule[];
  concepts: string[];
  upcoming: string[];
  steps: LearningStep[];
}

function withModuleId(steps: Omit<LearningStep, "moduleId">[], moduleId: string): LearningStep[] {
  return steps.map((step) => ({ ...step, moduleId }));
}

function buildTrack(
  definition: Omit<TrackDefinition, "modules" | "concepts" | "upcoming" | "steps">,
  modules: CourseModule[],
): TrackDefinition {
  validateModules(modules);
  const steps = modules.flatMap((module) => module.steps);
  return {
    ...definition,
    modules,
    steps,
    concepts: [...new Set(steps.map((step) => step.concept))],
    upcoming: modules.slice(1, 4).map((module) => module.title),
  };
}

function validateModules(modules: CourseModule[]): void {
  const moduleIds = new Set<string>();
  const stepIds = new Set<string>();
  for (const module of modules) {
    if (moduleIds.has(module.id)) throw new Error(`Duplicate module id: ${module.id}`);
    moduleIds.add(module.id);
    for (const step of module.steps) {
      if (stepIds.has(step.id)) throw new Error(`Duplicate learning card id: ${step.id}`);
      if (step.moduleId !== module.id) throw new Error(`Card ${step.id} belongs to the wrong module`);
      if (isQuestion(step) && !step.options?.some((option) => option.id === step.correct_option_id)) {
        throw new Error(`Card ${step.id} has an invalid correct answer`);
      }
      stepIds.add(step.id);
    }
  }
}

const pythonFoundation: CourseModule = {
  id: "py-foundations",
  title: "Python foundations",
  description: "Variables, types, decisions, and your first programming mental models.",
  level: "Foundations",
  steps: withModuleId(pythonFoundationSteps as Omit<LearningStep, "moduleId">[], "py-foundations"),
};

const systemDesignFoundation: CourseModule = {
  id: "sd-foundations",
  title: "System design foundations",
  description: "Requests, latency, bottlenecks, and caching from first principles.",
  level: "Foundations",
  steps: withModuleId(systemDesignFoundationSteps as Omit<LearningStep, "moduleId">[], "sd-foundations"),
};

export const tracks: Record<TrackId, TrackDefinition> = {
  python: buildTrack(
    {
      id: "python",
      name: "Python and algorithms",
      shortName: "Python",
      description: "Go from your first variable to data structures, algorithms, and interview patterns.",
      accent: "mint",
      icon: "Py",
    },
    [pythonFoundation, ...pythonModules],
  ),
  "system-design": buildTrack(
    {
      id: "system-design",
      name: "System design",
      shortName: "System Design",
      description: "Build from client-server basics to distributed systems and complete design cases.",
      accent: "violet",
      icon: "SD",
    },
    [systemDesignFoundation, ...systemDesignModules],
  ),
};

export function getStep(trackId: TrackId, stepId: string): LearningStep | undefined {
  return tracks[trackId].steps.find((step) => step.id === stepId);
}

export function isQuestion(step: LearningStep): boolean {
  return step.kind === "quiz" || step.kind === "review";
}
