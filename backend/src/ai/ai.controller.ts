import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async handleChatPrompt(@Body() body: { prompt: string }) {
    const { prompt } = body;
    const response = await this.aiService.generateChatResponse(prompt);
    return { response };
  }
}
