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
        messages: [{ role: 'user', content: `Explain the technical concept "${concept}" in under 150 words. Include a simple 1-sentence real-world analogy.` }],
        model: 'llama-3.1-8b-instant',
        max_tokens: 250,
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
        messages: [{ role: 'user', content: `Create a bulleted cheat sheet for topic "${topic}". Max 5 practical points. Max 15 words per bullet. Context: ${content}` }],
        model: 'llama-3.1-8b-instant',
        max_tokens: 300,
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
        messages: [{ role: 'user', content: `Generate 10 questions on: ${topic}. Context: ${content}. Return ONLY a JSON object: {"questions": [{"question": "...", "answer": "max 2 sentences", "explanation": "max 2 sentences", "difficulty": "Easy|Medium|Hard"}]}` }],
        model: 'llama-3.1-8b-instant',
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });
      const text = response.choices[0]?.message?.content || '{"questions":[]}';
      try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        return Array.isArray(parsed) ? parsed : (parsed.questions || []);
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
        messages: [{ role: 'user', content: `Create a brief 3-step roadmap to improve in: ${areas}. Limit each step to a maximum of 2 direct sentences.` }],
        model: 'llama-3.1-8b-instant',
        max_tokens: 300,
      });
      return response.choices[0]?.message?.content || 'Roadmap could not be generated.';
    } catch (error) {
      this.logger.error('Error generating roadmap', error);
      return 'Failed to generate roadmap. Please try again later.';
    }
  }
}
