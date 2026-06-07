import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiService } from '../../ai/ai.service';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import {
  GenerateExplanationJobData,
  GenerateCheatSheetJobData,
  GenerateQuestionsJobData,
  GenerateRoadmapJobData,
} from '../jobs/ai-job.dto';

/**
 * Processes all jobs on the "ai-explanation" queue.
 * Handles explanation, cheat-sheet, practice-question, and roadmap generation.
 */
@Processor(QUEUE_NAMES.AI_EXPLANATION)
export class AiPrepProcessor extends WorkerHost {
  private readonly logger = new Logger(AiPrepProcessor.name);

  constructor(private readonly aiService: AiService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing prep job [${job.name}] id=${job.id}`);

    switch (job.name) {
      case JOB_NAMES.GENERATE_EXPLANATION:
        return this.handleExplanation(job as Job<GenerateExplanationJobData>);

      case JOB_NAMES.GENERATE_CHEATSHEET:
        return this.handleCheatSheet(job as Job<GenerateCheatSheetJobData>);

      case JOB_NAMES.GENERATE_PRACTICE_QUESTIONS:
        return this.handleQuestions(job as Job<GenerateQuestionsJobData>);

      case JOB_NAMES.GENERATE_ROADMAP:
        return this.handleRoadmap(job as Job<GenerateRoadmapJobData>);

      default:
        this.logger.warn(`Unknown prep job: ${job.name}`);
        return null;
    }
  }

  private async handleExplanation(job: Job<GenerateExplanationJobData>) {
    const { concept } = job.data;
    this.logger.log(`Generating explanation for: "${concept}"`);
    const content = await this.aiService.generateExplanation(concept);
    return { content };
  }

  private async handleCheatSheet(job: Job<GenerateCheatSheetJobData>) {
    const { topic, content } = job.data;
    this.logger.log(`Generating cheat sheet for: "${topic}"`);
    const result = await this.aiService.generateCheatSheet(topic, content);
    return { content: result };
  }

  private async handleQuestions(job: Job<GenerateQuestionsJobData>) {
    const { topic, content } = job.data;
    this.logger.log(`Generating practice questions for: "${topic}"`);
    const rawQuestions = await this.aiService.generatePracticeQuestions(topic, content);
    
    const questions = rawQuestions.map((q: any, index: number) => ({
      id: index + 1,
      question: q.question || (typeof q === 'string' ? q : ''),
      answer: q.answer || '',
      difficulty: q.difficulty || 'Medium',
      explanation: q.explanation || '',
      topic: topic,
      type: 'text',
    }));
    return { questions };
  }

  private async handleRoadmap(job: Job<GenerateRoadmapJobData>) {
    const { weakAreas } = job.data;
    this.logger.log(`Generating roadmap for: ${weakAreas.join(', ')}`);
    const result = await this.aiService.generateRoadmap(weakAreas);
    return { content: result };
  }
}
