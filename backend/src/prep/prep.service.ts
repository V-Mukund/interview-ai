import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrepMaterial } from './prep-material.entity';
import { UserBookmark } from './user-bookmark.entity';
import { UserPrepProgress } from './user-prep-progress.entity';
import { UserRecentlyViewed } from './user-recently-viewed.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class PrepService {
  private readonly logger = new Logger(PrepService.name);
  private activeAiRequests = new Map<string, Promise<any>>();

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async seedMaterials() {
    const count = await this.materialRepository.count();
    if (count >= 30) return { message: 'Already seeded' };
    await this.materialRepository.delete({});
    // Find if we have legacy data that is missing the newly added overview field
    const legacyItem = count > 0 ? await this.materialRepository.createQueryBuilder("material").where("material.overview IS NULL").getOne() : null;
    
    if (count > 0 && !legacyItem) return { message: 'Already seeded' };
    
    await this.materialRepository.delete({}); // Clear existing materials to re-seed with structured data

    const generateQuestions = (topic: string) => Array.from({ length: 10 }, (_, i) => ({
      question: `Practice Question ${i + 1} about ${topic}`,
      answer: `This is the detailed answer and explanation for practice question ${i + 1} regarding ${topic}.`,
      difficulty: i % 3 === 0 ? 'Hard' : (i % 2 === 0 ? 'Medium' : 'Easy')
    }));

    const materials = [
      {
        title: 'Dynamic Programming: Fibonacci & Beyond',
        category: 'DSA',
        company: 'Amazon',
        role: 'Software Engineer',
        difficulty: 'Intermediate',
        overview: 'Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler overlapping subproblems. It optimizes performance by storing the results of these subproblems (memoization or tabulation) so they do not have to be re-computed.',
        coreConcepts: [
          { title: 'Overlapping Subproblems', description: 'The problem can be broken down into subproblems which are reused several times.' },
          { title: 'Optimal Substructure', description: 'The optimal solution to a problem can be constructed from optimal solutions of its subproblems.' },
          { title: 'Memoization (Top-Down)', description: 'Solving the problem recursively while caching the answers to subproblems in a table or hash map.' },
          { title: 'Tabulation (Bottom-Up)', description: 'Solving the problem iteratively by filling up a table from the smallest subproblems up to the main problem.' }
        ],
        content: 'In interviews, DP problems often appear as optimization questions (e.g., "find the minimum cost", "find the maximum profit", "how many ways"). Always start with a brute-force recursive approach, identify the overlapping subproblems, and then optimize using a cache.',
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
        overview: 'ACID is an acronym that refers to the set of 4 key properties that guarantee database transactions are processed reliably, even in the event of errors, power failures, or crashes.',
        coreConcepts: [
          { title: 'Atomicity', description: 'All parts of a transaction succeed, or all fail. There is no partial execution.' },
          { title: 'Consistency', description: 'A transaction must take the database from one valid state to another valid state, respecting all constraints.' },
          { title: 'Isolation', description: 'Concurrent transactions execute as if they were running sequentially. One transaction does not interfere with another.' },
          { title: 'Durability', description: 'Once a transaction is committed, it remains committed even in the event of a system failure.' }
        ],
        content: 'When designing backend systems, especially for financial or critical data, ACID compliance is a fundamental requirement. Relational databases like PostgreSQL and MySQL are inherently ACID compliant, whereas many NoSQL databases trade some ACID properties for eventual consistency and higher availability.',
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
        overview: 'Virtual memory is a memory management technique where secondary memory can be used as if it were a part of the main memory. Paging is the mechanism that implements virtual memory by dividing memory into fixed-size blocks.',
        coreConcepts: [
          { title: 'Pages and Frames', description: 'Logical memory is divided into Pages. Physical memory is divided into Frames of the same size.' },
          { title: 'Page Table', description: 'A data structure used by the OS to map logical addresses (virtual) to physical addresses.' },
          { title: 'Page Fault', description: 'An interrupt that occurs when a program requests a page that is not currently mapped into physical memory.' },
          { title: 'TLB (Translation Lookaside Buffer)', description: 'A hardware cache used to reduce the time taken to access a user memory location.' }
        ],
        content: 'Understanding virtual memory is crucial for systems engineering. It explains why programs can allocate more memory than physically available and how different processes are isolated from each other. In interviews, expect questions on page replacement algorithms like LRU (Least Recently Used) or FIFO.',
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
        overview: 'TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are the two primary protocols of the Transport Layer in the OSI model. They serve different purposes based on the need for reliability versus speed.',
        coreConcepts: [
          { title: 'Connection-Oriented vs Connectionless', description: 'TCP requires a 3-way handshake to establish a connection before data transfer. UDP just sends data without any setup.' },
          { title: 'Reliability', description: 'TCP guarantees delivery, ordering, and error-checking. UDP does not guarantee delivery or ordering.' },
          { title: 'Header Size', description: 'TCP has a larger header (20 bytes) due to tracking overhead. UDP has a lightweight header (8 bytes).' },
          { title: 'Use Cases', description: 'TCP is used for web browsing (HTTP), email, and file transfer. UDP is used for live video streaming, gaming, and VoIP.' }
        ],
        content: 'In system design interviews, choosing between TCP and UDP is a common discussion point. For a video streaming service like Netflix, a combination is used: TCP for reliable control data and UDP for fast video frame delivery where a dropped frame is better than buffering.',
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
        overview: 'SQL Joins are used to combine rows from two or more tables, based on a related column between them. Mastering joins is essential for any data manipulation or analysis task.',
        coreConcepts: [
          { title: 'INNER JOIN', description: 'Returns records that have matching values in BOTH tables.' },
          { title: 'LEFT (OUTER) JOIN', description: 'Returns all records from the left table, and the matched records from the right table. If no match, NULLs are returned for the right side.' },
          { title: 'RIGHT (OUTER) JOIN', description: 'Returns all records from the right table, and the matched records from the left table.' },
          { title: 'FULL (OUTER) JOIN', description: 'Returns all records when there is a match in either left or right table.' }
        ],
        content: 'Be prepared to write SQL queries on a whiteboard. A common trick question involves self-joins (joining a table to itself, useful for hierarchical data like employee-manager relations) or cross-joins (Cartesian product). Always consider the cardinality of the relationship (1:1, 1:N, M:N) when writing joins to avoid duplicate row explosions.',
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
        overview: 'Rate limiting is a strategy for limiting network traffic. It puts a cap on how often someone can repeat an action within a certain timeframe, protecting APIs from abuse, DDoS attacks, and resource exhaustion.',
        coreConcepts: [
          { title: 'Token Bucket', description: 'Tokens are added to a bucket at a fixed rate. Each request costs a token. If the bucket is empty, the request is dropped.' },
          { title: 'Leaky Bucket', description: 'Requests enter a queue (bucket) and are processed at a constant rate. If the queue is full, new requests leak (are dropped).' },
          { title: 'Fixed Window Counter', description: 'Divides time into fixed windows and counts requests per window. Susceptible to spikes at the edges of windows.' },
          { title: 'Sliding Window Log', description: 'Keeps a timestamp log of every request. Highly accurate but consumes high memory.' }
        ],
        content: 'When asked to design an API gateway or a scalable service, rate limiting is a must-have component. Discuss where to store the counters (Redis is the industry standard due to fast in-memory access and atomic INCR operations) and how to handle distributed rate limiting across multiple servers.',
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
        overview: 'Conflict is inevitable in any workplace. Interviewers ask about conflict to assess your communication skills, emotional intelligence, maturity, and ability to collaborate under pressure.',
        coreConcepts: [
          { title: 'The STAR Method', description: 'Structure your answer using: Situation, Task, Action, Result. Focus heavily on the "Action" you took.' },
          { title: 'Active Listening', description: 'Demonstrate that you seek to understand the other person\'s perspective before pushing your own.' },
          { title: 'Focus on the Problem, Not the Person', description: 'Show that you approach conflicts logically rather than emotionally.' },
          { title: 'Compromise vs Consensus', description: 'Explain how you reach a middle ground or align on a shared goal, even if you disagree on the approach.' }
        ],
        content: 'Never say "I have never had a conflict." This implies you lack experience or are avoiding the truth. Pick a professional, minor disagreement (e.g., a disagreement over a technical architecture choice or a timeline) and explain how a data-driven, respectful conversation led to a successful outcome.',
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
        overview: 'Time and Work problems are a staple of preliminary screening rounds in many companies. They test basic mathematical logic and the ability to find rates of completion.',
        coreConcepts: [
          { title: 'The 1-Day Work Rule', description: 'If a person can finish a job in N days, their 1-day work is 1/N of the job.' },
          { title: 'Combined Work', description: 'If A does 1/X and B does 1/Y in a day, together they do (1/X + 1/Y) in a day.' },
          { title: 'Efficiency Ratio', description: 'If A is twice as efficient as B, A will take half the time B takes to complete the work.' },
          { title: 'Work Equivalence', description: 'Men * Days * Hours / Work = Constant (M1*D1*H1/W1 = M2*D2*H2/W2)' }
        ],
        content: 'A common shortcut for Time & Work problems is the LCM method. Instead of using fractions (1/N), assume the total work is the Least Common Multiple of the given days. This converts all 1-day work into whole numbers (units of work per day), making calculations much faster and less error-prone.',
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
        overview: 'Customer Obsession is Amazon\'s #1 Leadership Principle. It dictates that leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust.',
        coreConcepts: [
          { title: 'Working Backwards', description: 'Start by defining the customer problem and experience, then figure out the technology or process to build it.' },
          { title: 'Long-term Trust over Short-term Profit', description: 'Making decisions that might cost money in the short term but win customer loyalty in the long run.' },
          { title: 'Voice of the Customer', description: 'Using data, anecdotes, and direct feedback to represent the customer in internal meetings.' }
        ],
        content: 'When interviewing at companies with strong core values like Amazon, your behavioral stories must explicitly map to these principles. For Customer Obsession, prepare a story where you went above and beyond to solve a user issue, or where you advocated for a feature solely because it improved the user experience, despite internal pushback.',
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
        overview: 'Graph traversal is a foundational algorithmic concept that appears in a large percentage of FAANG technical interviews. It involves systematically visiting all nodes in a graph.',
        coreConcepts: [
          { title: 'Breadth-First Search (BFS)', description: 'Explores the graph layer by layer. Uses a Queue. Ideal for finding the shortest path in an unweighted graph.' },
          { title: 'Depth-First Search (DFS)', description: 'Explores as far as possible along each branch before backtracking. Uses a Stack (or recursion). Ideal for exploring all paths or topological sorting.' },
          { title: 'Cycle Detection', description: 'Using visited sets or graph coloring to determine if a graph contains a cycle.' },
          { title: 'Connected Components', description: 'Finding isolated subgraphs within a larger graph structure.' }
        ],
        content: 'In Google interviews, questions are rarely direct "implement BFS" prompts. They are disguised as real-world problems (e.g., "word ladder", "number of islands", "alien dictionary"). Your first task is to recognize the problem as a graph problem, define what the nodes and edges represent, and then apply the standard traversal algorithm.',
        questions: generateQuestions('Graph Traversal'),
        answers: [],
        estimatedMinutes: 40
      }
    ];

    await this.materialRepository.save(materials);
      await (this.cacheManager as any).reset?.(); // clear cached materials on re-seed
    return { message: 'Seeded successfully' };
  }

  async getMaterials(query: any) {
    // Lazy seeding check
    const count = await this.materialRepository.count();
    if (count === 0) {
      this.logger.log('Lazy Seeding triggered: count is 0');
      await this.seedMaterials();
    }

    const { category, company, role, difficulty, search } = query || {};
    const where: any = {};
    
    if (category && category !== 'All') where.category = category;
    if (company && company !== 'All') where.company = company;
    if (role && role !== 'All') where.role = role;
    if (difficulty && difficulty !== 'All') where.difficulty = difficulty;
    
    if (search) {
      where.title = Like(`%${search}%`);
    }

    const cacheKey = `materials:${JSON.stringify(query || {})}`;
    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) {
      this.logger.log('Retrieved materials list from cache');
      return cached;
    }

    const results = await this.materialRepository.find({ where, order: { createdAt: 'DESC' } });
    await this.cacheManager.set(cacheKey, results, 600 * 1000); // 10 minutes cache TTL
    return results;
  }

  async getMaterialById(id: number) {
    const cacheKey = `material:${id}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      this.logger.log(`Retrieved material details for ID ${id} from cache`);
      return cached;
    }

    const result = await this.materialRepository.findOne({ where: { id } });
    if (result) {
      await this.cacheManager.set(cacheKey, result, 3600 * 1000); // 1 hour TTL
    }
    return result;
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

  // AI Wrappers with lightweight caching and promise-based request deduplication
  async generateExplanation(concept: string) {
    const cleanConcept = (concept || '').toLowerCase().trim();
    const cacheKey = `ai:explanation:${cleanConcept}`;

    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) {
      this.logger.log(`Retrieved cached explanation for "${cleanConcept}"`);
      return { content: cached };
    }

    if (this.activeAiRequests.has(cacheKey)) {
      this.logger.log(`Active explanation request exists for "${cleanConcept}". Deduplicating...`);
      const content = await this.activeAiRequests.get(cacheKey);
      return { content };
    }

    const promise = (async () => {
      try {
        return await this.aiService.generateExplanation(concept);
      } finally {
        this.activeAiRequests.delete(cacheKey);
      }
    })();

    this.activeAiRequests.set(cacheKey, promise);
    const content = await promise;
    await this.cacheManager.set(cacheKey, content, 7200 * 1000); // 2 hours
    return { content };
  }

  async generateCheatSheet(topic: string, content: string) {
    const cleanTopic = (topic || '').toLowerCase().trim();
    const cacheKey = `ai:cheatsheet:${cleanTopic}`;

    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) {
      this.logger.log(`Retrieved cached cheat sheet for "${cleanTopic}"`);
      return { content: cached };
    }

    if (this.activeAiRequests.has(cacheKey)) {
      this.logger.log(`Active cheat sheet request exists for "${cleanTopic}". Deduplicating...`);
      const sheet = await this.activeAiRequests.get(cacheKey);
      return { content: sheet };
    }

    const promise = (async () => {
      try {
        return await this.aiService.generateCheatSheet(topic, content);
      } finally {
        this.activeAiRequests.delete(cacheKey);
      }
    })();

    this.activeAiRequests.set(cacheKey, promise);
    const sheet = await promise;
    await this.cacheManager.set(cacheKey, sheet, 7200 * 1000); // 2 hours
    return { content: sheet };
  }

  async generatePracticeQuestions(topic: string, content: string) {
    const cleanTopic = (topic || '').toLowerCase().trim();
    const cacheKey = `ai:practice-questions:${cleanTopic}`;

    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) {
      this.logger.log(`Retrieved cached practice questions for "${cleanTopic}"`);
      return { questions: cached };
    }

    if (this.activeAiRequests.has(cacheKey)) {
      this.logger.log(`Active practice questions request exists for "${cleanTopic}". Deduplicating...`);
      const questions = await this.activeAiRequests.get(cacheKey);
      return { questions };
    }

    const promise = (async () => {
      try {
        return await this.aiService.generatePracticeQuestions(topic, content);
      } finally {
        this.activeAiRequests.delete(cacheKey);
      }
    })();

    this.activeAiRequests.set(cacheKey, promise);
    const questions = await promise;
    await this.cacheManager.set(cacheKey, questions, 7200 * 1000); // 2 hours
    return { questions };
  }

  async generateRoadmap(weakAreas: string[]) {
    const sortedAreas = [...(weakAreas || [])].sort().join(',').toLowerCase().trim();
    const cacheKey = `ai:roadmap:${sortedAreas}`;

    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) {
      this.logger.log(`Retrieved cached roadmap for "${sortedAreas}"`);
      return { content: cached };
    }

    if (this.activeAiRequests.has(cacheKey)) {
      this.logger.log(`Active roadmap request exists for "${sortedAreas}". Deduplicating...`);
      const content = await this.activeAiRequests.get(cacheKey);
      return { content };
    }

    const promise = (async () => {
      try {
        return await this.aiService.generateRoadmap(weakAreas);
      } finally {
        this.activeAiRequests.delete(cacheKey);
      }
    })();

    this.activeAiRequests.set(cacheKey, promise);
    const content = await promise;
    await this.cacheManager.set(cacheKey, content, 7200 * 1000); // 2 hours
    return { content };
  }
}
