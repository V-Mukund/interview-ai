import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private interviewService: InterviewService) {}

  @UseGuards(JwtAuthGuard)
  @Get('interview-stats')
  async getInterviewStats(@Req() req) {
    return this.interviewService.getDashboardInterviewStats(req.user.userId);
  }
}
