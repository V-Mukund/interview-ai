import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EvaluateInterviewJobData } from './jobs/ai-job.dto';

/**
 * Exposes HTTP endpoints for enqueueing and polling background AI jobs.
 *
 * POST /queue/evaluate       – enqueue an interview evaluation job
 * GET  /queue/status/:jobId  – poll any job's state + result
 * GET  /queue/health         – view queue counts (admin/monitoring)
 */
@Controller('queue')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Enqueue an interview evaluation job.
   * Returns immediately with the job ID so the client can poll.
   *
   * @example
   *   POST /queue/evaluate
   *   Body: { userId, company, role, questions[], answers[] }
   *   → { jobId: "42", status: "queued" }
   */
  @Post('evaluate')
  async enqueueEvaluation(@Body() data: EvaluateInterviewJobData) {
    const job = await this.queueService.enqueueEvaluation(data);
    return {
      jobId:   job.id,
      status:  'queued',
      message: 'Your interview is being evaluated in the background.',
    };
  }

  /**
   * Poll the status and result of any background job.
   *
   * @example
   *   GET /queue/status/42
   *   → { id: "42", state: "completed", result: { evaluation: "...", score: 85 } }
   *
   * Possible states: waiting | active | completed | failed | delayed | not_found
   */
  @Get('status/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.queueService.getJobStatus(jobId);
  }

  @Post('questions')
  async enqueueQuestions(@Body() body: { role: string; company?: string; difficulty?: string }) {
    const role = body.role;
    const company = body.company || 'Standard';
    const difficulty = body.difficulty || 'Intermediate';
    const job = await this.queueService.enqueueGenerateQuestions({ role, difficulty, company });
    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  @Get('jobs/:jobId/status')
  async getJobStatusOnly(@Param('jobId') jobId: string) {
    const status = await this.queueService.getJobStatus(jobId);
    return {
      jobId,
      status: status.state,
      state: status.state,
    };
  }

  @Get('jobs/:jobId/result')
  async getJobResultOnly(@Param('jobId') jobId: string) {
    const status = await this.queueService.getJobStatus(jobId);
    return status.result || {};
  }

  /**
   * Queue health endpoint — returns job counts for each queue.
   * Useful for monitoring dashboards.
   *
   * @example
   *   GET /queue/health
   *   → { "ai-evaluation": { waiting: 0, active: 1, completed: 42, failed: 0 } }
   */
  @Get('health')
  async getHealth() {
    return this.queueService.getQueueHealth();
  }
}
