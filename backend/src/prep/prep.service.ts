import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { PrepMaterial } from './prep-material.entity';
import { UserBookmark } from './user-bookmark.entity';
import { UserPrepProgress } from './user-prep-progress.entity';
import { UserRecentlyViewed } from './user-recently-viewed.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class PrepService {
  private readonly logger = new Logger(PrepService.name);

  constructor(
    @InjectRepository(PrepMaterial)
    private materialRepository: Repository<PrepMaterial>,
    @InjectRepository(UserBookmark)
    private bookmarkRepository: Repository<UserBookmark>,
    @InjectRepository(UserPrepProgress)
    private progressRepository: Repository<UserPrepProgress>,
    @InjectRepository(UserRecentlyViewed)
    private recentlyViewedRepository: Repository<UserRecentlyViewed>,
    private aiService: AiService,
  ) {}

  async seedMaterials() {
    const count = await this.materialRepository.count();
    if (count > 0) return { message: 'Already seeded' };

    const generateQuestions = (topic: string) => Array.from({ length: 10 }, (_, i) => ({
      question: `Question ${i + 1} about ${topic}`,
      answer: `This is the answer for question ${i + 1} about ${topic}.`,
      explanation: `Detailed explanation for question ${i + 1}.`,
      difficulty: i % 3 === 0 ? 'Hard' : (i % 2 === 0 ? 'Medium' : 'Easy')
    }));

    const materials = [
      {
        title: 'Dynamic Programming: Fibonacci & Beyond',
        category: 'DSA',
        company: 'Amazon',
        role: 'Software Engineer',
        difficulty: 'Intermediate',
        content: 'Dynamic Programming is an algorithmic technique for solving an optimization problem by breaking it down into simpler subproblems and utilizing the fact that the optimal solution to the overall problem depends upon the optimal solution to its subproblems.',
        questions: generateQuestions('Dynamic Programming'),
        answers: [],
        estimatedMinutes: 25
      },
      {
        title: 'ACID Properties in Databases',
        category: 'DBMS',
        company: 'Microsoft',
        role: 'Backend Developer',
        difficulty: 'Beginner',
        content: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. These properties ensure that database transactions are processed reliably.',
        questions: generateQuestions('ACID Properties'),
        answers: [],
        estimatedMinutes: 15
      },
      {
        title: 'Virtual Memory & Paging',
        category: 'Operating Systems',
        company: 'Apple',
        role: 'Systems Engineer',
        difficulty: 'Advanced',
        content: 'Virtual memory is a memory management capability that provides an idealized abstraction of the storage resources that are actually available on a given machine which creates the illusion to users of a very large (main) memory.',
        questions: generateQuestions('Virtual Memory'),
        answers: [],
        estimatedMinutes: 30
      },
      {
        title: 'TCP vs UDP',
        category: 'Computer Networks',
        company: 'Netflix',
        role: 'Network Engineer',
        difficulty: 'Intermediate',
        content: 'TCP (Transmission Control Protocol) is connection-oriented and reliable. UDP (User Datagram Protocol) is connectionless and faster but less reliable.',
        questions: generateQuestions('TCP vs UDP'),
        answers: [],
        estimatedMinutes: 20
      },
      {
        title: 'Complete Guide to SQL Joins',
        category: 'SQL',
        company: 'Standard',
        role: 'Data Analyst',
        difficulty: 'Intermediate',
        content: 'INNER JOIN returns records that have matching values in both tables.\nLEFT JOIN returns all records from the left table, and the matched records from the right table.',
        questions: generateQuestions('SQL Joins'),
        answers: [],
        estimatedMinutes: 20
      },
      {
        title: 'System Design: Rate Limiting',
        category: 'System Design',
        company: 'Meta',
        role: 'Backend Developer',
        difficulty: 'Advanced',
        content: 'Rate limiting controls the rate of traffic sent or received by a network interface controller. Strategies include Token Bucket, Leaky Bucket, and Fixed Window Counter.',
        questions: generateQuestions('Rate Limiting'),
        answers: [],
        estimatedMinutes: 45
      },
      {
        title: 'Handling Conflict in Teams',
        category: 'HR Questions',
        company: 'Standard',
        role: 'All Roles',
        difficulty: 'Beginner',
        content: 'Conflict resolution is a key soft skill. The STAR method (Situation, Task, Action, Result) is useful for answering HR questions about past conflicts.',
        questions: generateQuestions('Conflict Resolution'),
        answers: [],
        estimatedMinutes: 15
      },
      {
        title: 'Quantitative Aptitude: Time & Work',
        category: 'Aptitude',
        company: 'TCS',
        role: 'All Roles',
        difficulty: 'Intermediate',
        content: 'If A can do a piece of work in n days, then A\'s 1 day\'s work = 1/n. If A is twice as good a workman as B, then ratio of work done by A and B = 2:1.',
        questions: generateQuestions('Time & Work'),
        answers: [],
        estimatedMinutes: 30
      },
      {
        title: 'Leadership Principles: Customer Obsession',
        category: 'Behavioral Questions',
        company: 'Amazon',
        role: 'All Roles',
        difficulty: 'Advanced',
        content: 'Leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust. Although leaders pay attention to competitors, they obsess over customers.',
        questions: generateQuestions('Customer Obsession'),
        answers: [],
        estimatedMinutes: 25
      },
      {
        title: 'Google Kickstart: Graph Traversal',
        category: 'Company-Specific Preparation',
        company: 'Google',
        role: 'Software Engineer',
        difficulty: 'Advanced',
        content: 'Graph traversal (BFS/DFS) is a common theme in Google interviews. Understand when to use BFS (shortest path in unweighted graph) vs DFS (exploring all paths, topological sort).',
        questions: generateQuestions('Graph Traversal'),
        answers: [],
        estimatedMinutes: 40
      }
    ];

    await this.materialRepository.save(materials);
    return { message: 'Seeded successfully' };
  }

  async getMaterials(query: any) {
    const { category, company, role, difficulty, search } = query;
    const where: any = {};
    
    if (category && category !== 'All') where.category = category;
    if (company && company !== 'All') where.company = company;
    if (role && role !== 'All') where.role = role;
    if (difficulty && difficulty !== 'All') where.difficulty = difficulty;
    
    if (search) {
      where.title = Like(`%${search}%`);
      // Could also add OR logic for content if needed
    }

    return this.materialRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async getMaterialById(id: number) {
    return this.materialRepository.findOne({ where: { id } });
  }

  async toggleBookmark(userId: number, materialId: number) {
    const existing = await this.bookmarkRepository.findOne({
      where: { user: { id: userId }, material: { id: materialId } }
    });

    if (existing) {
      await this.bookmarkRepository.remove(existing);
      return { bookmarked: false };
    } else {
      const bookmark = this.bookmarkRepository.create({
        user: { id: userId },
        material: { id: materialId }
      });
      await this.bookmarkRepository.save(bookmark);
      return { bookmarked: true };
    }
  }

  async getBookmarks(userId: number) {
    const bookmarks = await this.bookmarkRepository.find({
      where: { user: { id: userId } },
      relations: ['material'],
      order: { createdAt: 'DESC' }
    });
    return bookmarks.map(b => b.material);
  }

  async markProgress(userId: number, materialId: number) {
    let progress = await this.progressRepository.findOne({ where: { user: { id: userId } } });
    
    if (!progress) {
      progress = this.progressRepository.create({
        user: { id: userId },
        completedMaterialIds: [materialId],
        streakDays: 1,
        lastActiveDate: new Date()
      });
      await this.progressRepository.save(progress);
      return progress;
    }

    if (!progress.completedMaterialIds) progress.completedMaterialIds = [];
    
    if (!progress.completedMaterialIds.includes(materialId)) {
      progress.completedMaterialIds.push(materialId);
    }

    // Calculate streak
    const now = new Date();
    if (progress.lastActiveDate) {
      const diffTime = Math.abs(now.getTime() - progress.lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        progress.streakDays += 1;
      } else if (diffDays > 1) {
        progress.streakDays = 1;
      }
    } else {
      progress.streakDays = 1;
    }

    progress.lastActiveDate = now;
    await this.progressRepository.save(progress);
    return progress;
  }

  async getProgress(userId: number) {
    const progress = await this.progressRepository.findOne({ where: { user: { id: userId } } });
    const totalMaterials = await this.materialRepository.count();
    
    if (!progress) {
      return { completed: 0, total: totalMaterials, percentage: 0, streak: 0 };
    }
    
    const completedCount = progress.completedMaterialIds?.length || 0;
    const percentage = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;
    
    return {
      completed: completedCount,
      total: totalMaterials,
      percentage,
      streak: progress.streakDays
    };
  }

  async trackRecentlyViewed(userId: number, materialId: number) {
    const existing = await this.recentlyViewedRepository.findOne({
      where: { user: { id: userId }, material: { id: materialId } }
    });

    if (existing) {
      existing.updatedAt = new Date();
      await this.recentlyViewedRepository.save(existing);
    } else {
      const view = this.recentlyViewedRepository.create({
        user: { id: userId },
        material: { id: materialId }
      });
      await this.recentlyViewedRepository.save(view);
    }

    // Keep only last 10
    const allViews = await this.recentlyViewedRepository.find({
      where: { user: { id: userId } },
      order: { updatedAt: 'DESC' }
    });

    if (allViews.length > 10) {
      const toDelete = allViews.slice(10);
      await this.recentlyViewedRepository.remove(toDelete);
    }
    return { success: true };
  }

  async getRecentlyViewed(userId: number) {
    const views = await this.recentlyViewedRepository.find({
      where: { user: { id: userId } },
      relations: ['material'],
      order: { updatedAt: 'DESC' },
      take: 10
    });
    return views.map(v => v.material);
  }

  // AI Wrappers
  async generateExplanation(concept: string) {
    const content = await this.aiService.generateExplanation(concept);
    return { content };
  }

  async generateCheatSheet(topic: string, content: string) {
    const result = await this.aiService.generateCheatSheet(topic, content);
    return { content: result };
  }

  async generatePracticeQuestions(topic: string, content: string) {
    const questions = await this.aiService.generatePracticeQuestions(topic, content);
    return { questions };
  }

  async generateRoadmap(weakAreas: string[]) {
    const content = await this.aiService.generateRoadmap(weakAreas);
    return { content };
  }
}
