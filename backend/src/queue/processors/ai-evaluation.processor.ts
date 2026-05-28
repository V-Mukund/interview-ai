import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import { EvaluateInterviewJobData, GenerateInterviewQuestionsJobData } from '../jobs/ai-job.dto';
import { InterviewService } from '../../chatbot/interview.service';

/**
 * Processes all jobs on the "ai-evaluation" queue.
 * Heavy AI operations (interview evaluation, report generation, question generation)
 * run here in the background so the HTTP response is instant.
 */
@Processor(QUEUE_NAMES.AI_EVALUATION)
export class AiEvaluationProcessor extends WorkerHost {
  private readonly logger = new Logger(AiEvaluationProcessor.name);

  constructor(
    @Inject(forwardRef(() => InterviewService))
    private readonly interviewService: InterviewService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job [${job.name}] id=${job.id}`);

    switch (job.name) {
      case JOB_NAMES.EVALUATE_INTERVIEW:
        return this.handleEvaluateInterview(job as Job<EvaluateInterviewJobData>);

      case JOB_NAMES.GENERATE_QUESTIONS:
        return this.handleGenerateInterviewQuestions(job as Job<GenerateInterviewQuestionsJobData>);

      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        return null;
    }
  }

  /**
   * Calls the InterviewService.analyze to evaluate a user's mock interview answers.
   * Saves the result to the DB and returns the full grading payload.
   */
  private async handleEvaluateInterview(
    job: Job<EvaluateInterviewJobData>,
  ): Promise<any> {
    const { company, role, questions, answers, userId } = job.data;

    this.logger.log(
      `Evaluating interview for userId=${userId} | role=${role} | company=${company}`,
    );

    const formattedAnswers = questions.map((q, i) => ({
      question: q,
      userAnswer: answers[i] || '',
    }));

    try {
      const result = await this.interviewService.analyze(userId, {
        company,
        role,
        answers: formattedAnswers,
      });
      return result;
    } catch (err: any) {
      this.logger.error(`AI evaluation background job failed: ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * Calls InterviewService.generateQuestionsWithMeta to generate interview questions via AI.
   * Returns the full questions payload with metadata.
   */
  private async handleGenerateInterviewQuestions(
    job: Job<GenerateInterviewQuestionsJobData>,
  ): Promise<any> {
    const { role, difficulty, company } = job.data;

    this.logger.log(
      `Generating interview questions | role=${role} | company=${company} | difficulty=${difficulty}`,
    );

    try {
      const result = await this.interviewService.generateQuestionsWithMeta({
        role,
        difficulty,
        company,
      });
      return result;
    } catch (err: any) {
      this.logger.error(`Interview question generation failed: ${err.message}`, err.stack);
      throw err;
    }
  }
}

