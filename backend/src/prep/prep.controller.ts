import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PrepService } from './prep.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterviewService } from '../chatbot/interview.service';

@Controller('prep')
@UseGuards(JwtAuthGuard)
export class PrepController {
  constructor(
    private readonly prepService: PrepService,
    private readonly interviewService: InterviewService,
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
    const data = await this.interviewService.generateQuestionsWithMeta({ role, difficulty, company });
    return data.questions.map(q => ({
      id: q.id,
      question: q.question,
      type: 'text'
    }));
  }

  @Post('submit')
  async submit(@Req() req: any, @Body() body: { role: string, company?: string, answers: { questionId: number, question: string, answer: string }[] }) {
    const formattedAnswers = body.answers.map(a => ({
      question: a.question,
      userAnswer: a.answer
    }));
    return this.interviewService.analyze(req.user.userId, {
      company: body.company || 'Standard',
      role: body.role,
      answers: formattedAnswers
    });
  }

  @Post('ai/explain')
  async explainConcept(@Body('concept') concept: string) {
    return this.prepService.generateExplanation(concept);
  }

  @Post('ai/cheat-sheet')
  async generateCheatSheet(@Body() body: { topic: string; content: string }) {
    return this.prepService.generateCheatSheet(body.topic, body.content);
  }

  @Post('ai/questions')
  async generatePracticeQuestions(@Body() body: { topic: string; content: string }) {
    return this.prepService.generatePracticeQuestions(body.topic, body.content);
  }

  @Post('ai/roadmap')
  async generateRoadmap(@Body('weakAreas') weakAreas: string[]) {
    return this.prepService.generateRoadmap(weakAreas || []);
  }
}
