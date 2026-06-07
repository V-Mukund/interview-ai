'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, ArrowLeft, Cpu, ChevronLeft, Loader2, 
  CheckCircle2, AlertTriangle, AlertCircle
} from 'lucide-react';
import { getAuthValue, setAuthValue } from '../../lib/auth-store';

interface Question {
  id: number;
  question: string;
  type: string;
}

const DEFAULT_BACKUP_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Tell me about a challenging technical project you worked on. What were the obstacles and how did you resolve them?",
    type: "text"
  },
  {
    id: 2,
    question: "How do you approach learning a new technology or framework under tight deadlines?",
    type: "text"
  },
  {
    id: 3,
    question: "Describe a time when you had to optimize the performance of an application. What tools and techniques did you use?",
    type: "text"
  },
  {
    id: 4,
    question: "How do you handle disagreement with another engineer or stakeholder regarding architectural design decisions?",
    type: "text"
  },
  {
    id: 5,
    question: "Explain the difference between synchronous and asynchronous programming, and when you would choose one over the other.",
    type: "text"
  }
];

export default function OfflineInterviewPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

    const sessionKey = `offline_session_${role}_${company}_${difficulty}`;
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
        console.warn('Failed to parse saved offline session:', e);
      }
    }

    const loadOfflineQuestions = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const allSets = (await getAuthValue('offline_question_sets')) || {};
        const roleKey = role.toLowerCase();
        const matchedKey = Object.keys(allSets).find(k => roleKey.includes(k));
        const roleSets = matchedKey ? allSets[matchedKey] : null;

        if (roleSets && roleSets.length > 0) {
          let setIndex = roleSets.findIndex((s: any) => !s.used);
          if (setIndex === -1) {
            roleSets.forEach((s: any) => s.used = false);
            setIndex = 0;
          }
          const chosenSet = roleSets[setIndex];
          chosenSet.used = true;
          await setAuthValue('offline_question_sets', allSets);

          const mapped = (chosenSet.questions || []).map((q: any, i: number) => ({
            id: q.id || i + 1,
            question: q.question,
            type: q.type || 'text',
          }));

          if (mapped.length > 0) {
            setQuestions(mapped);
            const initialAnswers: Record<number, string> = {};
            mapped.forEach((q: Question) => { initialAnswers[q.id] = ''; });
            setAnswers(initialAnswers);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to default questions if no sets exist
        setQuestions(DEFAULT_BACKUP_QUESTIONS);
        const initialAnswers: Record<number, string> = {};
        DEFAULT_BACKUP_QUESTIONS.forEach((q: Question) => { initialAnswers[q.id] = ''; });
        setAnswers(initialAnswers);
        setIsLoading(false);
      } catch (offErr) {
        console.error('Offline question load failed:', offErr);
        // Fallback to backup on failure
        setQuestions(DEFAULT_BACKUP_QUESTIONS);
        const initialAnswers: Record<number, string> = {};
        DEFAULT_BACKUP_QUESTIONS.forEach((q: Question) => { initialAnswers[q.id] = ''; });
        setAnswers(initialAnswers);
        setIsLoading(false);
      }
    };

    loadOfflineQuestions();
  }, []);

  // Update sessionStorage on changes
  useEffect(() => {
    if (questions.length === 0) return;
    const sessionKey = `offline_session_${targetRole}_${targetCompany}_${targetDifficulty}`;
    sessionStorage.setItem(sessionKey, JSON.stringify({
      savedQuestions: questions,
      savedAnswers: answers,
      savedIndex: currentIndex
    }));
  }, [answers, currentIndex, questions, targetRole, targetCompany, targetDifficulty]);

  const handleAnswerChange = (text: string) => {
    const activeQuestion = questions[currentIndex];
    if (!activeQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: text
    }));
  };

  const totalAnswered = Object.values(answers).filter(ans => ans.trim().length > 0).length;
  const isSubmitEnabled = totalAnswered === questions.length && !isSubmitting && questions.length > 0;

  const handleSubmitAll = async () => {
    if (!isSubmitEnabled) return;

    setIsSubmitting(true);

    const formattedAnswers = questions.map(q => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id] || ''
    }));

    const newPendingAttempt = {
      id: `offline-${Date.now()}`,
      role: targetRole,
      company: targetCompany,
      difficulty: targetDifficulty,
      date: new Date().toISOString(),
      score: 'Pending',
      accuracy: 'Pending',
      status: 'Pending Analysis',
      isOffline: true,
      questions: questions,
      answers: formattedAnswers
    };

    try {
      // 1. Get and update pending list in IndexedDB
      const pendingList = (await getAuthValue('pending_interviews')) || [];
      pendingList.unshift(newPendingAttempt);
      await setAuthValue('pending_interviews', pendingList);

      // 2. Prepend to history cache in localStorage for immediate visual sync
      const cachedHistory = localStorage.getItem('chatbot_completed_interviews');
      let serverCompleted = [];
      if (cachedHistory) {
        serverCompleted = JSON.parse(cachedHistory);
      }
      localStorage.setItem('chatbot_completed_interviews', JSON.stringify([...pendingList, ...serverCompleted]));

      // 3. Clear session storage
      const sessionKey = `offline_session_${targetRole}_${targetCompany}_${targetDifficulty}`;
      sessionStorage.removeItem(sessionKey);

      alert("Interview finished! Your answers are saved locally. Connect to the internet to Sync & Analyze them from your History.");
      router.push('/chatbot?tab=history');
    } catch (e) {
      console.error(e);
      alert("Failed to save answers locally. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen t-bg-base t-text-pri flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-purple-500 mx-auto" />
          <h2 className="text-lg font-black tracking-tight">Loading Offline Interview...</h2>
          <p className="text-xs t-text-muted max-w-xs leading-relaxed">Retrieving cached assessment questions from IndexedDB...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen h-screen flex flex-col t-bg-base t-text-pri overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* OFFLINE MODE INDICATOR BANNER */}
      <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-xs font-bold text-amber-500 dark:text-amber-450 uppercase tracking-widest flex items-center gap-1.5">
          <AlertCircle size={14} /> Offline Mode — Answers will be saved locally as Pending Analysis
        </span>
      </div>

      {/* TOP NAVBAR */}
      <header className="p-4 lg:px-8 border-b t-border flex justify-between items-center bg-white/[0.02] backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to exit? Your current offline responses will be lost.")) {
                const sessionKey = `offline_session_${targetRole}_${targetCompany}_${targetDifficulty}`;
                sessionStorage.removeItem(sessionKey);
                router.push('/chatbot');
              }
            }}
            className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-purple-500 flex items-center gap-1.5 text-xs font-bold border t-border"
          >
            <ChevronLeft size={16} /> Exit
          </button>
          <div>
            <h1 className="text-md font-bold tracking-tight">Offline Technical Assessment</h1>
            <p className="text-[9px] font-black uppercase tracking-wider text-purple-400">
              {targetCompany} • {targetRole} ({targetDifficulty})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-purple-600/10 px-4 py-2 rounded-xl border border-purple-500/20 shrink-0">
          <Cpu size={14} className="text-purple-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest text-purple-300 uppercase">
            Completed: {totalAnswered} / {questions.length}
          </span>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden relative">
        
        {/* LEFT COLUMN: QUESTION GRID MAP */}
        <aside className="w-72 border-r t-border bg-white/[0.01] shrink-0 p-5 flex flex-col justify-between hidden md:flex min-h-0 overflow-hidden">
          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Question Map</h3>
              <p className="text-[10px] t-text-muted mt-1 leading-normal">
                Navigate back and forth freely. Answers are saved locally in real-time.
              </p>
            </div>

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

          <div className="mt-auto p-4 rounded-2xl t-bg-card border t-border space-y-2 shrink-0">
            <div className="flex justify-between items-center text-[10px] font-black uppercase t-text-sec">
              <span>Overall Progress</span>
              <span>{questions.length > 0 ? Math.round((totalAnswered / questions.length) * 100) : 0}%</span>
            </div>
            <div className="h-1.5 w-full t-progress-track rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-500 rounded-full" 
                style={{ width: `${questions.length > 0 ? (totalAnswered / questions.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gradient-to-b from-transparent to-black/10">
          
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col justify-center min-h-0">
            <div className="max-w-4xl mx-auto w-full space-y-6">
              
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-purple-600/10 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase tracking-wider">
                  Offline Assessment Task
                </span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-black">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Question Box */}
              <div className="space-y-4">
                <div className="p-6 rounded-[24px] t-question-box border animate-in slide-in-from-bottom-2 duration-300">
                  <h2 className="text-lg lg:text-xl font-extrabold leading-relaxed t-question-text italic">
                    "{currentQuestion?.question}"
                  </h2>
                </div>
              </div>

              {/* Answer Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-400 pl-1">
                  <span>Your Response</span>
                  {answers[currentQuestion?.id]?.trim().length > 0 ? (
                    <span className="text-green-650 dark:text-green-550 flex items-center gap-1 font-black">
                      <CheckCircle2 size={10} /> Saved to Local Cache
                    </span>
                  ) : (
                    <span className="text-amber-500">Answer Required</span>
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

          {/* FOOTER ACTIONS */}
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

            <button
              onClick={handleSubmitAll}
              disabled={!isSubmitEnabled}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-xs hover:from-amber-450 hover:to-amber-550 transition-all flex items-center gap-1.5 shadow-md shadow-amber-900/20 disabled:opacity-40 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving Locally...
                </>
              ) : (
                <>
                  Finish Offline Assessment <CheckCircle2 size={14} />
                </>
              )}
            </button>
          </footer>

        </main>

      </div>
    </div>
  );
}
