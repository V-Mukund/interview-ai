'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2, AlertCircle, TrendingUp, RotateCcw, Home, Cpu,
  XCircle, MessageSquare, Target, Award, Zap, X, ChevronRight, ArrowLeft
} from 'lucide-react';

function HiringBadge({ level }: { level: string }) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    'Beginner':         { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
    'Improving':        { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    'Job Ready':        { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    'Strong Candidate': { color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  };
  const style = map[level] || map['Beginner'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${style.color} ${style.bg} ${style.border}`}>
      <Award size={10} /> {level}
    </span>
  );
}

function ScoreRing({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100);
  const color = pct >= 75 ? '#a855f7' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 42}`}
          strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-2xl font-black tracking-tight" style={{ color }}>{score}</p>
        <p className="text-[9px] text-neutral-500 font-bold">/{max}</p>
      </div>
    </div>
  );
}

import { API_BASE_URL } from '../../lib/config';

const baseUrl = API_BASE_URL;

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [parsedEvaluation, setParsedEvaluation] = useState<any>(null);
  const [rawFallback, setRawFallback] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchReport = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`${baseUrl}/api/interviews/${id}/performance`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to retrieve performance assessment report');
          const data = await res.json();
          setParsedEvaluation(data);
        } catch (err: any) {
          console.error(err);
          setErrorMsg(err.message || 'Error fetching report');
        } finally {
          setIsLoading(false);
        }
      };
      fetchReport();
    } else {
      const stored = localStorage.getItem('last_result');
      if (!stored) {
        router.push('/chatbot');
        return;
      }
      const data = JSON.parse(stored);
      if (data.evaluation) {
        try {
          const parsed = typeof data.evaluation === 'string' ? JSON.parse(data.evaluation) : data.evaluation;
          setParsedEvaluation(parsed);
        } catch {
          setRawFallback(typeof data.evaluation === 'string' ? data.evaluation : JSON.stringify(data.evaluation, null, 2));
        }
      }
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen t-bg-base t-text-pri flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-black tracking-tight">Fetching Assessment Evaluation...</h2>
          <p className="text-xs t-text-muted max-w-xs leading-relaxed">Retrieving personalized feedback, granular scores, and strengths analysis from our secure repository.</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen t-bg-base t-text-pri flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4 max-w-md p-8 rounded-3xl bg-red-500/5 border border-red-500/20">
          <p className="text-4xl text-red-500">⚠️</p>
          <h2 className="text-lg font-black text-red-500">Assessment Report Not Found</h2>
          <p className="text-xs t-text-muted leading-relaxed">{errorMsg}</p>
          <button 
            onClick={() => router.push('/chatbot')}
            className="mt-4 px-6 py-2.5 bg-neutral-800 text-white rounded-xl font-bold text-xs hover:bg-neutral-700 transition-all border border-white/5"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!parsedEvaluation && !rawFallback) return null;

  return (
    <div className="min-h-screen h-auto lg:h-screen flex flex-col t-bg-base t-text-pri lg:overflow-hidden overflow-y-auto p-4 gap-4 font-sans relative selection:bg-purple-500/30">
      
      {/* 1. COMPACT HEADER NAVBAR */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center border-b t-border pb-3 shrink-0 gap-4">
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-[3px] text-purple-500">FORGE Interview AI</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-black tracking-tight leading-none">
              {parsedEvaluation?.company && parsedEvaluation?.role 
                ? `${parsedEvaluation.company.charAt(0).toUpperCase() + parsedEvaluation.company.slice(1)} - ${parsedEvaluation.role}` 
                : 'Performance Report'
              }
            </h1>
            {parsedEvaluation?.hiringReadiness && (
              <HiringBadge level={parsedEvaluation.hiringReadiness} />
            )}
          </div>
          {parsedEvaluation?.date && (
            <p className="text-[10px] font-bold t-text-muted uppercase tracking-wider pl-0.5 pt-1">
              Assessment Date: {new Date(parsedEvaluation.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/chatbot?tab=history')}
            className="px-3.5 py-2 bg-purple-50 dark:bg-purple-650/15 border border-purple-300 dark:border-purple-500/20 text-purple-700 dark:text-purple-400 rounded-xl font-bold hover:bg-purple-100 dark:hover:bg-purple-650 hover:text-purple-800 dark:hover:text-white transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
          >
            <ArrowLeft size={14} /> Back to History
          </button>
          <button
            onClick={() => router.push('/chatbot')}
            className="t-nav-btn px-3.5 py-2 rounded-xl border font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Home size={14} /> Dashboard
          </button>
          <button
            onClick={() => router.push('/chatbot')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold hover:from-purple-500 hover:to-purple-700 transition-all flex items-center gap-1.5 shadow-md shadow-purple-900/30 text-xs cursor-pointer"
          >
            <RotateCcw size={14} /> New Interview
          </button>
        </div>
      </header>

      {/* 2. DYNAMIC CONTENT MAIN GRID */}
      {parsedEvaluation ? (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 lg:overflow-hidden overflow-y-auto relative">
          
          {/* LEFT SIDEBAR: OVERALL SCORE & SUMMARY (w-72) */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4 min-h-0 lg:overflow-hidden">
            
            {/* Score Ring Summary */}
            <div className="p-4 rounded-[24px] bg-purple-600/5 border border-purple-500/20 flex flex-col items-center justify-center gap-3 shrink-0">
              <ScoreRing score={parsedEvaluation?.overallScore ?? 0} max={100} />
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-purple-400">Overall Score</p>
                <div className="flex items-center gap-1.5 justify-center mt-1">
                  <span className="text-xs font-black text-pink-400">{parsedEvaluation?.skillLevel || 'N/A'}</span>
                  <span className="text-[9px] t-text-muted font-bold uppercase">• {parsedEvaluation?.hiringReadiness || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* AI Final Recommendation Card */}
            <div className="p-4 rounded-[24px] bg-white/[0.02] border t-border flex-1 min-h-[160px] lg:min-h-0 overflow-hidden flex flex-col gap-2">
              <h3 className="font-black uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-purple-400 shrink-0">
                <TrendingUp size={12} /> AI Recommendation
              </h3>
              <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 text-[11px] t-text-sec leading-relaxed">
                {parsedEvaluation?.finalRecommendation || 'No recommendation provided.'}
              </div>
            </div>

          </aside>

          {/* RIGHT PANELS: ANALYTICS + QUESTION GRID (flex-1) */}
          <main className="flex-1 min-h-0 flex flex-col gap-4 lg:overflow-hidden">
            
            {/* TOP ROW: STRENGTHS & WEAK AREAS (h-[38%]) */}
            <div className="h-auto lg:h-[38%] min-h-0 flex flex-col md:flex-row gap-4 lg:overflow-hidden">
              
              {/* Strengths Card */}
              <div className="flex-1 p-4 rounded-[24px] bg-green-500/5 border border-green-500/20 flex flex-col gap-2 min-h-[180px] lg:min-h-0 lg:overflow-hidden">
                <h3 className="font-black uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-green-400 shrink-0">
                  <CheckCircle2 size={12} /> Key Strengths
                </h3>
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                  <ul className="space-y-1.5">
                    {(Array.isArray(parsedEvaluation?.strengths) ? parsedEvaluation.strengths : []).map((s: string, i: number) => (
                      <li key={i} className="text-[11px] t-text-muted flex items-start gap-1.5 leading-normal">
                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Weak Areas Card */}
              <div className="flex-1 p-4 rounded-[24px] bg-amber-500/5 border border-amber-500/20 flex flex-col gap-2 min-h-[180px] lg:min-h-0 lg:overflow-hidden">
                <h3 className="font-black uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-amber-400 shrink-0">
                  <AlertCircle size={12} /> Areas to Improve
                </h3>
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                  <ul className="space-y-1.5">
                    {(Array.isArray(parsedEvaluation?.weakAreas) ? parsedEvaluation.weakAreas : []).map((w: string, i: number) => (
                      <li key={i} className="text-[11px] t-text-muted flex items-start gap-1.5 leading-normal">
                        <span className="text-amber-500 mt-0.5 shrink-0">!</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* BOTTOM ROW: 5 QUESTION CARDS GRID (h-[62%]) */}
            <div className="h-auto lg:h-[62%] min-h-0 flex flex-col gap-2 lg:overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-purple-400 shrink-0 flex items-center gap-1.5">
                <Cpu size={12} /> Question Breakdown
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 flex-1 min-h-0 lg:overflow-hidden">
                {(Array.isArray(parsedEvaluation?.questionWiseFeedback) ? parsedEvaluation.questionWiseFeedback : []).map((qf: any, i: number) => {
                  const score = qf?.score ?? 0;
                  const scoreColor = score >= 8 ? 'text-green-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';
                  const scoreBg = score >= 8 ? 'bg-green-500/10 border-green-500/20' : score >= 5 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

                  return (
                    <div 
                      key={i}
                      className="p-3.5 rounded-[24px] t-bg-card border t-border flex flex-col justify-between overflow-hidden min-h-0 relative group"
                    >
                      {/* Top Question Header */}
                      <div className="space-y-2 flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center shrink-0">
                          <span className="text-[10px] font-black tracking-widest t-text-muted uppercase">Q{i + 1}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${scoreBg} ${scoreColor}`}>
                            Score: {score}
                          </span>
                        </div>
                        
                        {/* Clamped Question text */}
                        <h4 className="text-[11px] font-bold t-text leading-normal line-clamp-2 shrink-0">
                          {qf?.question || `Question ${i + 1}`}
                        </h4>

                        {/* Clamped Answer Teaser */}
                        <p className="text-[10px] t-text-muted leading-snug line-clamp-2 italic pr-0.5 shrink-0">
                          "{qf?.userAnswer || 'No answer provided'}"
                        </p>

                        {/* Clamped Feedback Summary */}
                        <p className="text-[10px] t-text-sec leading-relaxed line-clamp-3 pr-0.5 overflow-hidden flex-1 mt-1">
                          {qf?.feedback || 'N/A'}
                        </p>
                      </div>

                      {/* Small Bottom trigger button */}
                      <button
                        onClick={() => {
                          setSelectedQuestion(qf);
                          setSelectedIdx(i);
                        }}
                        className="text-[10px] font-black text-purple-500 hover:text-purple-400 text-left cursor-pointer flex items-center gap-0.5 mt-2 pt-2 border-t t-border shrink-0 transition-colors"
                      >
                        View Details <ChevronRight size={10} />
                      </button>

                    </div>
                  );
                })}
              </div>
            </div>

          </main>

        </div>
      ) : (
        <div className="flex-1 min-h-0 p-4 bg-white/3 border t-border rounded-[24px] overflow-y-auto custom-scrollbar">
          <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[var(--text-secondary)]">
            {rawFallback}
          </pre>
        </div>
      )}

      {/* 3. DETAIL OVERLAY MODAL */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-white/10 rounded-[24px] sm:rounded-[32px] max-w-2xl w-full p-4 sm:p-6 flex flex-col max-h-[85vh] overflow-hidden shadow-2xl relative">
            
            {/* Top Close Button */}
            <button 
              onClick={() => setSelectedQuestion(null)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/5"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 border-b border-white/5 pb-4 pr-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-600/15 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-wider">
                  Question {selectedIdx + 1}
                </span>
                <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/15">
                  AI Score: {selectedQuestion.score} / 10
                </span>
              </div>
              <h2 className="text-md font-black text-white italic leading-snug">
                "{selectedQuestion.question}"
              </h2>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-4 pr-1 text-xs">
              
              {/* Candidate response */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Candidate Response</p>
                <div className="p-3.5 rounded-2xl bg-purple-500/[0.02] border border-purple-500/10 text-neutral-300 leading-relaxed font-medium">
                  {selectedQuestion.userAnswer || <span className="italic text-neutral-500">No answer provided</span>}
                </div>
              </div>

              {/* Expected answer summary */}
              {selectedQuestion.expectedAnswerSummary && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-400">Expected Concepts</p>
                  <div className="p-3.5 rounded-2xl bg-green-500/[0.02] border border-green-500/10 text-neutral-300 leading-relaxed">
                    {selectedQuestion.expectedAnswerSummary}
                  </div>
                </div>
              )}

              {/* Lists column split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Correct points */}
                {Array.isArray(selectedQuestion.correctPointsMentioned) && selectedQuestion.correctPointsMentioned.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-green-500/5 border border-green-500/10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 size={12} /> Correct concepts covered
                    </p>
                    <ul className="space-y-1">
                      {selectedQuestion.correctPointsMentioned.map((pt: string, idx: number) => (
                        <li key={idx} className="text-[11px] t-text-muted flex items-start gap-1 leading-snug">
                          <span className="text-green-500 font-bold shrink-0">✓</span> <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing points */}
                {Array.isArray(selectedQuestion.missingImportantPoints) && selectedQuestion.missingImportantPoints.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 shrink-0">
                      <AlertCircle size={12} /> Recommended points to add
                    </p>
                    <ul className="space-y-1">
                      {selectedQuestion.missingImportantPoints.map((pt: string, idx: number) => (
                        <li key={idx} className="text-[11px] t-text-muted flex items-start gap-1 leading-snug">
                          <span className="text-amber-500 font-bold shrink-0">!</span> <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mistakes */}
                {Array.isArray(selectedQuestion.mistakesOrWrongConcepts) && selectedQuestion.mistakesOrWrongConcepts.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-2 col-span-1 md:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5 shrink-0">
                      <XCircle size={12} /> Conceptual Errors / Improvements
                    </p>
                    <ul className="space-y-1">
                      {selectedQuestion.mistakesOrWrongConcepts.map((pt: string, idx: number) => (
                        <li key={idx} className="text-[11px] t-text-muted flex items-start gap-1 leading-snug">
                          <span className="text-red-400 font-bold shrink-0">✗</span> <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              {/* Evaluation Criteria Badges */}
              <div className="flex flex-wrap gap-2">
                {selectedQuestion.communicationClarity && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <MessageSquare size={10} /> Clarity: {selectedQuestion.communicationClarity}
                  </span>
                )}
                {selectedQuestion.technicalAccuracy && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Target size={10} /> Accuracy: {selectedQuestion.technicalAccuracy}
                  </span>
                )}
              </div>

              {/* Comprehensive feedback */}
              <div className="space-y-1 border-t border-white/5 pt-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1 shrink-0">
                  <MessageSquare size={10} /> AI Grading Feedback
                </p>
                <p className="text-[11px] t-text-muted leading-relaxed">
                  {selectedQuestion.feedback || 'N/A'}
                </p>
              </div>

              {/* Improvement Tips */}
              {selectedQuestion.improvement && (
                <div className="space-y-1 border-t border-white/5 pt-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-pink-400 flex items-center gap-1 shrink-0">
                    <Zap size={10} /> Suggested Improvement Approach
                  </p>
                  <p className="text-[11px] t-text-muted leading-relaxed">
                    {selectedQuestion.improvement}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/5 pt-4 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 font-bold rounded-xl transition-all text-xs cursor-pointer border border-white/5"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Decorative Blur Spheres */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-pink-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen t-bg-base t-text-pri flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-black tracking-tight">Initializing Performance Dashboard...</h2>
          <p className="text-xs t-text-muted max-w-xs leading-relaxed">Loading granular grading criteria, technical evaluations, and AI preparedness reviews.</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
