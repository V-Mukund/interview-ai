import { Injectable, BadRequestException, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async generateChatResponse(prompt: string): Promise<string> {
    if (!prompt || prompt.trim().length === 0) throw new BadRequestException('Message cannot be empty');

    const input = prompt.toLowerCase();
    
    // Purely local rule-based response system
    if (input.includes('hello') || input.includes('hi')) {
      return "Hello! I am your Technical Interview Assistant. I can help you prepare for challenges in Frontend, Backend, and Fullstack roles. Would you like to start a mock interview?";
    }

    if (input.includes('help')) {
      return "I specialize in technical interview preparation. Select 'Mock Interview' from the dashboard to begin a standardized challenge tailored to your career path.";
    }

    if (input.includes('who are you')) {
      return "I am the Interview AI Pro Assistant, a local technical training system designed to help you master industry-standard interview questions.";
    }

    return "I've noted your message. For a comprehensive technical assessment, please navigate to the 'Mock Interview' section of the dashboard.";
  }
}
