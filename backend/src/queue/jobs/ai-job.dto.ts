/** Job payload for evaluating a mock interview */
export interface EvaluateInterviewJobData {
  userId: number;
  company: string;
  role: string;
  questions: string[];
  answers: string[];
}

/** Job payload for generating a performance report */
export interface GenerateReportJobData {
  userId: number;
  interviewId: number;
  evaluation: string;
}

/** Job payload for AI explanation */
export interface GenerateExplanationJobData {
  concept: string;
  requestId?: string; // optional client-side correlation ID
}

/** Job payload for AI cheat sheet */
export interface GenerateCheatSheetJobData {
  topic: string;
  content: string;
  requestId?: string;
}

/** Job payload for AI practice questions */
export interface GenerateQuestionsJobData {
  topic: string;
  content: string;
  requestId?: string;
}

/** Job payload for AI roadmap */
export interface GenerateRoadmapJobData {
  weakAreas: string[];
  requestId?: string;
}

/** Job payload for generating interview questions via AI */
export interface GenerateInterviewQuestionsJobData {
  role: string;
  difficulty: string;
  company: string;
  requestId?: string;
}

/** Union type – the data field of any AI job */
export type AiJobData =
  | EvaluateInterviewJobData
  | GenerateReportJobData
  | GenerateExplanationJobData
  | GenerateCheatSheetJobData
  | GenerateQuestionsJobData
  | GenerateRoadmapJobData
  | GenerateInterviewQuestionsJobData;
