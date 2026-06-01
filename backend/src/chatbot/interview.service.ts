import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MockResult } from './mock-result.entity';
import Groq from 'groq-sdk';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);
  private groq: Groq | null = null;
  private activeAiRequests = new Map<string, Promise<any>>();

  constructor(
    @InjectRepository(MockResult)
    private mockResultRepository: Repository<MockResult>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const companyTitle = company ? company.trim() : 'Standard';

    const banks: Record<string, string[]> = {
      'frontend': [
        `${companyTitle} - Explain the difference between Prototypal and Classical Inheritance in JavaScript and how it impacts performance.`,
        `${companyTitle} - How would you design and implement a highly reusable, fully accessible Modal component in React following WAI-ARIA guidelines?`,
        `${companyTitle} - How do you identify, debug, and fix memory leaks or unnecessary re-renders in a large-scale React/Next.js application?`,
        `${companyTitle} - A user reports the dashboard page is lagging when rendering 10,000 active table rows. Describe your virtualization and optimization strategy.`,
        `${companyTitle} - How would you implement a search-as-you-type search bar featuring debouncing, request cancellation (AbortController), and client-side caching?`,
        `${companyTitle} - Explain the CSS containment property and how it can be used to optimize rendering performance in complex UI layouts.`,
        `${companyTitle} - How do you optimize web applications for Core Web Vitals, specifically targeting Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)?`,
        `${companyTitle} - Describe your approach to state management in a micro-frontend architecture. How do you handle cross-app communication?`,
        `${companyTitle} - Explain how Next.js Server Components differ from Client Components, and when you should use each for optimal load times.`,
        `${companyTitle} - How would you implement an offline-first caching strategy using Service Workers and IndexedDB for the main user dashboard?`,
        `${companyTitle} - Explain the security risks associated with frontend applications (like XSS and CSRF) and how you mitigate them using Content Security Policies (CSP).`,
        `${companyTitle} - How would you design a dark-mode styling system that supports system preference detection, persistent user choice, and zero flash of unstyled content.`,
        `${companyTitle} - Describe the lifecycle of a rendering frame in a web browser. What happens during style calculation, layout, paint, and composite?`,
        `${companyTitle} - What are the advantages and drawbacks of CSS Modules versus CSS-in-JS libraries like Styled Components for large codebase maintenance?`,
        `${companyTitle} - How would you implement a secure and accessible Drag-and-Drop file uploader that supports chunked uploads, progress bars, and file validation?`
      ],
      'backend': [
        `${companyTitle} - Explain the CAP Theorem and how it influences database choice and partition tolerance for a globally distributed system.`,
        `${companyTitle} - How would you design a secure, production-grade JWT-based authentication flow with rotating refresh tokens and token blacklisting?`,
        `${companyTitle} - Describe how you would diagnose, debug, and resolve a slow-running SQL query causing high CPU utilization on your database server.`,
        `${companyTitle} - Your API backend experiences a sudden 10x traffic spike. What scaling and mitigation layers do you activate first to prevent downtime?`,
        `${companyTitle} - Design a distributed rate-limiting middleware that is accurate, low-latency, and works across multiple geographic cluster deployments.`,
        `${companyTitle} - Explain the differences between connection pooling and establishing new database connections for every request. How do you tune pool sizes?`,
        `${companyTitle} - Describe the Saga pattern and how you would use it to manage distributed transactions across microservices without using 2PC.`,
        `${companyTitle} - How would you implement an event-driven system using Apache Kafka or RabbitMQ, ensuring message ordering and exactly-once delivery semantics?`,
        `${companyTitle} - Explain the differences between SQL transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) and their concurrency trade-offs.`,
        `${companyTitle} - How would you design a scalable notification service that handles email, SMS, and push notifications with retry logic and rate-limits?`,
        `${companyTitle} - What is your strategy for database schema migrations in a high-availability environment with zero downtime?`,
        `${companyTitle} - Explain how you would prevent SQL Injection, NoSQL Injection, and SSRF (Server-Side Request Forgery) in a Node.js/Nest.js API.`,
        `${companyTitle} - Describe how you would design and implement an efficient search autocomplete backend serving millions of queries per second.`,
        `${companyTitle} - How do you optimize database performance using indexes, partition tables, and read-replicas? When are index updates counterproductive?`,
        `${companyTitle} - Explain the difference between horizontal and vertical scaling, and describe a scenario where horizontal scaling alone is insufficient.`
      ],
      'fullstack': [
        `${companyTitle} - Explain the lifecycle of an HTTP/HTTPS request from the moment a user presses enter in the browser until data is retrieved from the database and returned.`,
        `${companyTitle} - How do you ensure real-time data consistency and state synchronization between a React/Next.js frontend and a PostgreSQL database?`,
        `${companyTitle} - What is your approach to securing, rotating, and managing sensitive API credentials and keys across development, staging, and production environments?`,
        `${companyTitle} - You need to migrate a monolithic backend to a microservices architecture. How do you handle database segregation and API gateway routing?`,
        `${companyTitle} - How would you build a real-time collaborative document editor using WebSockets (or Socket.io) and operational transformation or CRDTs?`,
        `${companyTitle} - Explain how you would optimize a full-stack flow that currently requires 10 seconds to load due to multiple sequential API calls and heavy database queries.`,
        `${companyTitle} - How would you implement a secure OAuth2 login flow using third-party providers (like Google or GitHub), including callback handling and state validation?`,
        `${companyTitle} - Explain the difference between Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR) from a full-stack perspective.`,
        `${companyTitle} - Describe your CI/CD pipeline design for a full-stack monorepo. How do you handle automated testing, build caching, and rolling deployments?`,
        `${companyTitle} - How would you design an analytics dashboard that processes, stores, and visualizes real-time user engagement metrics without degrading core application performance?`,
        `${companyTitle} - Explain the security implications of CORS (Cross-Origin Resource Sharing) and how to configure it securely for an API gateway.`,
        `${companyTitle} - How would you design a robust file upload and storage system that handles user profile pictures, including resizing, CDN caching, and access control?`,
        `${companyTitle} - Explain how to implement database indexing, pagination (cursor-based vs offset-based), and frontend infinite scrolling for large datasets.`,
        `${companyTitle} - Describe how you would debug a production issue where frontend users randomly receive 502 Bad Gateway errors during high-traffic periods.`,
        `${companyTitle} - What are the pros and cons of using GraphQL versus REST APIs in a large full-stack application with deeply nested relations?`
      ],
      'devops': [
        `${companyTitle} - Describe how you would design a zero-downtime blue-green deployment pipeline using Kubernetes and Helm.`,
        `${companyTitle} - How do you manage infrastructure drift using Terraform, and how do you handle state locking in a multi-engineer team?`,
        `${companyTitle} - What is your strategy for monitoring, logging, and alerting in a Kubernetes cluster using Prometheus, Grafana, and ELK/Loki?`,
        `${companyTitle} - Explain the security best practices for Dockerfiles, including multi-stage builds, non-root users, and vulnerability scanning.`,
        `${companyTitle} - How would you design and implement an automated disaster recovery plan for a multi-region cloud application?`,
        `${companyTitle} - Explain the differences between horizontal pod auto-scaling (HPA) and cluster auto-scaling in AWS or GCP.`,
        `${companyTitle} - How would you secure a CI/CD pipeline against malicious attacks, dependency hijacking, and credential leakage?`,
        `${companyTitle} - Describe how to implement GitOps workflow using tools like ArgoCD or Flux for automated Kubernetes deployments.`,
        `${companyTitle} - What is Chaos Engineering, and how would you implement tools like Chaos Mesh or Gremlin to test system resilience?`,
        `${companyTitle} - How do you optimize cloud infrastructure costs (e.g. AWS or Azure) for a large-scale application with variable traffic?`,
        `${companyTitle} - Explain the difference between a reverse proxy, a load balancer, and an API Gateway. When do you use each?`,
        `${companyTitle} - How would you configure a highly secure and isolated Virtual Private Cloud (VPC) with public and private subnets, NAT gateways, and security groups?`,
        `${companyTitle} - Describe how you would set up a centralized secret management system using HashiCorp Vault or AWS Secrets Manager.`,
        `${companyTitle} - How do you troubleshoot a container startup failure (CrashLoopBackOff) in a Kubernetes production environment?`,
        `${companyTitle} - Explain the concept of Infrastructure as Code (IaC) and describe the trade-offs between declarative (Terraform) and imperative (Pulumi) approaches.`
      ],
      'ai-ml': [
        `${companyTitle} - Explain the difference between bias and variance, and describe how you would detect and mitigate overfitting in a deep learning model.`,
        `${companyTitle} - How would you design a Retrieval-Augmented Generation (RAG) system, including vector database selection, chunking strategy, and metadata filtering?`,
        `${companyTitle} - Describe how you would optimize a large transformer model (like Llama or BERT) for low-latency production inference using quantization or pruning.`,
        `${companyTitle} - What is feature engineering? Give examples of how you would preprocess text, image, and tabular data for a machine learning model.`,
        `${companyTitle} - How would you evaluate the performance of a classification model under extreme class imbalance (e.g. fraud detection)?`,
        `${companyTitle} - Explain the architecture of a Transformer model, specifically the role of multi-head self-attention and positional encoding.`,
        `${companyTitle} - Describe how you would build a scalable ML training and deployment pipeline using Kubeflow or SageMaker.`,
        `${companyTitle} - What are the differences between symmetric and asymmetric search in semantic vector spaces, and how does it influence vector indexing?`,
        `${companyTitle} - How would you design a recommendation engine that handles the cold-start problem for new users and new items?`,
        `${companyTitle} - Explain the concept of gradient descent and its variants (SGD, Adam). How do you handle vanishing or exploding gradients?`,
        `${companyTitle} - Describe the difference between supervised, unsupervised, and reinforcement learning. Give a practical industry use case for each.`,
        `${companyTitle} - How would you set up automated monitoring to detect data drift and concept drift in a deployed machine learning model?`,
        `${companyTitle} - What is fine-tuning (e.g. LoRA) versus prompt engineering? When would you choose one over the other for an LLM application?`,
        `${companyTitle} - How do you handle missing data, outliers, and highly correlated features during the data preparation phase?`,
        `${companyTitle} - Explain how backpropagation works in deep neural networks, and how activation functions (ReLU, GeLU, Sigmoid) affect learning.`
      ],
      'data': [
        `${companyTitle} - Write a complex SQL query using Window functions (e.g., ROW_NUMBER, LEAD, LAG) to analyze user retention over time.`,
        `${companyTitle} - Explain the difference between a star schema and a snowflake schema in data warehousing. When do you use each?`,
        `${companyTitle} - How would you design and implement an A/B testing experiment, including sample size calculation, hypothesis testing, and p-value interpretation?`,
        `${companyTitle} - Describe your process for cleaning a raw, messy dataset containing duplicates, inconsistent date formats, and missing values in Pandas.`,
        `${companyTitle} - What is ETL (Extract, Transform, Load) versus ELT? Explain how you would design a data pipeline using dbt and Snowflake.`,
        `${companyTitle} - Explain the difference between correlation and causation. Give an example of how misinterpreting correlation could lead to bad business decisions.`,
        `${companyTitle} - How would you design a high-level executive dashboard to track company-wide KPIs, and what metrics would you prioritize?`,
        `${companyTitle} - Describe linear and logistic regression. In what scenarios is regression analysis preferred over machine learning classifiers?`,
        `${companyTitle} - How would you identify and handle outliers in a dataset, and how do they impact statistical metrics like mean, median, and standard deviation?`,
        `${companyTitle} - What is cohort analysis, and how would you use SQL to track the lifetime value (LTV) of monthly customer cohorts?`,
        `${companyTitle} - Describe how you would explain a complex statistical finding to a non-technical stakeholder or business leader.`,
        `${companyTitle} - Explain the Central Limit Theorem and why it is fundamental to statistical inference and sampling.`,
        `${companyTitle} - How do you optimize SQL queries to run faster on datasets containing billions of rows? Discuss partitions, indexes, and execution plans.`,
        `${companyTitle} - What are the differences between dimensional modeling, Fact tables, and Dimension tables in BI reporting?`,
        `${companyTitle} - Describe a time you found an unexpected anomaly or insight in a dataset. What action did you take based on that discovery?`
      ],
      'tester': [
        `${companyTitle} - Explain the difference between Unit, Integration, System, and End-to-End (E2E) testing. How do you decide the distribution of your testing pyramid?`,
        `${companyTitle} - How would you design a comprehensive automated test suite for a modern React frontend using Cypress, Playwright, or Jest?`,
        `${companyTitle} - What is a flaky test? Describe your strategies for identifying, debugging, and preventing flaky tests in a CI/CD pipeline.`,
        `${companyTitle} - How would you perform load and performance testing on a REST API using tools like JMeter or K6? What metrics do you monitor?`,
        `${companyTitle} - Describe the bug lifecycle and explain how you write a clear, actionable bug report for the engineering team.`,
        `${companyTitle} - What is Test-Driven Development (TDD) versus Behavior-Driven Development (BDD)? What are the pros and cons of each?`,
        `${companyTitle} - How would you test a web application's security vulnerabilities (e.g. penetration testing, SQL injection, XSS) manually and via automation?`,
        `${companyTitle} - How do you test microservices that depend on third-party APIs? Discuss API mocking, contract testing, and wiremocking.`,
        `${companyTitle} - Describe how you would write a comprehensive test plan for a new payment gateway integration.`,
        `${companyTitle} - Explain the concept of boundary value analysis and equivalence partitioning. Give a practical example.`,
        `${companyTitle} - How do you perform visual regression testing, and what tools do you use to ensure UI layouts remain pixel-perfect across browsers?`,
        `${companyTitle} - What is mutation testing, and how does it help measure the effectiveness and quality of your test suite?`,
        `${companyTitle} - How do you test accessibility (a11y) compliance (WCAG 2.1) in a web application using automated tools and manual methods?`,
        `${companyTitle} - Describe how you would integrate automated tests into a CI/CD pipeline using GitHub Actions, GitLab CI, or Jenkins.`,
        `${companyTitle} - Explain the difference between black-box testing, white-box testing, and grey-box testing. When do you use each?`
      ],
      'cloud': [
        `${companyTitle} - Design a highly available, fault-tolerant, and secure multi-region web application architecture using AWS or GCP.`,
        `${companyTitle} - Explain the difference between serverless computing (e.g., AWS Lambda, Cloud Run) and virtual machines (e.g., EC2, Compute Engine).`,
        `${companyTitle} - How do you design and enforce Least Privilege access control using Identity & Access Management (IAM) policies in a cloud environment?`,
        `${companyTitle} - Describe your strategy for cloud cost optimization, including reserved instances, auto-scaling, and lifecycle storage policies.`,
        `${companyTitle} - What is a Content Delivery Network (CDN), and how would you configure it (e.g., CloudFront, Cloudflare) with caching, HTTPS, and origin shielding?`,
        `${companyTitle} - How would you design a secure, zero-downtime database migration strategy from an on-premise datacenter to a cloud database (e.g., Amazon RDS, Cloud Spanner)?`,
        `${companyTitle} - Explain the concept of Infrastructure as Code (IaC) and compare CloudFormation, Terraform, and Pulumi.`,
        `${companyTitle} - How do you protect a public-facing cloud application from DDoS attacks, SQL Injection, and credential stuffing?`,
        `${companyTitle} - Describe how to implement secure, encrypted cross-region VPC peering and transit gateway routing.`,
        `${companyTitle} - What are serverless database solutions (e.g. Aurora Serverless, DynamoDB, Firestore)? What are their trade-offs in terms of cold starts and scale?`,
        `${companyTitle} - Explain how you would implement centralized logging and auditing across multiple cloud accounts using AWS CloudTrail or GCP Cloud Audit Logs.`,
        `${companyTitle} - Describe disaster recovery (DR) strategies in the cloud: Backup and Restore, Pilot Light, Warm Standby, and Multi-Site Active-Active.`,
        `${companyTitle} - How would you set up automated autoscaling rules based on CPU utilization, request count, and custom application metrics?`,
        `${companyTitle} - What is the shared responsibility model in cloud computing, and how does it apply to operating system patching and data security?`,
        `${companyTitle} - How do you handle secret management and secure environment injection in a serverless architecture?`
      ],
      'cyber': [
        `${companyTitle} - Explain the OWASP Top 10 vulnerabilities, and describe how to secure an application against Cross-Site Scripting (XSS) and SQL Injection.`,
        `${companyTitle} - Describe the difference between symmetric and asymmetric encryption, and explain the step-by-step process of an SSL/TLS handshake.`,
        `${companyTitle} - What is Zero Trust Architecture, and how would you implement it in a corporate network with remote workers?`,
        `${companyTitle} - How do you conduct threat modeling for a new product, and what methodologies (e.g. STRIDE, DREAD) do you use?`,
        `${companyTitle} - Explain how a JWT token can be compromised, and how to design a secure token management system to prevent hijacking.`,
        `${companyTitle} - What is incident response? Describe the phases of responding to a major security breach, including containment, eradication, and post-mortem.`,
        `${companyTitle} - Explain the difference between a Vulnerability Assessment, a Penetration Test, and a Red Team engagement.`,
        `${companyTitle} - How would you design a secure Single Sign-On (SSO) and Multi-Factor Authentication (MFA) system for an enterprise?`,
        `${companyTitle} - What is DNS hijacking, and how do you protect domain names and traffic using DNSSEC, DMARC, and SPF records?`,
        `${companyTitle} - Describe how to secure REST APIs against credential stuffing, brute force attacks, and broken object-level authorization (BOLA).`,
        `${companyTitle} - What is social engineering, and how do you implement technical controls (like email filters, DMARC) and user training to defend against it?`,
        `${companyTitle} - How do you secure data at rest, data in transit, and data in use? Discuss envelope encryption and confidential computing.`,
        `${companyTitle} - What are the differences between a stateless firewall, a stateful firewall, and a Web Application Firewall (WAF)?`,
        `${companyTitle} - Explain how cross-site request forgery (CSRF) works, and how to defend against it using SameSite cookies and anti-CSRF tokens.`,
        `${companyTitle} - Describe the difference between a false positive and a false negative in security alerting. How do you tune a SIEM to minimize fatigue?`
      ]
    };

    const matchedKey = Object.keys(banks).find(k => roleKey.includes(k)) || 'frontend';
    const pool = banks[matchedKey];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  async generateQuestions(data: { role: string, difficulty: string, company: string }): Promise<string[]> {
    const meta = await this.generateQuestionsWithMeta(data);
    return (meta.questions || []).map((q: any) => q.question);
  }

  async generateQuestionsWithMeta(data: { role: string, difficulty: string, company: string }) {
    const r = (data.role || '').toLowerCase().trim();
    const c = (data.company || '').toLowerCase().trim();
    const d = (data.difficulty || '').toLowerCase().trim();
    const cacheKey = `questions:${r}:${c}:${d}`;

    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      this.logger.log(`Questions retrieved from cache for ${r} at ${c} (${d})`);
      return cached;
    }

    if (this.activeAiRequests.has(cacheKey)) {
      this.logger.log(`Active questions generation request in progress for ${r} at ${c} (${d}). Deduplicating...`);
      return this.activeAiRequests.get(cacheKey);
    }

    const promise = (async () => {
      this.logger.log(`Generating full question metadata for ${data.role} at ${data.company}`);

      if (!this.groq) {
        const fallback = this.getFallbackQuestions(data.role, data.company);
        return { questions: fallback.map((q, i) => ({ id: i + 1, question: q, type: 'Technical', expectedAnswer: '', evaluationKeywords: [] })) };
      }

      try {
        const prompt = `
You are an AI interview question generator.
Generate exactly 5 practical, clear interview questions unique to:
Company: ${data.company} (match interview style)
Role: ${data.role}
Difficulty: ${data.difficulty}

Return ONLY a valid JSON object in this format:
{
  "company": "${data.company}",
  "role": "${data.role}",
  "difficulty": "${data.difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "type": "Technical",
      "expectedAnswer": "concise expected answer (1-2 sentences)",
      "evaluationKeywords": ["keyword1", "keyword2"]
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
        const parsed = JSON.parse(text);
        
        await this.cacheManager.set(cacheKey, parsed, 86400 * 1000); // Cache for 24 hours
        return parsed;
      } catch (err: any) {
        this.logger.warn(`Full metadata generation failed (${err.message}). Returning fallback.`);
        const fallback = this.getFallbackQuestions(data.role, data.company);
        return { questions: fallback.map((q, i) => ({ id: i + 1, question: q, type: 'Technical', expectedAnswer: '', evaluationKeywords: [] })) };
      } finally {
        this.activeAiRequests.delete(cacheKey);
      }
    })();

    this.activeAiRequests.set(cacheKey, promise);
    return promise;
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
- Score each answer from 0–100 based on correctness, relevance, key points, clarity, and communication.
- Return ONLY valid JSON in this exact format, nothing else:

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
  "hiringReadiness": "IMPROVE BASICS"
}
`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });
      const textRaw = chatCompletion.choices[0]?.message?.content?.replace(/```json|```/g, '').trim() || "{}";

      // Validate JSON
      const parsed = JSON.parse(textRaw);

      // Programmatically calculate accuracy = average of all answer scores
      const feedbacks = parsed.questionWiseFeedback || [];
      let calculatedAccuracy = 0;
      if (feedbacks.length > 0) {
        const totalScore = feedbacks.reduce((acc: number, curr: any) => acc + (Number(curr.score) || 0), 0);
        calculatedAccuracy = Math.round(totalScore / feedbacks.length);
      }

      parsed.overallScore = calculatedAccuracy;

      // Dynamic hiring readiness badge logic: 80–100 = JOB READY, 60–79 = NEEDS PRACTICE, below 60 = IMPROVE BASICS
      if (calculatedAccuracy >= 80) {
        parsed.hiringReadiness = "JOB READY";
        parsed.skillLevel = "Job Ready";
      } else if (calculatedAccuracy >= 60) {
        parsed.hiringReadiness = "NEEDS PRACTICE";
        parsed.skillLevel = "Improving";
      } else {
        parsed.hiringReadiness = "IMPROVE BASICS";
        parsed.skillLevel = "Beginner";
      }

      const text = JSON.stringify(parsed);

      // Save to DB
      const savedResult = await this.mockResultRepository.save({
        user: { id: userId },
        company: data.company,
        role: data.role,
        questions: data.answers.map(a => a.question),
        answers: data.answers.map(a => a.userAnswer),
        evaluation: text,
        score: calculatedAccuracy,
        accuracy: calculatedAccuracy,
        status: 'completed',
        timestamp: new Date()
      });

      // Cache Invalidation
      await this.cacheManager.del(`dashboard-stats:${userId}:general`);
      await this.cacheManager.del(`dashboard-stats:${userId}:interviews`);
      this.logger.log(`Invalidated dashboard stats cache for user: ${userId}`);

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
    const cacheKey = `performance-report:${userId}:${interviewId}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      this.logger.log(`Performance report retrieved from cache: ${cacheKey}`);
      return cached;
    }

    const result = await this.mockResultRepository.findOne({
      where: { id: interviewId, user: { id: userId } }
    });

    if (!result) {
      throw new Error('Interview assessment report not found');
    }

    let report;
    try {
      const parsed = typeof result.evaluation === 'string' ? JSON.parse(result.evaluation) : result.evaluation;
      report = {
        id: result.id,
        company: result.company,
        role: result.role,
        date: result.timestamp.toISOString().split('T')[0],
        ...parsed
      };
    } catch (e) {
      report = {
        id: result.id,
        company: result.company,
        role: result.role,
        date: result.timestamp.toISOString().split('T')[0],
        overallScore: result.score,
        finalRecommendation: result.evaluation,
        hiringReadiness: result.score >= 80 ? 'JOB READY' : result.score >= 60 ? 'NEEDS PRACTICE' : 'IMPROVE BASICS'
      };
    }

    await this.cacheManager.set(cacheKey, report, 86400 * 1000); // 24 hours
    return report;
  }

  async getDashboardStats(userId: number) {
    const cacheKey = `dashboard-stats:${userId}:general`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      this.logger.log(`Dashboard general stats retrieved from cache for user: ${userId}`);
      return cached;
    }

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

    const dashboardData = {
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

    await this.cacheManager.set(cacheKey, dashboardData, 30 * 1000); // 30 seconds TTL
    return dashboardData;
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
      
      // Invalidate caches
      await this.cacheManager.del(`dashboard-stats:${userId}:general`);
      await this.cacheManager.del(`dashboard-stats:${userId}:interviews`);
      for (const recordId of userRecordIds) {
        await this.cacheManager.del(`performance-report:${userId}:${recordId}`);
      }
      this.logger.log(`Invalidated dashboard stats and performance reports cache for user: ${userId}`);
    }
    return { success: true, deletedCount: userRecordIds.length };
  }

  async getDashboardInterviewStats(userId: number) {
    const cacheKey = `dashboard-stats:${userId}:interviews`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      this.logger.log(`Dashboard interview stats retrieved from cache for user: ${userId}`);
      return cached;
    }

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

    const interviewStats = {
      totalInterviews,
      todayInterviews,
      weeklyInterviews,
      monthlyInterviews,
      averageFrequency,
      recentActivities,
      dailyStats,
      mostActiveDay
    };

    await this.cacheManager.set(cacheKey, interviewStats, 30 * 1000); // 30 seconds TTL
    return interviewStats;
  }
}
