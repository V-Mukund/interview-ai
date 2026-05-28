import { Controller, Post, Get, Body, Query, UseGuards, Req, Param, Delete } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QueueService } from '../queue/queue.service';

@Controller(['interview', 'api/interview', 'api/interviews'])
export class InterviewController {
  constructor(
    private readonly interviewService: InterviewService,
    private readonly queueService: QueueService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req) {
    return this.interviewService.getHistory(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':interviewId/performance')
  async getPerformance(@Req() req, @Param('interviewId') interviewId: string) {
    return this.interviewService.getPerformance(req.user.userId, parseInt(interviewId));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history')
  async deleteHistory(@Req() req, @Body() body: { interviewIds: (string | number)[] }) {
    return this.interviewService.deleteHistory(req.user.userId, body.interviewIds || []);
  }

  @UseGuards(JwtAuthGuard)
  @Get('questions')
  async getQuestions(
    @Query('role') role: string,
    @Query('difficulty') difficulty = 'Intermediate',
    @Query('company') company = 'Standard'
  ) {
    const job = await this.queueService.enqueueGenerateQuestions({ role, difficulty, company });
    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async start(@Body() body: { role: string, difficulty: string, company: string }) {
    const job = await this.queueService.enqueueGenerateQuestions({
      role: body.role,
      difficulty: body.difficulty,
      company: body.company,
    });
    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('start-with-meta')
  async startWithMeta(@Body() body: { role: string, difficulty: string, company: string }) {
    const job = await this.queueService.enqueueGenerateQuestions({
      role: body.role,
      difficulty: body.difficulty,
      company: body.company,
    });
    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submit(@Req() req, @Body() body: { role: string, company?: string, answers: any[], questions?: string[] }) {
    let questions: string[] = [];
    let answers: string[] = [];
    if (Array.isArray(body.answers) && body.answers.length > 0) {
      if (typeof body.answers[0] === 'string') {
        answers = body.answers;
        questions = body.questions || [];
      } else {
        questions = body.answers.map(a => a.question);
        answers = body.answers.map(a => a.answer || a.userAnswer || '');
      }
    }
    const job = await this.queueService.enqueueEvaluation({
      userId: req.user.userId,
      company: body.company || 'Standard',
      role: body.role,
      questions,
      answers,
    });
    return {
      jobId: job.id,
      status: 'queued',
      message: 'Your interview is being evaluated in the background.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  async analyze(@Req() req, @Body() body: { company: string, role: string, answers: any[], questions?: string[] }) {
    let questions: string[] = [];
    let answers: string[] = [];
    if (Array.isArray(body.answers) && body.answers.length > 0) {
      if (typeof body.answers[0] === 'string') {
        answers = body.answers;
        questions = body.questions || [];
      } else {
        questions = body.answers.map(a => a.question);
        answers = body.answers.map(a => a.answer || a.userAnswer || '');
      }
    }
    const job = await this.queueService.enqueueEvaluation({
      userId: req.user.userId,
      company: body.company,
      role: body.role,
      questions,
      answers,
    });
    return {
      jobId: job.id,
      status: 'queued',
      message: 'Your interview is being evaluated in the background.',
    };
  }
}
