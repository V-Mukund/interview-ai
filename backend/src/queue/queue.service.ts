import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from './queue.constants';
import {
  EvaluateInterviewJobData,
  GenerateExplanationJobData,
  GenerateCheatSheetJobData,
  GenerateQuestionsJobData,
  GenerateRoadmapJobData,
  GenerateInterviewQuestionsJobData,
} from './jobs/ai-job.dto';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.AI_EVALUATION)
    private readonly evaluationQueue: Queue,

    @InjectQueue(QUEUE_NAMES.AI_EXPLANATION)
    private readonly prepQueue: Queue,
  ) {}

  // ─── EVALUATION JOBS ──────────────────────────────────────────────────────

  /**
   * Enqueue an interview evaluation job.
   * Returns the BullMQ Job ID immediately so the client can poll.
   */
  async enqueueEvaluation(data: EvaluateInterviewJobData): Promise<Job> {
    const job = await this.evaluationQueue.add(
      JOB_NAMES.EVALUATE_INTERVIEW,
      data,
      {
        attempts: 3,                      // retry up to 3 times
        backoff: { type: 'exponential', delay: 2000 }, // 2s, 4s, 8s
        removeOnComplete: { age: 3600 },  // keep completed jobs for 1 hour
        removeOnFail:     { age: 86400 }, // keep failed jobs for 24 hours
      },
    );
    this.logger.log(`Enqueued evaluation job id=${job.id}`);
    return job;
  }

  /**
   * Enqueue an interview question generation job.
   * Returns the BullMQ Job ID immediately so the client can poll.
   */
  async enqueueGenerateQuestions(data: GenerateInterviewQuestionsJobData): Promise<Job> {
    const job = await this.evaluationQueue.add(
      JOB_NAMES.GENERATE_QUESTIONS,
      data,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { age: 7200 },
      },
    );
    this.logger.log(`Enqueued interview-questions job id=${job.id} role=${data.role} company=${data.company}`);
    return job;
  }

  // ─── PREP AI JOBS ─────────────────────────────────────────────────────────

  async enqueueExplanation(data: GenerateExplanationJobData): Promise<Job> {
    const job = await this.prepQueue.add(JOB_NAMES.GENERATE_EXPLANATION, data, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 7200 },
    });
    this.logger.log(`Enqueued explanation job id=${job.id}`);
    return job;
  }

  async enqueueCheatSheet(data: GenerateCheatSheetJobData): Promise<Job> {
    const job = await this.prepQueue.add(JOB_NAMES.GENERATE_CHEATSHEET, data, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 7200 },
    });
    this.logger.log(`Enqueued cheat-sheet job id=${job.id}`);
    return job;
  }

  async enqueueQuestions(data: GenerateQuestionsJobData): Promise<Job> {
    const job = await this.prepQueue.add(JOB_NAMES.GENERATE_PRACTICE_QUESTIONS, data, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 7200 },
    });
    this.logger.log(`Enqueued practice-questions job id=${job.id}`);
    return job;
  }

  async enqueueRoadmap(data: GenerateRoadmapJobData): Promise<Job> {
    const job = await this.prepQueue.add(JOB_NAMES.GENERATE_ROADMAP, data, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 7200 },
    });
    this.logger.log(`Enqueued roadmap job id=${job.id}`);
    return job;
  }

  // ─── JOB STATUS HELPERS ──────────────────────────────────────────────────

  /**
   * Get the current state and result of any job across both queues.
   */
  async getJobStatus(jobId: string): Promise<{
    id: string;
    state: string;
    result?: any;
    failedReason?: string;
    progress?: number | object | string | boolean;
  }> {
    // Try evaluation queue first, then prep queue
    let job: Job | undefined =
      (await this.evaluationQueue.getJob(jobId)) ??
      (await this.prepQueue.getJob(jobId));

    if (!job) {
      return { id: jobId, state: 'not_found' };
    }

    const state = await job.getState();
    return {
      id:            job.id as string,
      state,
      result:        job.returnvalue ?? null,
      failedReason:  job.failedReason ?? null,
      progress:      job.progress,
    };
  }

  /** Retrieve counts for queue monitoring / health check */
  async getQueueHealth() {
    const [evalCounts, prepCounts] = await Promise.all([
      this.evaluationQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
      this.prepQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
    ]);

    return {
      [QUEUE_NAMES.AI_EVALUATION]: evalCounts,
      [QUEUE_NAMES.AI_EXPLANATION]: prepCounts,
    };
  }
}
