import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private aiClient: GoogleGenerativeAI | null = null;

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {
    // Initialize the Assessment Engine (under the hood)
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'ADD_YOUR_REAL_GEMINI_API_KEY_HERE') {
      this.aiClient = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Generates a response using Gemini or a local fallback.
   */
  async getResponse(message: string, role?: string, difficulty?: string): Promise<string> {
    if (this.aiClient) {
      try {
        const model = this.aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        let systemPrompt = "You are a helpful Technical Interview Assistant.";
        if (role) {
          systemPrompt += ` The candidate is preparing for a ${role} position.`;
        }
        if (difficulty) {
          systemPrompt += ` The difficulty level is ${difficulty}.`;
        }
        systemPrompt += " Help them with technical questions, concepts, and advice. Keep answers concise and professional.";

        const result = await model.generateContent(`${systemPrompt}\n\nCandidate: ${message}`);
        return (await result.response).text().trim();
      } catch (error: any) {
        this.logger.warn(`AI Chat failed (${error.message}). Falling back to local responses.`);
        // Fallback to local
      }
    }

    // PURE LOCAL RULE-BASED RESPONSE FALLBACK
    const input = message.toLowerCase();

    if (input.includes('hello') || input.includes('hi')) {
      return "Hello! I am your Technical Interview Assistant. I can help you prepare for challenges in Frontend, Backend, or Fullstack roles. Would you like to start a mock interview?";
    }

    if (input.includes('help')) {
      return "I specialize in interview preparation. Navigate to the 'Mock Interview' section for a structured assessment.";
    }

    if (input.includes('status')) {
      return "All systems are operational in Local Pro Mode. No external AI dependencies detected.";
    }

    return "Thank you for your message. For a formal technical evaluation, please use the Mock Interview dashboard.";
  }

  async saveMessageToThread(userId: number, content: string, sender: 'user' | 'bot', role?: string, difficulty?: string, conversationId?: number) {
    let conversation: Conversation;
    if (conversationId) {
      conversation = await this.conversationRepository.findOne({ where: { id: conversationId, user: { id: userId } } });
      if (!conversation) throw new NotFoundException('Conversation not found');
    } else {
      conversation = this.conversationRepository.create({
        user: { id: userId },
        role,
        difficulty,
        messages: []
      });
    }

    const message = { content, sender, timestamp: new Date() };
    conversation.messages.push(message);

    return await this.conversationRepository.save(conversation);
  }

  async getHistory(userId: number) {
    return await this.conversationRepository.find({
      where: { user: { id: userId } },
      order: { id: 'DESC' }
    });
  }

  async clearHistory(userId: number) {
    const history = await this.conversationRepository.find({ where: { user: { id: userId } } });
    return await this.conversationRepository.remove(history);
  }

  async deleteMultiple(userId: number, ids: number[]) {
    for (const id of ids) {
      const conv = await this.conversationRepository.findOne({ where: { id, user: { id: userId } } });
      if (conv) await this.conversationRepository.remove(conv);
    }
  }

  async deleteConversation(userId: number, conversationId: number) {
    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId, user: { id: userId } } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return await this.conversationRepository.remove(conversation);
  }
}
