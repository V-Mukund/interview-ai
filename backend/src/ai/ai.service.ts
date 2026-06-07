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
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await this.groq.chat.completions.create({
          messages: [{ 
            role: 'user', 
            content: `Generate 10 technical interview-style questions on the topic "${topic}". Context: ${content}.
            Rules:
            1. All answers must be accurate, comprehensive, and complete.
            2. Never use placeholders or weak answers like "refer to notes", "I don't know", "n/a", etc.
            3. Each item must have: question, answer, explanation, and difficulty (Easy, Medium, or Hard).
            4. Return ONLY a valid JSON object matching this schema: {"questions": [{"question": "...", "answer": "detailed technical answer", "explanation": "...", "difficulty": "Easy|Medium|Hard"}]}` 
          }],
          model: 'llama-3.1-8b-instant',
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        });
        const text = response.choices[0]?.message?.content || '{"questions":[]}';
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        const list = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        
        // Validation check
        const validQuestions = list.filter((q: any) => {
          if (!q || typeof q !== 'object') return false;
          const questionText = (q.question || '').trim();
          const answerText = (q.answer || '').trim();
          const difficultyText = (q.difficulty || '').trim();
          
          if (!questionText || !answerText || !difficultyText) return false;
          
          // Check for weak answers
          const lowerAns = answerText.toLowerCase();
          if (
            lowerAns.includes('refer to notes') ||
            lowerAns.includes("don't know") ||
            lowerAns.includes('dont know') ||
            lowerAns.includes('no answer') ||
            lowerAns.includes('n/a') ||
            lowerAns === 'etc.' ||
            answerText.length < 10
          ) {
            return false;
          }
          
          return true;
        });

        if (validQuestions.length >= 5) {
          return validQuestions;
        }
      } catch (error) {
        this.logger.error(`Attempt ${attempts} - Error generating questions:`, error);
      }
    }

    // Ultimate fallback if multiple attempts fail
    return [
      { question: `Can you explain the main architectural concepts of ${topic}?`, answer: `The core concepts of ${topic} revolve around building highly decoupled, modular components that communicate via standard interfaces. This ensures separation of concerns, ease of scalability, and straightforward unit testing across all components of the system.`, explanation: `Focuses on modularity and architecture.`, difficulty: 'Medium' },
      { question: `What are the primary performance considerations when working with ${topic}?`, answer: `Performance optimization in ${topic} primarily requires minimizing network round-trips, utilizing efficient local and remote caching strategies (like Redis or browser cache), optimizing query execution paths, and reducing memory footprint through lazy loading of modules and assets.`, explanation: `Focuses on performance bottlenecks.`, difficulty: 'Hard' },
      { question: `How do you handle error states and exceptional conditions in ${topic}?`, answer: `Error handling is managed through centralized error boundaries or exception filters, ensuring that failures are caught, logged with appropriate context, and converted to user-friendly messages while keeping the system stable and preventing resource leaks.`, explanation: `Focuses on resilience.`, difficulty: 'Medium' },
      { question: `What is the role of caching in optimizing ${topic} applications?`, answer: `Caching stores frequently accessed data in faster, temporary storage media. It helps reduce latency, limits load on backend relational databases, and speeds up page load times for end users, contributing to a highly responsive and performant user interface.`, explanation: `Focuses on optimization.`, difficulty: 'Easy' },
      { question: `How do you ensure data security and integrity when implementing ${topic}?`, answer: `Security is ensured by sanitizing all incoming inputs, using prepared statements to prevent injection, enforcing strict Role-Based Access Control (RBAC), encrypting sensitive data in transit and at rest, and validating requests via secure session tokens.`, explanation: `Focuses on application security.`, difficulty: 'Hard' }
    ];
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
