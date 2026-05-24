'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, ArrowLeft, Cpu, ChevronLeft, Loader2, Sparkles, 
  CheckCircle2, Circle, HelpCircle, Save 
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  type: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://interview-ai-production-517f.up.railway.app';

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [targetCompany, setTargetCompany] = useState('Standard');
  const [targetDifficulty, setTargetDifficulty] = useState('Intermediate');

  useEffect(() => {
    const role = localStorage.getItem('target_role') || 'Software Developer';
    const company = localStorage.getItem('target_company') || 'Standard';
    const difficulty = localStorage.getItem('target_difficulty') || 'Intermediate';
    
    setTargetRole(role);
    setTargetCompany(company);
    setTargetDifficulty(difficulty);

    const sessionKey = `active_session_${role}_${company}_${difficulty}`;
    const savedSession = sessionStorage.getItem(sessionKey);

    if (savedSession) {
      try {
        const { savedQuestions, savedAnswers, savedIndex } = JSON.parse(savedSession);
        if (Array.isArray(savedQuestions) && savedQuestions.length > 0) {
          setQuestions(savedQuestions);
          setAnswers(savedAnswers || {});
          setCurrentIndex(savedIndex || 0);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse saved session:', e);
      }
    }

    const fetchQuestions = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(
          `${baseUrl}/prep/questions?role=${encodeURIComponent(role)}&company=${encodeURIComponent(company)}&difficulty=${encodeURIComponent(difficulty)}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (!res.ok) throw new Error('Failed to fetch questions');
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
          // Initialize answers object
          const initialAnswers: Record<number, string> = {};
          data.forEach(q => {
            initialAnswers[q.id] = '';
          });
          setAnswers(initialAnswers);
          
          sessionStorage.setItem(sessionKey, JSON.stringify({
            savedQuestions: data,
            savedAnswers: initialAnswers,
            savedIndex: 0
          }));
        } else {
          throw new Error('Empty questions data');
        }
      } catch (err) {
        console.error('Questions fetch failed, using fallbacks:', err);
        // Fallback questions
        const fallback = getFallbackQuestions(role, company);
        setQuestions(fallback);
        const initialAnswers: Record<number, string> = {};
        fallback.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);

        sessionStorage.setItem(sessionKey, JSON.stringify({
          savedQuestions: fallback,
          savedAnswers: initialAnswers,
          savedIndex: 0
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Update sessionStorage on answers or index updates
  useEffect(() => {
    if (questions.length === 0) return;
    const sessionKey = `active_session_${targetRole}_${targetCompany}_${targetDifficulty}`;
    sessionStorage.setItem(sessionKey, JSON.stringify({
      savedQuestions: questions,
      savedAnswers: answers,
      savedIndex: currentIndex
    }));
  }, [answers, currentIndex, questions, targetRole, targetCompany, targetDifficulty]);

  const getFallbackQuestions = (role: string, company: string): Question[] => {
    const roleKey = role.toLowerCase();
    const banks: Record<string, string[]> = {
      'frontend': [
        "Explain the difference between Prototypal and Classical Inheritance in JavaScript.",
        "How would you build a highly reusable, accessible Modal component in React?",
        "How do you identify and fix memory leaks or unnecessary re-renders in a large-scale web app?",
        "A client reports the dashboard is slow when loading 10,000 rows. What is your optimization strategy?",
        "How would you implement a search-as-you-type feature with debouncing and caching?"
      ],
      'backend': [
        "Explain the CAP Theorem and how it influences your database choice for a global application.",
        "How would you design a secure JWT-based authentication flow with refresh tokens?",
        "Describe how you would debug and optimize a slow SQL query causing high CPU usage in production.",
        "Your server is hit by a sudden 10x traffic spike. What scaling layers do you activate first?",
        "Design a distributed rate-limiting system that works across multiple geographic regions."
      ],
      'fullstack': [
        "Explain the lifecycle of a request from the browser until it reaches the database and back.",
        "How do you ensure data consistency between a React frontend and a PostgreSQL backend?",
        "What is your approach to securing sensitive API keys in a CI/CD pipeline?",
        "You need to migrate a monolithic app to microservices. How do you handle cross-service communication?",
        "Build a real-time collaborative document editor using WebSockets and conflict resolution."
      ]
    };
    const matchedRole = Object.keys(banks).find(k => roleKey.includes(k)) || 'frontend';
    const list = banks[matchedRole] || [
      "Describe the architecture of a system you recently built.",
      "How do you ensure code quality in a team environment?",
      "How do you solve a technical problem when you have no prior experience with the technology?",
      "You have a tight deadline for a complex feature. How do you prioritize tasks?",
      "How would you improve the technical performance of your application?"
    ];
    return list.map((q, i) => ({
      id: i + 1,
      question: q,
      type: 'text'
    }));
  };

  const handleAnswerChange = (text: string) => {
    const activeQuestion = questions[currentIndex];
    if (!activeQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: text
    }));
  };

  const totalAnswered = Object.values(answers).filter(ans => ans.trim().length > 0).length;
  const isSubmitEnabled = totalAnswered === 5 && !isSubmitting;

  const handleSubmitAll = async () => {
    if (!isSubmitEnabled) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    // Map answers into backend expected schema
    const formattedAnswers = questions.map(q => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id] || ''
    }));

    try {
      const res = await fetch(`${baseUrl}/prep/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: targetRole,
          company: targetCompany,
          answers: formattedAnswers
        })
      });

      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      
      // Clear sessionStorage backup upon successful submission
      const sessionKey = `active_session_${targetRole}_${targetCompany}_${targetDifficulty}`;
      sessionStorage.removeItem(sessionKey);

      localStorage.setItem('last_result', JSON.stringify({ evaluation: JSON.stringify(data) }));
      if (data.id) {
        router.push(`/result?id=${data.id}`);
      } else {
        router.push('/result');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit assessment answers. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen t-bg-base t-text-pri flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-purple-500 mx-auto" />
          <h2 className="text-lg font-black tracking-tight">Generating Custom AI Assessment...</h2>
          <p className="text-xs t-text-muted max-w-xs leading-relaxed">Analyzing role profiles and target company cultures to compile premium practical questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen h-screen flex flex-col t-bg-base t-text-pri overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* 1. TOP HEADER NAVBAR */}
      <header className="p-4 lg:px-8 border-b t-border flex justify-between items-center bg-white/[0.02] backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to exit the assessment? Your progress will be lost.")) {
                const sessionKey = `active_session_${targetRole}_${targetCompany}_${targetDifficulty}`;
                sessionStorage.removeItem(sessionKey);
                router.push('/chatbot');
              }
            }}
            className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-purple-500 flex items-center gap-1.5 text-xs font-bold border t-border"
          >
            <ChevronLeft size={16} /> Exit
          </button>
          <div>
            <h1 className="text-md font-bold tracking-tight">Technical Assessment Platform</h1>
            <p className="text-[9px] font-black uppercase tracking-wider text-purple-400">
              {targetCompany} • {targetRole} ({targetDifficulty})
            </p>
          </div>
        </div>

        {/* Dynamic Progress Circular Pill */}
        <div className="flex items-center gap-2.5 bg-purple-600/10 px-4 py-2 rounded-xl border border-purple-500/20 shrink-0">
          <Cpu size={14} className="text-purple-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest text-purple-300 uppercase">
            Completed: {totalAnswered} / 5
          </span>
        </div>
      </header>

      {/* 2. MAIN LAYOUT (2-COLUMN GRID) */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden relative">
        
        {/* LEFT COLUMN: ASSESSMENT PANEL MAP (GRID INTERACTIVE BUTTONS) */}
        <aside className="w-72 border-r t-border bg-white/[0.01] shrink-0 p-5 flex flex-col justify-between hidden md:flex min-h-0 overflow-hidden">
          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Question Map</h3>
              <p className="text-[10px] t-text-muted mt-1 leading-normal">
                Navigate back and forth freely. Update or edit any answer before clicking submit.
              </p>
            </div>

            {/* Question Navigator Grid */}
            <div className="grid grid-cols-5 gap-2.5 my-3 shrink-0">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = (answers[q.id] || '').trim().length > 0;
                
                let btnStyle = "border-neutral-200 dark:border-white/5 bg-white dark:bg-white/2 text-neutral-600 dark:text-neutral-400 hover:border-purple-500/30";
                if (isCurrent) {
                  btnStyle = "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/30 font-black scale-105";
                } else if (isAnswered) {
                  btnStyle = "border-green-500/30 dark:border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 font-bold";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl border flex items-center justify-center text-xs transition-all duration-200 active:scale-95 ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Status Legend */}
            <div className="space-y-2.5 pt-4 border-t t-border shrink-0 text-[10px] font-black text-neutral-700 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 border border-purple-500" />
                <span className="text-neutral-900 dark:text-neutral-300">Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/10 border border-green-500/30" />
                <span className="text-green-600 dark:text-green-400">Answered / Saved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white dark:bg-white/2 border border-neutral-300 dark:border-white/5" />
                <span className="text-neutral-900 dark:text-neutral-300">Not Answered</span>
              </div>
            </div>
          </div>

          {/* Bottom Progress Summary Card */}
          <div className="mt-auto p-4 rounded-2xl t-bg-card border t-border space-y-2 shrink-0">
            <div className="flex justify-between items-center text-[10px] font-black uppercase t-text-sec">
              <span>Overall Progress</span>
              <span>{Math.round((totalAnswered / 5) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full t-progress-track rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-500 rounded-full" 
                style={{ width: `${(totalAnswered / 5) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: MAIN QUESTION/ANSWER VIEW CONTAINER */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gradient-to-b from-transparent to-black/10">
          
          {/* Question Text Area */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col justify-center min-h-0">
            <div className="max-w-4xl mx-auto w-full space-y-6">
              
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-purple-600/10 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase tracking-wider">
                  Technical Assessment Task
                </span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-black">
                  Question {currentIndex + 1} of 5
                </span>
              </div>

              {/* Displaying Question Prompt */}
              <div className="space-y-4">
                <div className="p-6 rounded-[24px] t-question-box border">
                  <h2 className="text-lg lg:text-xl font-extrabold leading-relaxed t-question-text italic">
                    "{currentQuestion?.question}"
                  </h2>
                </div>
              </div>

              {/* Textarea answer input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-400 pl-1">
                  <span>Your Response</span>
                  {answers[currentQuestion?.id]?.trim().length > 0 ? (
                    <span className="text-green-600 dark:text-green-500 flex items-center gap-1 font-black">
                      <CheckCircle2 size={10} /> Progress Saved Locally
                    </span>
                  ) : (
                    <span>Answer Required</span>
                  )}
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 to-pink-500/15 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <textarea
                    value={answers[currentQuestion?.id] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Provide a comprehensive technical explanation here. Elaborate on core concepts, design approaches, and implementation patterns..."
                    className="t-input w-full h-56 p-6 rounded-[24px] border focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all text-sm leading-relaxed relative resize-none font-semibold"
                    autoFocus
                    disabled={isSubmitting}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER ACTIONS PANEL */}
          <footer className="p-4 lg:px-8 border-t t-border t-bg-base flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0 || isSubmitting}
                className="t-nav-btn px-4 py-2.5 rounded-xl border text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} /> Previous
              </button>
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1 || isSubmitting}
                className="t-nav-btn px-4 py-2.5 rounded-xl border text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>

            {/* Final Submit Button */}
            <button
              onClick={handleSubmitAll}
              disabled={!isSubmitEnabled}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold text-xs hover:from-purple-500 hover:to-purple-700 transition-all flex items-center gap-1.5 shadow-md shadow-purple-900/30 disabled:opacity-40 disabled:hover:from-purple-600 disabled:hover:to-purple-800 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Evaluating Answers...
                </>
              ) : (
                <>
                  Submit Assessment <CheckCircle2 size={14} />
                </>
              )}
            </button>
          </footer>

        </main>

      </div>
    </div>
  );
}
