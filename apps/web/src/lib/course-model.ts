export type TrackId = "python" | "system-design";
export type StepKind = "learn" | "example" | "quiz" | "review";
export type ModuleLevel = "Foundations" | "Intermediate" | "Advanced" | "Interview practice";

export interface StepOption {
  id: string;
  label: string;
}

export interface LearningStep {
  id: string;
  moduleId: string;
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

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  level: ModuleLevel;
  steps: LearningStep[];
}

export interface UnitSeed {
  id: string;
  concept: string;
  teachTitle: string;
  teachBody: string;
  takeaway: string;
  exampleTitle: string;
  exampleBody: string;
  sample: string;
  format?: "code" | "visual";
  question: string;
  questionSample?: string;
  options: [string, string, string];
  answer: 0 | 1 | 2;
  explanation: string;
  hint: string;
}

export function buildModule(
  meta: Omit<CourseModule, "steps">,
  units: UnitSeed[],
): CourseModule {
  return {
    ...meta,
    steps: units.flatMap((unit) => buildUnit(meta.id, unit)),
  };
}

function buildUnit(moduleId: string, unit: UnitSeed): LearningStep[] {
  const optionIds = ["a", "b", "c"] as const;
  const correctId = optionIds[unit.answer];
  const options = unit.options.map((label, index) => ({ id: optionIds[index], label }));
  const wrongFeedback = Object.fromEntries(
    optionIds
      .filter((id) => id !== correctId)
      .map((id) => [id, `Not quite. ${unit.explanation}`]),
  );
  const exampleMedia = unit.format === "visual" ? { visual: unit.sample } : { code: unit.sample };
  const questionMedia = unit.questionSample
    ? unit.format === "visual"
      ? { visual: unit.questionSample }
      : { code: unit.questionSample }
    : {};

  return [
    {
      id: `${unit.id}-learn`,
      moduleId,
      kind: "learn",
      concept: unit.concept,
      title: unit.teachTitle,
      body: unit.teachBody,
      takeaway: unit.takeaway,
      xp: 5,
    },
    {
      id: `${unit.id}-example`,
      moduleId,
      kind: "example",
      concept: unit.concept,
      title: unit.exampleTitle,
      body: unit.exampleBody,
      takeaway: unit.takeaway,
      ...exampleMedia,
      xp: 5,
    },
    {
      id: `${unit.id}-quiz`,
      moduleId,
      kind: "quiz",
      concept: unit.concept,
      title: "Your turn",
      body: unit.question,
      options,
      correct_option_id: correctId,
      explanation: unit.explanation,
      wrong_feedback: wrongFeedback,
      hint: unit.hint,
      ...questionMedia,
      xp: 15,
    },
  ];
}
