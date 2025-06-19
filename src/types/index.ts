// TypeScript types for the application

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface MCQQuestion {
  question: string;
  options: Record<string, string>; // {"a": "option1", "b": "option2", etc.}
  correct_answer: string;
  explanation: string;
}

export interface MCQGenerateRequest {
  text: string;
  num_questions: number;
  subject: string;
  difficulty: 'simple' | 'moderate' | 'complex';
}

export interface MCQGenerateResponse {
  questions: MCQQuestion[];
  review: string;
  metadata: Record<string, any>;
}

export interface QuizSet {
  id: number;
  title: string;
  description?: string;
  subject: string;
  difficulty: string;
  total_questions: number;
  creator_id: number;
  is_public: boolean;
  created_at: string;
}

export interface QuizSetDetail extends QuizSet {
  questions: MCQQuestion[];
  source_text: string;
}

export interface QuizAttempt {
  id: number;
  score: number;
  total_questions: number;
  time_taken: number;
  completed_at: string;
}

export interface QuizResult {
  attempt: QuizAttempt;
  correct_answers: Record<string, string>;
  explanations: Record<string, string>;
  percentage: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
