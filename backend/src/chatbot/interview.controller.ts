import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('interview')
export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async start(@Body() body: { role: string, difficulty: string, company: string }) {
    const questions = await this.interviewService.generateQuestions(body);
    return { questions };
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submit(@Req() req, @Body() body: { company: string, role: string, questions: string[], answers: string[] }) {
    return this.interviewService.evaluate(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  async analyze(@Req() req, @Body() body: { company: string, role: string, answers: { question: string, userAnswer: string }[] }) {
    return this.interviewService.analyze(req.user.userId, body);
  }
}
