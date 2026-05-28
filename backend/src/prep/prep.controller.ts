import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PrepService } from './prep.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterviewService } from '../chatbot/interview.service';
import { QueueService } from '../queue/queue.service';

@Controller('prep')
@UseGuards(JwtAuthGuard)
export class PrepController {
  constructor(
    private readonly prepService: PrepService,
    private readonly interviewService: InterviewService,
    private readonly queueService: QueueService,
  ) {}

  @Post('seed')
  async seed() {
    return this.prepService.seedMaterials();
  }

  @Get('materials')
  async getMaterials(@Query() query: any) {
    return this.prepService.getMaterials(query);
  }

  @Get('materials/:id')
  async getMaterialById(@Param('id') id: string) {
    return this.prepService.getMaterialById(Number(id));
  }

  @Post('bookmarks/:materialId')
  async toggleBookmark(@Req() req: any, @Param('materialId') materialId: string) {
    return this.prepService.toggleBookmark(req.user.userId || req.user.id, Number(materialId));
  }

  @Get('bookmarks')
  async getBookmarks(@Req() req: any) {
    return this.prepService.getBookmarks(req.user.userId || req.user.id);
  }

  @Post('progress/:materialId')
  async markProgress(@Req() req: any, @Param('materialId') materialId: string) {
    return this.prepService.markProgress(req.user.userId || req.user.id, Number(materialId));
  }

  @Get('progress')
  async getProgress(@Req() req: any) {
    return this.prepService.getProgress(req.user.userId || req.user.id);
  }

  @Post('recently-viewed/:materialId')
  async trackRecentlyViewed(@Req() req: any, @Param('materialId') materialId: string) {
    return this.prepService.trackRecentlyViewed(req.user.userId || req.user.id, Number(materialId));
  }

  @Get('recently-viewed')
  async getRecentlyViewed(@Req() req: any) {
    return this.prepService.getRecentlyViewed(req.user.userId || req.user.id);
  }

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
  // Async endpoint to generate questions via BullMQ
  @Post('questions/async')
  async generateQuestionsAsync(@Body() body: { role: string; difficulty?: string; company?: string }) {
    const role = body.role;
    const difficulty = body.difficulty ?? 'Intermediate';
    const company = body.company ?? 'Standard';
    const job = await this.queueService.enqueueGenerateQuestions({ role, difficulty, company });
    return { jobId: job.id, status: 'queued' };
  }


  @Post('submit')
  async submit(@Req() req: any, @Body() body: { role: string, company?: string, answers: any[], questions?: string[] }) {
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
      userId: req.user.userId || req.user.id,
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

  @Post('ai/explain')
  async explainConcept(@Body('concept') concept: string) {
    const job = await this.queueService.enqueueExplanation({ concept });
    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  @Post('ai/cheat-sheet')
  async generateCheatSheet(@Body() body: { topic: string; content: string }) {
    const job = await this.queueService.enqueueCheatSheet({
      topic: body.topic,
      content: body.content,
    });
    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  @Post('ai/questions')
  async generatePracticeQuestions(@Body() body: { topic: string; content: string }) {
    const job = await this.queueService.enqueueQuestions({
      topic: body.topic,
      content: body.content,
    });
    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  @Post('ai/roadmap')
  async generateRoadmap(@Body('weakAreas') weakAreas: string[]) {
    const job = await this.queueService.enqueueRoadmap({
      weakAreas: weakAreas || [],
    });
    return {
      jobId: job.id,
      status: 'queued',
    };
  }
}
