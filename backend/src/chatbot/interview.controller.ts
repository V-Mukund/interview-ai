import { Controller, Post, Get, Body, Query, UseGuards, Req, Param, Delete } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller(['interview', 'api/interview', 'api/interviews'])
export class InterviewController {
  constructor(private interviewService: InterviewService) {}

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
    const data = await this.interviewService.generateQuestionsWithMeta({ role, difficulty, company });
    return data.questions.map(q => ({
      id: q.id,
      question: q.question,
      type: 'text'
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async start(@Body() body: { role: string, difficulty: string, company: string }) {
    const questions = await this.interviewService.generateQuestions(body);
    return { questions };
  }

  @UseGuards(JwtAuthGuard)
  @Post('start-with-meta')
  async startWithMeta(@Body() body: { role: string, difficulty: string, company: string }) {
    return this.interviewService.generateQuestionsWithMeta(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submit(@Req() req, @Body() body: { role: string, company?: string, answers: { questionId: number, question: string, answer: string }[] }) {
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

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  async analyze(@Req() req, @Body() body: { company: string, role: string, answers: { question: string, userAnswer: string }[] }) {
    return this.interviewService.analyze(req.user.userId, body);
  }
}
