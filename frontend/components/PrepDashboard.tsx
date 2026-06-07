'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, BookOpen, Star, Clock, BrainCircuit, X, Play, Zap, FileText, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';

import { API_BASE_URL } from '../lib/config';
import { getAuthValue, setAuthValue } from '../lib/auth-store';

const baseUrl = API_BASE_URL;

const PREDEFINED_QUESTIONS: Record<string, Array<{question: string, answer: string, explanation?: string, difficulty: 'Easy' | 'Medium' | 'Hard'}>> = {
  DBMS: [
    {
      question: "What is the difference between SQL and NoSQL databases?",
      answer: "SQL databases are relational, table-based, use structured query language, and have a predefined schema. They are vertically scalable and follow ACID properties (e.g., PostgreSQL, MySQL). NoSQL databases are non-relational, document, key-value, wide-column, or graph-based, with dynamic schemas. They are horizontally scalable and prioritize BASE properties (e.g., MongoDB, Redis).",
      explanation: "Choose SQL when data integrity and ACID transaction support are paramount. Choose NoSQL for rapid scaling, unstructured data, and high-velocity reads/writes.",
      difficulty: "Easy"
    },
    {
      question: "What are the ACID properties in database systems?",
      answer: "ACID stands for: Atomicity (all-or-nothing execution of transaction operations), Consistency (preserving database invariants and validation rules), Isolation (ensuring concurrent transactions do not interfere with each other), and Durability (guaranteeing committed data survives power losses or system crashes).",
      explanation: "These properties ensure safe database transactions even in the presence of failures.",
      difficulty: "Medium"
    },
    {
      question: "What is database normalization and why is it used?",
      answer: "Database normalization is the process of organizing attributes and tables of a relational database to minimize data redundancy and prevent design anomalies (insertion, update, and deletion anomalies). It involves applying normal forms (1NF, 2NF, 3NF, BCNF) systematically.",
      explanation: "Normalization splits large tables to reduce redundancy, utilizing foreign keys to maintain relationships.",
      difficulty: "Hard"
    }
  ],
  OS: [
    {
      question: "What is the difference between a process and a thread?",
      answer: "A process is a self-contained execution environment with its own allocated virtual address space, memory page tables, file descriptors, and security context. A thread is the basic unit of CPU utilization that runs within a process, sharing the parent process's memory space, open files, and system resources.",
      explanation: "Processes are isolated from each other, making inter-process communication (IPC) slower. Threads share memory, allowing fast communication, but require careful synchronization (mutexes, semaphores) to prevent race conditions.",
      difficulty: "Easy"
    },
    {
      question: "What is virtual memory and how does page faulting work?",
      answer: "Virtual memory is a memory management technique that provides the illusion of a large contiguous RAM by mapping process virtual addresses to physical RAM or secondary storage (swap space). A page fault is a hardware interrupt triggered by the MMU when a thread tries to access a virtual page that is not loaded in physical RAM.",
      explanation: "On a page fault, the OS finds the page in swap space, loads it into a physical memory frame, updates the page table, and resumes the instruction.",
      difficulty: "Medium"
    },
    {
      question: "What is a deadlock and what are the four Coffman conditions required for it to occur?",
      answer: "A deadlock is a situation where a set of processes are permanently blocked because each process holds a resource and waits for another resource held by another process in the set. The four necessary conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, and 4. Circular Wait.",
      explanation: "To prevent deadlocks, at least one of these conditions must be broken (e.g., acquiring resources in a globally defined order to eliminate circular wait).",
      difficulty: "Hard"
    }
  ],
  CN: [
    {
      question: "Explain the TCP three-way handshake process.",
      answer: "The three-way handshake establishes a reliable, bidirectional TCP connection: 1. The client sends a SYN packet with a random sequence number (Seq=x) to the server. 2. The server responds with a SYN-ACK packet containing its own sequence number (Seq=y) and acknowledges the client's packet (Ack=x+1). 3. The client sends an ACK packet back (Ack=y+1) to confirm.",
      explanation: "This synchronization process ensures both sides are ready and agree on initial sequence numbers.",
      difficulty: "Easy"
    },
    {
      question: "What is the difference between TCP and UDP?",
      answer: "TCP (Transmission Control Protocol) is connection-oriented, reliable, guarantees packet delivery and ordering, performs flow control and congestion control, but has high header overhead (20-60 bytes). UDP (User Datagram Protocol) is connectionless, unreliable, does not guarantee delivery or packet order, but is fast and lightweight (8 bytes header).",
      explanation: "TCP is used for HTTP, SSH, and SMTP. UDP is used for DNS, VoIP, streaming, and online gaming.",
      difficulty: "Medium"
    },
    {
      question: "How does DNS resolution work?",
      answer: "DNS (Domain Name System) translates human-readable domain names (e.g., google.com) into IP addresses. The resolution steps are: 1. Client queries the local recursive resolver. 2. If not cached, the resolver queries a Root Name Server. 3. The Root directs the resolver to a TLD (Top-Level Domain) server (e.g., .com). 4. The TLD server directs it to the domain's Authoritative Name Server, which returns the IP.",
      explanation: "Caching at the browser, OS, and recursive resolver levels accelerates subsequent queries.",
      difficulty: "Hard"
    }
  ],
  React: [
    {
      question: "What is the Virtual DOM and how does reconciliation work in React?",
      answer: "The Virtual DOM is a lightweight JavaScript representation of the real DOM. When state or props change, React builds a new Virtual DOM tree, compares it with the previous tree using a highly optimized diffing algorithm (O(N) complexity), and batch-updates only the changed elements in the real DOM.",
      explanation: "This reconciliation process avoids expensive full-layout reflows in the browser, making UI updates highly efficient.",
      difficulty: "Easy"
    },
    {
      question: "What are the rules of React Hooks, and why is the useEffect clean-up function necessary?",
      answer: "Rules of Hooks: 1. Only call hooks at the top level of your functional component (not inside loops, conditions, or nested functions). 2. Only call hooks from React function components or custom hooks. The useEffect clean-up function executes before the component unmounts or before the effect runs again, clearing timers, subscriptions, or event listeners.",
      explanation: "Failing to clean up side-effects leads to memory leaks and unexpected behavior.",
      difficulty: "Medium"
    },
    {
      question: "What is the difference between React Server Components (RSC) and Client Components?",
      answer: "React Server Components execute exclusively on the server, permitting direct database querying, reducing client bundle size, and improving initial page load. Client Components are hydrated on the client, allowing use of state (useState), effects (useEffect), and browser-specific APIs.",
      explanation: "Next.js App Router defaults to Server Components. You add 'use client' at the top of a file to declare a Client Component.",
      difficulty: "Hard"
    }
  ],
  NextJs: [
    {
      question: "What is the difference between SSR, SSG, and ISR in Next.js?",
      answer: "SSR (Server-Side Rendering) pre-renders pages on the server for every incoming request. SSG (Static Site Generation) pre-renders pages once at build time. ISR (Incremental Static Regeneration) allows statically generated pages to rebuild in the background at set intervals (e.g., every 60 seconds) without a full site rebuild.",
      explanation: "Use SSG/ISR for blogs and marketing pages. Use SSR for highly dynamic pages like user dashboards.",
      difficulty: "Medium"
    },
    {
      question: "Explain how file-system routing and nested layouts work in Next.js App Router.",
      answer: "The App Router uses directory structures under the `app/` folder to define routes. A folder defines a path segment (e.g., `app/dashboard/settings` maps to `/dashboard/settings`). Within folders, special files are recognized: `page.tsx` defines the route UI, `layout.tsx` defines a persistent layout shared by sub-routes, and `loading.tsx` or `error.tsx` handle lifecycle states.",
      explanation: "Nested layouts do not re-render when navigating between sub-routes, preserving state.",
      difficulty: "Hard"
    }
  ],
  APIs: [
    {
      question: "What are the core differences between REST, GraphQL, and gRPC?",
      answer: "REST uses resource-oriented URIs, standard HTTP verbs (GET, POST, etc.), and returns complete JSON payloads. GraphQL uses a single endpoint and allows clients to query exact fields, eliminating over-fetching and under-fetching. gRPC is a binary framework using HTTP/2, Protocol Buffers, and streaming, designed for ultra-fast microservice communications.",
      explanation: "Select REST for general web APIs, GraphQL for complex client-specified UIs, and gRPC for internal backend microservices.",
      difficulty: "Medium"
    },
    {
      question: "What does it mean for an HTTP method to be idempotent?",
      answer: "An HTTP method is idempotent if multiple identical requests have the exact same server state outcome as a single request. GET, PUT, DELETE, HEAD, and OPTIONS are idempotent. POST is not idempotent, as executing it multiple times typically creates multiple resources.",
      explanation: "Even if the server response changes (e.g., DELETE returns 200 first, then 404), the server resource state remains the same, making it idempotent.",
      difficulty: "Easy"
    }
  ],
  JWT: [
    {
      question: "What is the structure of a JSON Web Token (JWT) and how is it verified?",
      answer: "A JWT is a base64url-encoded string containing three parts separated by dots: 1. Header (specifies signing algorithm and token type), 2. Payload (claims/user data like sub, email, expiration), and 3. Signature (constructed by hash of header + payload + a server-side secret key). Verification involves recalculating this hash on the server using the secret and comparing it.",
      explanation: "Since the signature can only be generated with the server's private secret, it guarantees the payload hasn't been altered.",
      difficulty: "Easy"
    },
    {
      question: "How do short-lived Access Tokens and long-lived Refresh Tokens secure an application?",
      answer: "Access tokens are short-lived (e.g., 15 minutes) and sent with each request for authentication. When they expire, the client sends a long-lived Refresh Token (stored in a secure HttpOnly cookie) to a refresh endpoint to receive a new access token, preventing user logout.",
      explanation: "This strategy limits the risk of access token leakage and allows token revocation by invalidating refresh tokens on the database.",
      difficulty: "Medium"
    }
  ],
  PostgreSQL: [
    {
      question: "What is a database index and how does a B-Tree index work in PostgreSQL?",
      answer: "An index is a performance-tuning structure that speeds up data retrieval. A B-Tree (Balanced Tree) index organizes column values in a sorted, balanced tree structure. Lookups, ranges, and sorting traverse from the root node to the appropriate leaf node containing row identifiers (TIDs) in logarithmic O(log N) time.",
      explanation: "PostgreSQL defaults to B-Tree indexes for most data types.",
      difficulty: "Medium"
    },
    {
      question: "Explain database connection pooling and why tools like pgBouncer are necessary.",
      answer: "PostgreSQL spawns a separate backend process for each client connection, consuming about 10MB of memory per process. Connection pooling maintains a pool of pre-established database connections that can be reused by incoming application requests. pgBouncer manages this pool, reducing connection overhead and resource usage.",
      explanation: "For high-traffic applications, direct connections will crash the database due to process limits.",
      difficulty: "Hard"
    }
  ],
  Docker: [
    {
      question: "What is the difference between a Docker image and a Docker container?",
      answer: "A Docker image is a read-only, static template containing the application code, runtime, libraries, environment variables, and configuration files. A Docker container is a runtime instance of an image. It is an isolated, lightweight process execution sandbox running on the host OS kernel.",
      explanation: "You can run multiple independent containers from a single image.",
      difficulty: "Easy"
    },
    {
      question: "How do multi-stage Docker builds optimize image size?",
      answer: "Multi-stage builds utilize multiple `FROM` statements in a single Dockerfile. You can compile your application or install build-time dependencies in an early, heavy 'builder' stage, and then copy only the compiled static binaries or production assets into a final, minimal runtime stage (e.g., alpine or scratch).",
      explanation: "This keeps development utilities and compilers out of the production image, shrinking size and improving security.",
      difficulty: "Medium"
    }
  ],
  Kubernetes: [
    {
      question: "What is a Pod, and how does a Deployment manage Pods in Kubernetes?",
      answer: "A Pod is the smallest deployable unit in Kubernetes, hosting one or more tightly-coupled containers that share the same network interface, IP address, port space, and storage volumes. A Deployment is a controller that monitors Pod health and automatically handles scaling, self-healing, rolling updates, and rollback strategies.",
      explanation: "Deployments maintain a specified replica count of Pods across cluster nodes.",
      difficulty: "Easy"
    },
    {
      question: "What is the difference between ClusterIP, NodePort, and LoadBalancer services?",
      answer: "1. ClusterIP exposes the service on an internal IP address accessible only within the cluster (default). 2. NodePort exposes the service on a static port (30000-32767) on each node's physical IP address. 3. LoadBalancer provisions a public cloud provider's external load balancer that automatically routes traffic to NodePort/ClusterIP.",
      explanation: "Use ClusterIP for database and internal services, NodePort/LoadBalancer to expose public entrypoints.",
      difficulty: "Medium"
    }
  ],
  ML: [
    {
      question: "Explain the bias-variance tradeoff in Machine Learning.",
      answer: "Bias is error from erroneous assumptions in the learning algorithm (underfitting). Variance is error from sensitivity to small fluctuations in the training set (overfitting). The tradeoff states that as you increase model complexity to lower bias, you typically increase variance, and vice-versa.",
      explanation: "The goal is to find the sweet spot where generalization error is minimized on unseen data.",
      difficulty: "Easy"
    },
    {
      question: "How do L1 and L2 regularization prevent overfitting?",
      answer: "Regularization adds a penalty term to the loss function to constrain weights: L1 (Lasso) adds the sum of the absolute values of weights, driving non-essential weights to zero (acting as feature selection). L2 (Ridge) adds the sum of squared weights, shrinking weights close to zero but not completely to zero.",
      explanation: "By penalizing large weights, regularization prevents the model from fitting noise in the training data.",
      difficulty: "Medium"
    }
  ],
  DL: [
    {
      question: "What is backpropagation and how does it optimize neural network weights?",
      answer: "Backpropagation is an algorithm used to calculate the gradient of the loss function with respect to the network weights. It computes gradients layer-by-layer backwards from the output layer using the calculus chain rule, and updates weights in the direction that minimizes the loss using an optimizer like SGD or Adam.",
      explanation: "It is the core training mechanism of deep neural networks.",
      difficulty: "Medium"
    },
    {
      question: "What is the vanishing gradient problem, and how do ReLU and residual connections mitigate it?",
      answer: "In deep networks, backpropagating gradients through activation functions like sigmoid/tanh multiplies values less than 1, causing gradients to shrink exponentially as they reach early layers. ReLU mitigates this because its derivative is 1 for positive inputs. Residual connections (ResNets) create skip connections, letting gradients flow directly backwards.",
      explanation: "Without gradients, early layers cannot learn features from the input data.",
      difficulty: "Hard"
    }
  ],
  LLMs: [
    {
      question: "Explain the Self-Attention mechanism in Transformer models.",
      answer: "Self-attention allows tokens in a sequence to calculate how much focus or weight they should place on all other tokens in the sequence. It projects input embeddings into three vectors: Query (Q), Key (K), and Value (V). It calculates dot products between Q and K to get attention weights, runs a softmax, and multiplies by V to get a contextual embedding.",
      explanation: "This enables parallel processing of sequences and captures long-range dependencies better than RNNs/LSTMs.",
      difficulty: "Hard"
    },
    {
      question: "What is RLHF (Reinforcement Learning from Human Feedback) in LLM training?",
      answer: "RLHF aligns model outputs with human preferences (helpfulness, honesty, safety): 1. Humans evaluate and rank model outputs. 2. A separate Reward Model is trained to predict human scores. 3. The LLM is fine-tuned against this reward model using reinforcement learning (PPO) to maximize positive output scores.",
      explanation: "It transforms raw text predictors into safe, helpful chat assistants.",
      difficulty: "Medium"
    }
  ],
  AWS: [
    {
      question: "What is the difference between Amazon EC2, Amazon ECS, and AWS Lambda?",
      answer: "EC2 provides raw Virtual Machines (IaaS) where you control the OS, networking, and scaling. ECS is a managed container orchestration service (like Kubernetes) for running Dockerized apps. AWS Lambda is a serverless Function-as-a-Service (FaaS) that executes code on-demand in response to events (automatically scaling and charging per millisecond).",
      explanation: "Choose EC2 for legacy/monolithic systems, ECS for microservices, and Lambda for event-driven functions.",
      difficulty: "Easy"
    },
    {
      question: "How does the evaluation flow of AWS IAM policies work?",
      answer: "AWS IAM processes policies using a structured flow: 1. By default, all requests are Denied. 2. IAM evaluates all applicable identity-based and resource-based policies. 3. If there is an explicit DENY in any policy, the request is immediately denied. 4. If there is an explicit ALLOW, the request is allowed. 5. If no explicit allow/deny exists, it defaults to DENY.",
      explanation: "An explicit Deny always overrides an explicit Allow.",
      difficulty: "Medium"
    }
  ],
  Azure: [
    {
      question: "What are Resource Groups and Azure Resource Manager (ARM) templates?",
      answer: "An Azure Resource Group is a logical container that groups related Azure resources (databases, virtual machines, web apps) for unified deployment, management, billing, and access control. ARM templates are JSON or Bicep files that declare the infrastructure configuration, enabling Infrastructure-as-Code (IaC) deployments.",
      explanation: "Deleting a Resource Group automatically cleans up all resources contained within it.",
      difficulty: "Easy"
    },
    {
      question: "What is Azure Active Directory (now Microsoft Entra ID)?",
      answer: "Microsoft Entra ID is a cloud-based identity and access management service. It manages user identities, single sign-on (SSO), multi-factor authentication (MFA), role-based access control (RBAC), and conditional access policies for enterprise cloud resources and applications.",
      explanation: "It is the primary authorization and authentication engine in the Azure cloud ecosystem.",
      difficulty: "Medium"
    }
  ],
  Selenium: [
    {
      question: "Explain the differences between implicit, explicit, and fluent waits in Selenium.",
      answer: "1. Implicit Wait sets a global timeout for WebDriver to poll the DOM for any element before throwing a NoSuchElementException. 2. Explicit Wait waits for a specific expected condition (e.g., visibilityOfElementLocated) before continuing. 3. Fluent Wait defines the maximum wait time, polling interval, and list of exceptions to ignore during polling.",
      explanation: "Do not mix implicit and explicit waits, as it can cause unpredictable timeout delays.",
      difficulty: "Medium"
    },
    {
      question: "What is the Page Object Model (POM) in Selenium test automation?",
      answer: "Page Object Model is a design pattern where each web page in the application is represented by a class. This page class holds the locators (selectors) for web elements and methods defining the page's actions (e.g., login, type). Test classes call these page class methods rather than interacting with elements directly.",
      explanation: "This decouples test logic from UI layout, making tests much easier to maintain when UI changes.",
      difficulty: "Easy"
    }
  ],
  Testing: [
    {
      question: "What are the differences between Unit, Integration, and End-to-End (E2E) testing?",
      answer: "Unit tests verify individual functions or components in complete isolation, mocking external dependencies. Integration tests verify that multiple components, databases, or microservices work together correctly. E2E tests validate the entire application flow in a real environment from the user's browser down to the database.",
      explanation: "Unit tests are cheap and fast; E2E tests are expensive, slow, but provide the highest confidence.",
      difficulty: "Easy"
    },
    {
      question: "What is Test-Driven Development (TDD) and its cycle?",
      answer: "TDD is a development technique where you write tests before writing the actual code. The cycle is: 1. RED (write a failing test for desired functionality), 2. GREEN (write the minimum implementation code to make the test pass), 3. REFACTOR (clean up the code while ensuring all tests remain green).",
      explanation: "TDD leads to modular, clean code and extremely high test coverage.",
      difficulty: "Medium"
    }
  ],
  Cybersecurity: [
    {
      question: "Explain Cross-Site Scripting (XSS) vs Cross-Site Request Forgery (CSRF).",
      answer: "XSS occurs when an attacker injects malicious client-side script into a trusted site, executing in the victim's browser to steal cookies or session tokens. CSRF tricks an authenticated user's browser into executing a state-changing request on a target application (e.g., transferring funds) without their consent.",
      explanation: "Prevent XSS by sanitizing/escaping all output. Prevent CSRF using anti-CSRF tokens and SameSite cookie attributes.",
      difficulty: "Medium"
    },
    {
      question: "What is SQL Injection (SQLi) and how do prepared statements prevent it?",
      answer: "SQL Injection is a vulnerability where user input is concatenated directly into SQL queries, letting an attacker alter query logic to bypass login, read data, or drop tables. Prepared statements prevent SQLi by compiling the query structure first and treating parameters as literal inputs, never as executable SQL code.",
      explanation: "Prepared statements completely eliminate SQL injection vectors.",
      difficulty: "Easy"
    }
  ]
};

const getPredefinedQuestions = (title: string, category: string) => {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();
  
  if (t.includes('dbms') || t.includes('database') || c.includes('dbms')) return PREDEFINED_QUESTIONS.DBMS;
  if (t.includes('os') || t.includes('operating system') || c.includes('operating system') || t.includes('paging') || t.includes('virtual memory')) return PREDEFINED_QUESTIONS.OS;
  if (t.includes('cn') || t.includes('network') || c.includes('computer network') || t.includes('tcp') || t.includes('udp') || t.includes('dns')) return PREDEFINED_QUESTIONS.CN;
  if (t.includes('react')) return PREDEFINED_QUESTIONS.React;
  if (t.includes('next.js') || t.includes('nextjs') || t.includes('next')) return PREDEFINED_QUESTIONS.NextJs;
  if (t.includes('api') || t.includes('apis') || t.includes('rest') || t.includes('graphql') || t.includes('grpc') || t.includes('rate limit')) return PREDEFINED_QUESTIONS.APIs;
  if (t.includes('jwt') || t.includes('token') || t.includes('auth')) return PREDEFINED_QUESTIONS.JWT;
  if (t.includes('postgresql') || t.includes('postgres') || t.includes('sql') || c.includes('sql')) return PREDEFINED_QUESTIONS.PostgreSQL;
  if (t.includes('docker') || t.includes('container')) return PREDEFINED_QUESTIONS.Docker;
  if (t.includes('kubernetes') || t.includes('k8s')) return PREDEFINED_QUESTIONS.Kubernetes;
  if (t.includes('ml') || t.includes('machine learning')) return PREDEFINED_QUESTIONS.ML;
  if (t.includes('dl') || t.includes('deep learning')) return PREDEFINED_QUESTIONS.DL;
  if (t.includes('llm') || t.includes('large language') || t.includes('transformer') || t.includes('gpt')) return PREDEFINED_QUESTIONS.LLMs;
  if (t.includes('aws') || t.includes('amazon')) return PREDEFINED_QUESTIONS.AWS;
  if (t.includes('azure')) return PREDEFINED_QUESTIONS.Azure;
  if (t.includes('selenium') || t.includes('webdriver')) return PREDEFINED_QUESTIONS.Selenium;
  if (t.includes('testing') || t.includes('qa') || t.includes('test')) return PREDEFINED_QUESTIONS.Testing;
  if (t.includes('cybersecurity') || t.includes('security') || t.includes('xss') || t.includes('csrf') || t.includes('sql injection') || t.includes('cryptography')) return PREDEFINED_QUESTIONS.Cybersecurity;
  
  return PREDEFINED_QUESTIONS.DBMS;
};

export default function PrepDashboard() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({ completed: 0, total: 0, percentage: 0, streak: 0 });
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbVersion, setDbVersion] = useState<string | null>(null);
  
  // AI States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [aiTitle, setAiTitle] = useState<string | null>(null);
  
  // Practice Questions States
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Toast
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Lazy loading pagination for categories
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const isFetchingRef = useRef(false);

  const categories = ['All', 'DSA', 'DBMS', 'Operating Systems', 'Computer Networks', 'SQL', 'System Design', 'HR Questions', 'Aptitude', 'Behavioral Questions', 'Company-Specific Preparation'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const companies = ['All', 'Google', 'Amazon', 'Meta', 'Netflix', 'Apple', 'Microsoft', 'TCS', 'Standard'];
  const roles = ['All', 'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'Systems Engineer', 'Network Engineer', 'All Roles'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Load from IndexedDB Cache first (Instant render!)
    try {
      const [cachedMats, cachedProg, cachedBook, cachedRec, cachedVer] = await Promise.all([
        getAuthValue('prep_materials'),
        getAuthValue('prep_progress'),
        getAuthValue('prep_bookmarks'),
        getAuthValue('prep_recently_viewed'),
        getAuthValue('prep_materials_version')
      ]);

      if (cachedMats) {
        setMaterials(cachedMats);
        setFilteredMaterials(cachedMats);
      }
      if (cachedProg) setProgress(cachedProg);
      if (cachedBook) setBookmarks(cachedBook);
      if (cachedRec) setRecentlyViewed(cachedRec);
      if (cachedVer) setDbVersion(cachedVer);
      
      // If we had cache, bypass show full-page loading spinner to avoid flashes
      if (cachedMats) {
        setIsLoading(false);
      }
    } catch (e) {
      console.warn('IndexedDB read failed:', e);
    }

    const token = await getAuthValue('token');
    if (!token) {
      isFetchingRef.current = false;
      return;
    }

    try {
      // NOTE: Removed redundant /prep/seed call because backend handles lazy seeding!
      const [matRes, progRes, bookRes, recRes] = await Promise.all([
        fetch(`${baseUrl}/prep/materials`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/prep/progress`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/prep/bookmarks`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/prep/recently-viewed`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (matRes.ok) {
        const data = await matRes.json();
        setMaterials(data);
        setFilteredMaterials(data);

        // Versioning check based on content hash
        const dataString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(dataString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const newHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const cachedHash = await getAuthValue('prep_materials_hash');
        if (newHash !== cachedHash) {
          const version = new Date().toISOString();
          await setAuthValue('prep_materials_version', version);
          await setAuthValue('prep_materials_hash', newHash);
          await setAuthValue('prep_materials', data);
          setDbVersion(version);
        }
      }
      if (progRes.ok) {
        const progData = await progRes.json();
        setProgress(progData);
        await setAuthValue('prep_progress', progData);
      }
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookmarks(bookData);
        await setAuthValue('prep_bookmarks', bookData);
      }
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecentlyViewed(recData);
        await setAuthValue('prep_recently_viewed', recData);
      }
    } catch (err) {
      console.error('Failed to fetch prep data:', err);
      showToast('Failed to load fresh data', 'error');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    let result = materials;
    if (selectedDifficulty !== 'All') result = result.filter(m => m.difficulty === selectedDifficulty);
    if (selectedCompany !== 'All') result = result.filter(m => m.company === selectedCompany);
    if (selectedRole !== 'All') result = result.filter(m => m.role === selectedRole);
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(s) || m.content.toLowerCase().includes(s));
    }
    setFilteredMaterials(result);
  }, [search, selectedDifficulty, selectedCompany, selectedRole, materials]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleBookmark = async (e: React.MouseEvent, materialId: number) => {
    e.stopPropagation();
    const token = await getAuthValue('token');
    try {
      const res = await fetch(`${baseUrl}/prep/bookmarks/${materialId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        fetchData();
        showToast(data.bookmarked ? 'Bookmark added' : 'Bookmark removed', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handleMarkComplete = async (materialId: number) => {
    const token = await getAuthValue('token');
    try {
      const res = await fetch(`${baseUrl}/prep/progress/${materialId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        showToast('Progress marked as complete!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to mark complete', 'error');
    }
  };

  const handleOpenMaterial = async (mat: any) => {
    setSelectedMaterial(mat);
    setAiContent(null);
    setAiTitle(null);
    
    // Load pre-defined static questions matching this material's topic/title
    const staticQs = getPredefinedQuestions(mat.title, mat.category);
    setActiveQuestions(staticQs);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    
    const token = await getAuthValue('token');
    try {
      await fetch(`${baseUrl}/prep/recently-viewed/${mat.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      // Ignore background track error
    }
  };

  const pollJobStatus = async (jobId: string, token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${baseUrl}/queue/status/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) {
            clearInterval(interval);
            reject(new Error('Failed to get job status'));
            return;
          }
          const data = await res.json();
          if (data.state === 'completed') {
            clearInterval(interval);
            resolve(data.result);
          } else if (data.state === 'failed') {
            clearInterval(interval);
            reject(new Error(data.failedReason || 'Job failed in background'));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 2000);
    });
  };

  const handleAiAction = async (action: 'explain' | 'cheatsheet') => {
    if (!selectedMaterial) return;
    setAiLoading(true);
    setAiContent(null);
    const token = await getAuthValue('token');
    try {
      const endpoint = action === 'explain' ? '/prep/ai/explain' : '/prep/ai/cheat-sheet';
      const body = action === 'explain' 
        ? JSON.stringify({ concept: selectedMaterial.title })
        : JSON.stringify({ topic: selectedMaterial.title, content: selectedMaterial.content });
      
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.jobId) {
          const result = await pollJobStatus(data.jobId, token || '');
          setAiTitle(action === 'explain' ? 'AI Explanation' : 'AI Cheat Sheet');
          setAiContent(result.content);
          showToast('AI generation complete', 'success');
        } else {
          showToast('AI generation failed', 'error');
        }
      } else {
        showToast('AI generation failed', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'AI request failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    // Deprecated in favor of static offline-friendly questions
    showToast('AI generation is disabled. Using offline pre-defined questions.', 'success');
  };

  const handleShuffleQuestions = () => {
    if (!activeQuestions.length) return;
    const shuffled = [...activeQuestions].sort(() => Math.random() - 0.5);
    setActiveQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
  };

  const isBookmarked = (id: number) => bookmarks.some(b => b.id === id);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent w-full animate-in fade-in zoom-in-95 duration-300 relative z-10" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shrink-0 mt-4 px-4 sm:px-6 lg:px-8">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Learning Center</span></h2>
            {dbVersion && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                v-{dbVersion.split('T')[0].replace(/-/g, '')}
              </span>
            )}
          </div>
          <p className="text-neutral-400 text-sm mt-1 font-medium">Master concepts, take notes, and track your prep journey.</p>
        </div>
      </div>

      {/* Categories removed, displaying sequentially */}

      {/* Materials Grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-12 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-purple-500" size={32} />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-neutral-500">
            <BookOpen size={48} className="mb-4 opacity-20" />
            <p className="font-bold">No materials found for the selected filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {categories.filter(c => c !== 'All').map(cat => {
              const categoryMaterials = filteredMaterials.filter(m => m.category === cat);
              if (categoryMaterials.length === 0) return null;
              
              const limit = visibleCounts[cat] || 6;
              const displayedMaterials = categoryMaterials.slice(0, limit);

              return (
                <div key={cat} className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                    <h3 className="text-2xl font-black text-white">{cat}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-neutral-400">{categoryMaterials.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedMaterials.map(mat => (
                      <div 
                        key={mat.id} 
                        onClick={() => handleOpenMaterial(mat)}
                        className="group cursor-pointer rounded-3xl bg-neutral-900/50 border border-white/10 p-1 flex flex-col hover:border-purple-500/30 transition-all duration-300 shadow-xl hover:shadow-purple-900/20 overflow-hidden"
                      >
                        <div className="p-5 flex-1 flex flex-col relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {mat.category}
                            </span>
                            <button 
                              onClick={(e) => handleToggleBookmark(e, mat.id)}
                              className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                              <Star size={16} className={isBookmarked(mat.id) ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-500'} />
                            </button>
                          </div>
                          
                          <h3 className="text-lg font-black text-white mb-2 leading-tight group-hover:text-purple-400 transition-colors">{mat.title}</h3>
                          <p className="text-sm text-neutral-400 line-clamp-2 mb-6 flex-1 leading-relaxed">
                            {mat.content.substring(0, 100)}...
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                                <Clock size={14} /> {mat.estimatedMinutes}m
                              </div>
                              <div className={`text-[10px] font-black uppercase tracking-widest ${mat.difficulty === 'Advanced' ? 'text-red-400' : mat.difficulty === 'Intermediate' ? 'text-amber-400' : 'text-green-400'}`}>
                                {mat.difficulty}
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                              <Play size={14} className="text-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {categoryMaterials.length > limit && (
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => setVisibleCounts(prev => ({ ...prev, [cat]: limit + 6 }))}
                        className="px-5 py-2.5 bg-neutral-900 border border-white/10 hover:border-purple-500/30 text-white rounded-2xl text-xs font-bold transition-all hover:scale-105 active:scale-95 duration-200 shadow-md hover:shadow-purple-900/10 flex items-center gap-1.5"
                      >
                        Show More <ChevronDown size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Material Reader Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-3xl bg-neutral-950 border-l border-white/10 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-neutral-950/80 backdrop-blur-md z-10 border-b border-white/10 p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-purple-500 font-black uppercase tracking-widest">{selectedMaterial.category}</span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 break-words">{selectedMaterial.title}</h2>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <button 
                  onClick={() => handleMarkComplete(selectedMaterial.id)}
                  className="px-4 py-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold flex items-center gap-2 hover:bg-green-500/20 transition-all shrink-0"
                >
                  <CheckCircle2 size={16} /> Mark Done
                </button>
                <button onClick={() => setSelectedMaterial(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 flex-1">
              {/* AI Features Bar */}
              <div className="p-1.5 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col sm:inline-flex sm:flex-row gap-2 mb-8 shadow-inner">
                <button 
                  onClick={() => handleAiAction('explain')}
                  disabled={aiLoading}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 w-full sm:w-auto"
                >
                  <BrainCircuit size={14} className="text-purple-400" /> Explain with AI
                </button>
                <button 
                  onClick={() => handleAiAction('cheatsheet')}
                  disabled={aiLoading}
                  className="px-4 py-2 rounded-xl hover:bg-white/10 text-xs font-bold text-neutral-400 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 w-full sm:w-auto"
                >
                  <FileText size={14} /> Generate Cheat Sheet
                </button>
              </div>

              {aiLoading && (
                <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 mb-8 flex items-center gap-4">
                  <Loader2 className="animate-spin text-purple-500" size={24} />
                  <span className="text-sm font-bold text-purple-400">AI is thinking...</span>
                </div>
              )}

              {aiContent && !aiLoading && (
                <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-8 relative">
                  <button onClick={() => setAiContent(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={16}/></button>
                  <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BrainCircuit size={16} /> {aiTitle}
                  </h3>
                  <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{aiContent}</div>
                </div>
              )}

              <div className="prose prose-invert prose-p:text-neutral-300 prose-headings:text-white max-w-none">
                {selectedMaterial.overview ? (
                  <>
                    <h3 className="text-lg font-black text-white border-b border-white/10 pb-2 mb-4">Overview</h3>
                    <p className="text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap">{selectedMaterial.overview}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-black text-white border-b border-white/10 pb-2 mb-4">Study Notes</h3>
                    <p className="text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap">{selectedMaterial.content}</p>
                  </>
                )}

                {selectedMaterial.coreConcepts && selectedMaterial.coreConcepts.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-black text-white border-b border-white/10 pb-2 mb-4">Core Concepts</h3>
                    <div className="flex flex-col gap-4">
                      {selectedMaterial.coreConcepts.map((concept: any, idx: number) => (
                        <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                          <h4 className="text-base font-bold text-white mb-2 mt-0">{concept.title}</h4>
                          <p className="text-sm text-neutral-400 m-0 leading-relaxed">{concept.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeQuestions && activeQuestions.length > 0 && (
                  <div className="mt-12 border-t border-white/10 pt-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                      <h3 className="text-xl font-black text-white m-0">Practice Questions</h3>
                      <div className="flex gap-2">
                        <button onClick={handleShuffleQuestions} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 transition-colors">
                          Shuffle
                        </button>
                      </div>
                    </div>

                    {generatingQuestions ? (
                      <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center animate-pulse">
                        <div className="w-full max-w-md h-4 bg-white/10 rounded-full mb-4"></div>
                        <div className="w-3/4 h-4 bg-white/10 rounded-full mb-8"></div>
                        <div className="w-full h-24 bg-white/5 rounded-xl mb-4"></div>
                        <p className="text-xs font-bold text-purple-400 text-center tracking-wide uppercase">Queueing Task & Polling Background Worker...</p>
                      </div>
                    ) : activeQuestions[currentQuestionIndex] ? (
                      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-white/10 shadow-xl transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-4xl font-black text-white/5 absolute top-4 right-6 pointer-events-none">Q{currentQuestionIndex + 1}</span>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${activeQuestions[currentQuestionIndex].difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : activeQuestions[currentQuestionIndex].difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                            {activeQuestions[currentQuestionIndex].difficulty || 'Medium'}
                          </span>
                        </div>
                        
                        <p className="text-lg font-bold text-white mb-6 relative z-10">{activeQuestions[currentQuestionIndex].question || activeQuestions[currentQuestionIndex].q}</p>
                        
                        <button 
                          onClick={() => setShowAnswer(!showAnswer)}
                          className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors mb-4 flex items-center gap-1"
                        >
                          {showAnswer ? 'Hide Answer' : 'Show Answer'} <ChevronDown size={14} className={`transform transition-transform ${showAnswer ? 'rotate-180' : ''}`} />
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAnswer ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                          <div className="p-5 rounded-2xl bg-black/40 border-l-2 border-purple-500">
                            <p className="text-sm text-neutral-300 leading-relaxed font-medium mb-3">{activeQuestions[currentQuestionIndex].answer || activeQuestions[currentQuestionIndex].a}</p>
                            {activeQuestions[currentQuestionIndex].explanation && (
                              <p className="text-xs text-neutral-500 leading-relaxed italic border-t border-white/5 pt-3">
                                {activeQuestions[currentQuestionIndex].explanation}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                          <button 
                            onClick={() => { setCurrentQuestionIndex(prev => Math.max(0, prev - 1)); setShowAnswer(false); }}
                            disabled={currentQuestionIndex === 0}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                          >
                            Previous
                          </button>
                          <span className="text-xs font-black text-neutral-500">{currentQuestionIndex + 1} / {activeQuestions.length}</span>
                          <button 
                            onClick={() => { setCurrentQuestionIndex(prev => Math.min(activeQuestions.length - 1, prev + 1)); setShowAnswer(false); }}
                            disabled={currentQuestionIndex === activeQuestions.length - 1}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
