import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockResult } from './mock-result.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);
  private aiClient: GoogleGenerativeAI | null = null;

  constructor(
    @InjectRepository(MockResult)
    private mockResultRepository: Repository<MockResult>,
  ) {
    // Initialize the Assessment Engine (under the hood)
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'ADD_YOUR_REAL_GEMINI_API_KEY_HERE') {
      this.aiClient = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * ADVANCED ROLE-BASED QUESTION BANK
   */
  private getTechnicalBank(role: string, company: string): string[] {
    const roleKey = role.toLowerCase();
    
    const banks: Record<string, string[]> = {
      'frontend': [
        "What is the difference between Prototypal Inheritance and Classical Inheritance in JavaScript?",
        "Explain how you would build a highly reusable, accessible Modal component in React.",
        "How do you identify and fix memory leaks or unnecessary re-renders in a large-scale web application?",
        "Scenario: A client reports that the dashboard is very slow when loading 10,000 data rows. What is your optimization strategy?",
        `${company} Style: Explain how you would implement a search-as-you-type feature with debouncing and caching.`
      ],
      'backend': [
        "Explain the CAP Theorem and how it influences your choice of database for a global application.",
        "How would you design and implement a secure JWT-based authentication flow with refresh tokens?",
        "Describe how you would debug and optimize a slow SQL query that is causing high CPU usage in production.",
        "Scenario: Your server is hit by a sudden 10x traffic spike. What layers of scaling do you activate first?",
        `${company} Style: Design a distributed rate-limiting system that works across multiple geographic regions.`
      ],
      'fullstack': [
        "Explain the lifecycle of a request from the browser until it reaches the database and back.",
        "How do you ensure data consistency between a React frontend and a PostgreSQL backend when handling concurrent updates?",
        "What is your approach to securing sensitive API keys and environment variables in a CI/CD pipeline?",
        "Scenario: You need to migrate a monolithic app to microservices. How do you handle cross-service communication?",
        `${company} Style: Build a real-time collaborative document editor using WebSockets and conflict resolution.`
      ],
      'data-analyst': [
        "Explain the difference between JOIN and UNION in SQL with specific use cases.",
        "How do you handle missing or inconsistent data in a dataset of 1 million records before performing analysis?",
        "Describe a time you found a significant business insight from raw data. What metrics did you use?",
        "Scenario: A stakeholder claims a metric is declining, but your dashboard shows it's stable. How do you investigate the discrepancy?",
        `${company} Style: Write a SQL query to calculate the Month-over-Month growth of active users for ${company}.`
      ],
      'ai-ml': [
        "Explain the bias-variance tradeoff and how it impacts your model selection process.",
        "Describe the steps you take to preprocess high-dimensional text data for a transformer-based model.",
        "How do you detect and mitigate data drift in a machine learning model that has been in production for 6 months?",
        "Scenario: Your model has high accuracy on training data but performs poorly in the real world. How do you fix it?",
        `${company} Style: Describe how you would build a personalized recommendation system for ${company}'s core product.`
      ]
    };

    const matchedRole = Object.keys(banks).find(k => roleKey.includes(k));
    return banks[matchedRole] || [
      "Describe the fundamental architecture of a system you recently built.",
      "How do you ensure code quality and maintainability in a team environment?",
      "Explain how you solve a technical problem when you have no prior experience with the technology.",
      "Scenario: You are given a tight deadline for a complex feature. How do you prioritize tasks?",
      `${company} Style: How would you improve the technical performance of ${company}'s main application?`
    ];
  }

  async generateQuestions(data: { role: string, difficulty: string, company: string }) {
    this.logger.log(`Generating highly tailored ${data.role} challenge for ${data.company}`);
    return this.getTechnicalBank(data.role, data.company);
  }

  async evaluate(userId: number, data: { company: string, role: string, questions: string[], answers: string[] }) {
    this.logger.log(`Generating comprehensive report for user: ${userId}`);
    // Fallback to analyze if called, or keep existing logic
    // For now, let's keep it or update it to use analyze logic
    return { score: 0, evaluation: "Deprecated in favor of /analyze" };
  }

  async analyze(userId: number, data: { company: string, role: string, answers: { question: string, userAnswer: string }[] }) {
    this.logger.log(`Analyzing interview results for user: ${userId}`);

    if (!this.aiClient) {
      this.logger.warn(`AI Client not initialized. Cannot perform analysis.`);
      throw new Error('AI Client not initialized');
    }

    try {
      const model = this.aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's mock interview performance based only on their actual answers.

Company: ${data.company}
Role: ${data.role}

Questions and Answers:
${data.answers.map((a, i) => `Question ${i + 1}: ${a.question}\nUser Answer ${i + 1}: ${a.userAnswer}`).join('\n\n')}

Evaluation rules:
- Analyze each answer carefully.
- Do not return empty fields.
- Do not give generic feedback.
- If an answer is empty, too short, wrong, or unclear, give a low score.
- Score each answer out of 10.
- Calculate the overall score out of 10.
- Feedback must be specific to the selected role.
- Suggest improvements based on missing concepts.

Return only valid JSON in this exact format:

{
  "overallScore": 0,
  "skillLevel": "Beginner",
  "strengths": [],
  "weakAreas": [],
  "questionWiseFeedback": [
    {
      "question": "",
      "userAnswer": "",
      "expectedAnswerSummary": "",
      "score": 0,
      "feedback": "",
      "improvement": ""
    }
  ],
  "finalRecommendation": ""
}

Do not include markdown code block formatting in your response. Output pure JSON only.
`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text().replace(/```json|```/g, '').trim();
      
      // Validate JSON
      const parsed = JSON.parse(text);

      // Save to DB
      await this.mockResultRepository.save({
        user: { id: userId },
        company: data.company,
        role: data.role,
        questions: data.answers.map(a => a.question),
        answers: data.answers.map(a => a.userAnswer),
        evaluation: text, // Store raw JSON string
        score: Math.round(parsed.overallScore * 10), // Store as percentage or scale
        timestamp: new Date()
      });

      return parsed; // Return the parsed JSON object to the frontend
    } catch (error: any) {
      this.logger.error(`Failed to analyze interview: ${error.message}`);
      throw error;
    }
  }
}
