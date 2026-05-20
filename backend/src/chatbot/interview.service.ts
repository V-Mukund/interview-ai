import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockResult } from './mock-result.entity';
import Groq from 'groq-sdk';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);
  private groq: Groq | null = null;

  constructor(
    @InjectRepository(MockResult)
    private mockResultRepository: Repository<MockResult>,
  ) {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    }
  }

  /**
   * FALLBACK: static question bank used when Groq is unavailable
   */
  private getFallbackQuestions(role: string, company: string): string[] {
    const roleKey = role.toLowerCase();
    const banks: Record<string, string[]> = {
      'frontend': [
        `${company} - Explain the difference between Prototypal and Classical Inheritance in JavaScript.`,
        `${company} - How would you build a highly reusable, accessible Modal component in React?`,
        `${company} - How do you identify and fix memory leaks or unnecessary re-renders in a large-scale web app?`,
        `${company} - A client reports the dashboard is slow when loading 10,000 rows. What is your optimization strategy?`,
        `${company} - How would you implement a search-as-you-type feature with debouncing and caching?`,
      ],
      'backend': [
        `${company} - Explain the CAP Theorem and how it influences your database choice for a global application.`,
        `${company} - How would you design a secure JWT-based authentication flow with refresh tokens?`,
        `${company} - Describe how you would debug and optimize a slow SQL query causing high CPU usage in production.`,
        `${company} - Your server is hit by a sudden 10x traffic spike. What scaling layers do you activate first?`,
        `${company} - Design a distributed rate-limiting system that works across multiple geographic regions.`,
      ],
      'fullstack': [
        `${company} - Explain the lifecycle of a request from the browser until it reaches the database and back.`,
        `${company} - How do you ensure data consistency between a React frontend and a PostgreSQL backend?`,
        `${company} - What is your approach to securing sensitive API keys in a CI/CD pipeline?`,
        `${company} - You need to migrate a monolithic app to microservices. How do you handle cross-service communication?`,
        `${company} - Build a real-time collaborative document editor using WebSockets and conflict resolution.`,
      ],
    };
    const matchedRole = Object.keys(banks).find(k => roleKey.includes(k));
    return banks[matchedRole] || [
      `${company} - Describe the architecture of a system you recently built.`,
      `${company} - How do you ensure code quality in a team environment?`,
      `${company} - How do you solve a technical problem when you have no prior experience with the technology?`,
      `${company} - You have a tight deadline for a complex feature. How do you prioritize tasks?`,
      `${company} - How would you improve the technical performance of ${company}'s main application?`,
    ];
  }

  async generateQuestions(data: { role: string, difficulty: string, company: string }): Promise<string[]> {
    this.logger.log(`Generating AI questions for ${data.role} at ${data.company} (${data.difficulty})`);

    if (!this.groq) {
      this.logger.warn('Groq not initialized. Using fallback question bank.');
      return this.getFallbackQuestions(data.role, data.company);
    }

    try {
      const prompt = `
You are an AI interview question generator.

Generate interview questions based on:
Company: ${data.company}
Role: ${data.role}
Difficulty: ${data.difficulty}

Rules:
1. Each company and each role must always receive a different set of questions.
2. Do not repeat the same questions for different companies.
3. Do not repeat the same questions for different roles.
4. Generate questions that match ${data.company}'s interview style.
5. Generate questions that match the ${data.role} required skills.
6. Include exactly 5 questions.
7. Questions must be practical, clear, and interview-ready.
8. Mix question types: Technical, Problem Solving, Scenario, Project, Behavioral.
9. Also generate an expected answer for every question.
10. Keep the expected answer accurate and concise.

Return only valid JSON in this exact format, nothing else:

{
  "company": "${data.company}",
  "role": "${data.role}",
  "difficulty": "${data.difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "...",
      "type": "Technical",
      "expectedAnswer": "...",
      "evaluationKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

The question set must be unique for the combination: ${data.company} + ${data.role}.
`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      const text = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
      const parsed = JSON.parse(text);

      // Return just the question strings (for backward compat with test page)
      if (Array.isArray(parsed?.questions)) {
        // Store full question data for the test page to use
        return parsed.questions.map((q: any) => q.question);
      }

      throw new Error('Unexpected response format from AI');
    } catch (err: any) {
      this.logger.warn(`AI question generation failed (${err.message}). Using fallback.`);
      return this.getFallbackQuestions(data.role, data.company);
    }
  }

  async generateQuestionsWithMeta(data: { role: string, difficulty: string, company: string }) {
    this.logger.log(`Generating full question metadata for ${data.role} at ${data.company}`);

    if (!this.groq) {
      const questions = this.getFallbackQuestions(data.role, data.company);
      return { questions: questions.map((q, i) => ({ id: i + 1, question: q, type: 'Technical', expectedAnswer: '', evaluationKeywords: [] })) };
    }

    try {
      const prompt = `
You are an AI interview question generator.

Generate interview questions based on:
Company: ${data.company}
Role: ${data.role}
Difficulty: ${data.difficulty}

Rules:
1. Generate questions unique to ${data.company} + ${data.role} combination.
2. Match ${data.company}'s known interview style and culture.
3. Match required skills for a ${data.role} engineer.
4. Include exactly 5 questions.
5. Mix: Technical, Problem Solving, Scenario, Project, Behavioral.
6. Include a concise expected answer and evaluation keywords per question.

Return only valid JSON, nothing else:

{
  "company": "${data.company}",
  "role": "${data.role}",
  "difficulty": "${data.difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "...",
      "type": "Technical",
      "expectedAnswer": "...",
      "evaluationKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}
`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      const text = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
      return JSON.parse(text);
    } catch (err: any) {
      this.logger.warn(`Full metadata generation failed (${err.message}). Returning minimal fallback.`);
      const questions = this.getFallbackQuestions(data.role, data.company);
      return { questions: questions.map((q, i) => ({ id: i + 1, question: q, type: 'Technical', expectedAnswer: '', evaluationKeywords: [] })) };
    }
  }


  async evaluate(userId: number, data: { company: string, role: string, questions: string[], answers: string[] }) {
    this.logger.log(`Generating comprehensive report for user: ${userId}`);
    // Fallback to analyze if called, or keep existing logic
    // For now, let's keep it or update it to use analyze logic
    return { score: 0, evaluation: "Deprecated in favor of /analyze" };
  }

  async analyze(userId: number, data: { company: string, role: string, answers: { question: string, userAnswer: string, expectedAnswer?: string, evaluationKeywords?: string[] }[] }) {
    this.logger.log(`Analyzing interview results for user: ${userId}`);

    if (!this.groq) {
      this.logger.warn(`AI Client not initialized. Cannot perform analysis.`);
      throw new Error('AI Client not initialized');
    }

    try {
      const prompt = `
You are an expert interview evaluator.

Evaluate the candidate ONLY based on the answers they provided in this interview.

Company: ${data.company}
Role: ${data.role}

For each question, compare:
1. The interview question
2. The expected correct answer (based on industry standards for the role)
3. The candidate's actual answer

Questions and Answers:
${data.answers.map((a, i) => {
  let block = `Question ${i + 1}: ${a.question}\nCandidate Answer ${i + 1}: ${a.userAnswer}`;
  if (a.expectedAnswer) block += `\nExpected Answer ${i + 1}: ${a.expectedAnswer}`;
  if (a.evaluationKeywords?.length) block += `\nKey Evaluation Points: ${a.evaluationKeywords.join(', ')}`;
  return block;
}).join('\n\n')}

Rules:
- Do not give a generic report.
- Do not assume answers the candidate did not provide.
- If the candidate's answer is empty or irrelevant, give a low score.
- Feedback must be specific to the candidate's actual answer.
- Keep the tone professional and helpful.
- Score each answer out of 10.
- Calculate the overall score out of 100.
- Determine hiring readiness: Beginner / Improving / Job Ready / Strong Candidate

Return only valid JSON in this exact format, nothing else:

{
  "overallScore": 0,
  "skillLevel": "Beginner",
  "strengths": ["specific strength 1", "specific strength 2"],
  "weakAreas": ["specific weak area 1", "specific weak area 2"],
  "questionWiseFeedback": [
    {
      "question": "",
      "userAnswer": "",
      "expectedAnswerSummary": "",
      "score": 0,
      "correctPointsMentioned": ["point 1"],
      "missingImportantPoints": ["missing point 1"],
      "mistakesOrWrongConcepts": ["mistake 1"],
      "communicationClarity": "Clear",
      "technicalAccuracy": "Accurate",
      "feedback": "",
      "improvement": ""
    }
  ],
  "finalRecommendation": "",
  "hiringReadiness": "Beginner"
}
`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });
      const text = chatCompletion.choices[0]?.message?.content?.replace(/```json|```/g, '').trim() || "{}";

      // Validate JSON
      const parsed = JSON.parse(text);

      // Save to DB — overallScore is now out of 100 directly
      const savedResult = await this.mockResultRepository.save({
        user: { id: userId },
        company: data.company,
        role: data.role,
        questions: data.answers.map(a => a.question),
        answers: data.answers.map(a => a.userAnswer),
        evaluation: text,
        score: Math.round(parsed.overallScore), // already out of 100
        accuracy: Math.round(parsed.overallScore), // out of 100
        status: 'completed',
        timestamp: new Date()
      });

      return {
        ...parsed,
        id: savedResult.id
      };
    } catch (error: any) {
      this.logger.error(`Failed to analyze interview: ${error.message}`);
      throw error;
    }
  }

  async getHistory(userId: number) {
    const results = await this.mockResultRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' }
    });

    return results.map(r => ({
      id: r.id,
      company: r.company,
      role: r.role,
      date: r.timestamp.toISOString().split('T')[0],
      score: r.score,
      accuracy: r.accuracy || r.score,
      status: r.status || 'completed',
      createdAt: r.timestamp,
      evaluation: r.evaluation,
      questions: r.questions,
      answers: r.answers
    }));
  }

  async getPerformance(userId: number, interviewId: number) {
    const result = await this.mockResultRepository.findOne({
      where: { id: interviewId, user: { id: userId } }
    });

    if (!result) {
      throw new Error('Interview assessment report not found');
    }

    try {
      const parsed = typeof result.evaluation === 'string' ? JSON.parse(result.evaluation) : result.evaluation;
      return {
        id: result.id,
        company: result.company,
        role: result.role,
        date: result.timestamp.toISOString().split('T')[0],
        ...parsed
      };
    } catch (e) {
      return {
        id: result.id,
        company: result.company,
        role: result.role,
        date: result.timestamp.toISOString().split('T')[0],
        overallScore: result.score,
        finalRecommendation: result.evaluation,
        hiringReadiness: result.score >= 80 ? 'Strong Candidate' : result.score >= 65 ? 'Job Ready' : 'Improving'
      };
    }
  }

  async getDashboardStats(userId: number) {
    const results = await this.mockResultRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' }
    });

    const totalInterviews = results.length;
    const averageScore = totalInterviews > 0 
      ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / totalInterviews)
      : 0;

    // We can parse the evaluation string to extract more detailed stats if needed, 
    // but for now, we'll mock the specific detailed metrics since we don't store 
    // them natively as distinct columns yet.
    
    // Mock analytics for the charts
    const weeklyPerformance = [
      { name: 'Mon', score: Math.max(0, averageScore - 10) },
      { name: 'Tue', score: Math.max(0, averageScore - 5) },
      { name: 'Wed', score: averageScore },
      { name: 'Thu', score: Math.min(100, averageScore + 5) },
      { name: 'Fri', score: Math.min(100, averageScore + 8) },
      { name: 'Sat', score: averageScore },
      { name: 'Sun', score: Math.min(100, averageScore + 12) }
    ];

    const skillComparison = [
      { skill: 'React', user: 85, avg: 70 },
      { skill: 'Node.js', user: 75, avg: 65 },
      { skill: 'System Design', user: 60, avg: 60 },
      { skill: 'Algorithms', user: 90, avg: 75 },
      { skill: 'Communication', user: 80, avg: 85 },
      { skill: 'Problem Solving', user: 88, avg: 70 }
    ];

    const techVsComm = [
      { name: 'Jan', tech: 60, comm: 70 },
      { name: 'Feb', tech: 65, comm: 72 },
      { name: 'Mar', tech: 75, comm: 75 },
      { name: 'Apr', tech: 80, comm: 85 },
      { name: 'May', tech: 85, comm: 80 }
    ];

    const recentInterviews = results.slice(0, 5).map(r => ({
      id: r.id,
      company: r.company,
      role: r.role,
      date: r.timestamp.toISOString().split('T')[0],
      score: r.score,
      status: r.score >= 70 ? 'Passed' : 'Needs Work',
      duration: '45m', // mocked
      aiRating: r.score >= 80 ? 'Strong' : r.score >= 60 ? 'Average' : 'Weak'
    }));

    return {
      overview: {
        totalInterviews,
        averageScore,
        communicationScore: 82, // mock
        technicalAccuracy: 78, // mock
        confidenceLevel: 85, // mock
        problemSolving: 88, // mock
        weakAreasCount: 3, // mock
        strongSkillsCount: 5, // mock
        currentStreak: 3, // mock
      },
      analytics: {
        weeklyPerformance,
        skillComparison,
        techVsComm
      },
      recentInterviews
    };
  }

  async deleteHistory(userId: number, interviewIds: (string | number)[]) {
    this.logger.log(`Deleting interview history for user ${userId}: ${JSON.stringify(interviewIds)}`);
    const ids = interviewIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id));
    if (ids.length === 0) {
      return { success: true, deletedCount: 0 };
    }
    const userRecords = await this.mockResultRepository.find({
      where: ids.map(id => ({ id, user: { id: userId } }))
    });
    const userRecordIds = userRecords.map(r => r.id);
    if (userRecordIds.length > 0) {
      await this.mockResultRepository.delete(userRecordIds);
    }
    return { success: true, deletedCount: userRecordIds.length };
  }

  async getDashboardInterviewStats(userId: number) {
    const results = await this.mockResultRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' }
    });

    const totalInterviews = results.length;
    const now = new Date();
    
    // Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayInterviews = results.filter(r => new Date(r.timestamp) >= startOfToday).length;

    // Weekly (7 days)
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyInterviews = results.filter(r => new Date(r.timestamp) >= startOfWeek).length;

    // Monthly (30 days)
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyInterviews = results.filter(r => new Date(r.timestamp) >= startOfMonth).length;

    // Average weekly frequency (total interviews divided by number of active weeks, fallback to totalInterviews/4)
    let averageFrequency = 0;
    if (totalInterviews > 0) {
      const oldest = new Date(results[results.length - 1].timestamp);
      const msDiff = now.getTime() - oldest.getTime();
      const daysDiff = Math.max(1, Math.ceil(msDiff / (24 * 60 * 60 * 1000)));
      const weeksDiff = Math.max(1, daysDiff / 7);
      averageFrequency = parseFloat((totalInterviews / weeksDiff).toFixed(1));
    }

    // Build recent activities timeline
    const recentActivities = results.slice(0, 5).map(r => {
      const rDate = new Date(r.timestamp);
      const timeDiff = now.getTime() - rDate.getTime();
      const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
      
      let relativeTime = '';
      if (daysDiff === 0) {
        relativeTime = 'Today';
      } else if (daysDiff === 1) {
        relativeTime = 'Yesterday';
      } else {
        relativeTime = `${daysDiff} days ago`;
      }

      return {
        id: r.id,
        company: r.company,
        role: r.role,
        date: r.timestamp.toISOString().split('T')[0],
        score: r.score,
        relativeTime,
        title: `${r.company.charAt(0).toUpperCase() + r.company.slice(1)} ${r.role} Interview`
      };
    });

    // 7 Days Daily stats for chart
    const dailyStats = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      
      const count = results.filter(r => {
        const ts = new Date(r.timestamp);
        return ts >= dStart && ts <= dEnd;
      }).length;

      dailyStats.push({
        day: dayNames[d.getDay()],
        date: d.getDate(),
        count
      });
    }

    // Find the most active day name
    const activeDayCounts: Record<string, number> = {};
    results.forEach(r => {
      const d = new Date(r.timestamp);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
      activeDayCounts[dayName] = (activeDayCounts[dayName] || 0) + 1;
    });
    
    let mostActiveDay = 'Monday';
    let maxCount = -1;
    Object.entries(activeDayCounts).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveDay = day;
      }
    });

    return {
      totalInterviews,
      todayInterviews,
      weeklyInterviews,
      monthlyInterviews,
      averageFrequency,
      recentActivities,
      dailyStats,
      mostActiveDay
    };
  }
}
