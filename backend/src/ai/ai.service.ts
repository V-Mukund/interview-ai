import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || 'dummy_key',
    });
  }

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
      return "I am the Forge Pro Assistant, a local technical training system designed to help you master industry-standard interview questions.";
    }
    return "I've noted your message. For a comprehensive technical assessment, please navigate to the 'Mock Interview' section of the dashboard.";
  }

  async generateExplanation(concept: string): Promise<string> {
    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: `Provide a concise, easy-to-understand explanation for the following technical concept: ${concept}. Include a simple analogy if possible.` }],
        model: 'llama-3.1-8b-instant',
      });
      return response.choices[0]?.message?.content || 'Explanation could not be generated.';
    } catch (error) {
      this.logger.error('Error generating explanation', error);
      return 'Failed to generate explanation. Please try again later.';
    }
  }

  async generateCheatSheet(topic: string, content: string): Promise<string> {
    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: `Create a quick cheat sheet with bullet points for the following topic: ${topic}. Use this context: ${content}` }],
        model: 'llama-3.1-8b-instant',
      });
      return response.choices[0]?.message?.content || 'Cheat sheet could not be generated.';
    } catch (error) {
      this.logger.error('Error generating cheat sheet', error);
      return 'Failed to generate cheat sheet. Please try again later.';
    }
  }

  async generatePracticeQuestions(topic: string, content: string): Promise<any[]> {
    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: `Generate exactly 10 practice interview questions based on this topic: ${topic}. Context: ${content}. Return ONLY a valid JSON array of objects, with each object containing EXACTLY these keys: "question", "answer", "explanation", "difficulty" (Easy, Medium, Hard). Do not include markdown formatting or any other text.` }],
        model: 'llama-3.1-8b-instant',
      });
      const text = response.choices[0]?.message?.content || '[]';
      try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
      } catch (e) {
        return [{ question: `What is the main idea behind ${topic}?`, answer: 'Please refer to the notes.', explanation: 'Parsing error occurred.', difficulty: 'Medium' }];
      }
    } catch (error) {
      this.logger.error('Error generating questions', error);
      return [];
    }
  }

  async generateRoadmap(weakAreas: string[]): Promise<string> {
    try {
      const areas = weakAreas.join(', ');
      const response = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: `I need to improve my skills in: ${areas}. Generate a brief 3-step learning roadmap for me.` }],
        model: 'llama-3.1-8b-instant',
      });
      return response.choices[0]?.message?.content || 'Roadmap could not be generated.';
    } catch (error) {
      this.logger.error('Error generating roadmap', error);
      return 'Failed to generate roadmap. Please try again later.';
    }
  }
}
