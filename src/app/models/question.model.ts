// ==========================================
// FILE: src/app/models/question.model.ts
// ==========================================

export interface Answer {
  text: string;
  correct: boolean;
}

export interface Question {
  id: number;
  question: string;
  answer: Answer[];
}

export interface GameState {
  playerName: string;
  language: string;
  category: string;
  subcategory: string;
  currentQuestion: number;
  score: number;
  lifelines: Lifelines;
  questions: Question[];
}

export interface Lifelines {
  fiftyFifty: boolean;
  askAudience: boolean;
  askExpert: boolean;
  flipQuestion: boolean;
  extraTime: boolean;
  doubleChance: boolean;
}

