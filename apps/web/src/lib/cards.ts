import rawCards from "../../../../content/python/foundations.json";

export type CardType = "concept" | "predict" | "debug" | "quiz";

export interface CardOption {
  id: string;
  label: string;
}

export interface LessonCard {
  id: string;
  type: CardType;
  level: "beginner";
  concept: string;
  eyebrow: string;
  title: string;
  prompt: string;
  code?: string;
  options: CardOption[];
  correct_option_id: string;
  explanation: string;
}

export const starterCards = rawCards as LessonCard[];
