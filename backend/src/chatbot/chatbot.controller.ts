import { Controller, Post, Body, Get, UseGuards, Req, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @UseGuards(JwtAuthGuard)
  @Post('message')
  async handleMessage(@Req() req, @Body() body: { message: string, role?: string, difficulty?: string, conversationId?: number }) {
    const thread = await this.chatbotService.saveMessageToThread(req.user.userId, body.message, 'user', body.role, body.difficulty, body.conversationId);
    const aiResponse = await this.chatbotService.getResponse(body.message, body.role, body.difficulty);
    await this.chatbotService.saveMessageToThread(req.user.userId, aiResponse, 'bot', body.role, body.difficulty, thread.id);
    return { response: aiResponse, conversationId: thread.id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req) { return this.chatbotService.getHistory(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Delete('clear')
  async clearHistory(@Req() req) { await this.chatbotService.clearHistory(req.user.userId); return { message: 'History cleared' }; }

  @UseGuards(JwtAuthGuard)
  @Post('delete-multiple')
  async deleteMultiple(@Req() req, @Body() body: { ids: number[] }) { await this.chatbotService.deleteMultiple(req.user.userId, body.ids); return { message: 'Deleted' }; }
}
