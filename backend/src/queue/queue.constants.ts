/** All BullMQ queue names used in the application */
export const QUEUE_NAMES = {
  AI_EVALUATION: 'ai-evaluation',
  AI_EXPLANATION: 'ai-explanation',
  AI_CHEATSHEET:  'ai-cheatsheet',
  AI_ROADMAP:     'ai-roadmap',
} as const;

/** All job name constants (per queue) */
export const JOB_NAMES = {
  // ai-evaluation queue
  EVALUATE_INTERVIEW:         'evaluate-interview',
  GENERATE_REPORT:            'generate-report',
  GENERATE_QUESTIONS:         'generate-questions',

  // ai-explanation queue
  GENERATE_EXPLANATION:       'generate-explanation',
  GENERATE_CHEATSHEET:        'generate-cheatsheet',
  GENERATE_PRACTICE_QUESTIONS:'generate-practice-questions',
  GENERATE_ROADMAP:           'generate-roadmap',
} as const;
