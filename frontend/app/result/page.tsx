'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp, RotateCcw, Home, ChevronRight, Cpu } from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [parsedEvaluation, setParsedEvaluation] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('last_result');
    if (!stored) {
      router.push('/chatbot');
      return;
    }
    const data = JSON.parse(stored);
    setResult(data);

    if (data.evaluation) {
      try {
        const parsed = typeof data.evaluation === 'string' ? JSON.parse(data.evaluation) : data.evaluation;
        setParsedEvaluation(parsed);
      } catch (e) {
        console.error("Failed to parse evaluation as JSON", e);
        // Fallback or handle as plain text
      }
    }
  }, [router]);

  if (!result) return null;

  return (
    <div className="min-h-screen t-bg-base t-text-pri selection:bg-purple-500/30 font-sans">
      <div className="max-w-5xl mx-auto p-6 lg:p-16 space-y-12">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b t-border pb-12">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">Assessment Complete</h1>
            <p className="text-purple-500 font-black uppercase tracking-[0.2em] text-sm">Performance Analysis & Feedback</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/chatbot')}
              className="px-8 py-4 rounded-2xl bg-white/5 border t-border font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Home size={18} /> Dashboard
            </button>
            <button 
              onClick={() => router.push('/chatbot')}
              className="px-8 py-4 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-all flex items-center gap-2 shadow-xl shadow-purple-600/20"
            >
              <RotateCcw size={18} /> New Interview
            </button>
          </div>
        </header>

        {/* Report Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-500/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative p-8 lg:p-16 rounded-[48px] t-bg-card border t-border shadow-2xl space-y-12 overflow-hidden">
            
            {parsedEvaluation ? (
              <div className="space-y-12">
                {/* Score & Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-3xl bg-purple-600/5 border border-purple-500/20 flex flex-col items-center justify-center space-y-2">
                    <span className="text-sm font-black uppercase tracking-widest text-purple-400">Overall Score</span>
                    <span className="text-6xl font-black text-purple-500">{parsedEvaluation?.overallScore ?? 0}/10</span>
                  </div>
                  <div className="p-6 rounded-3xl bg-pink-600/5 border border-pink-500/20 flex flex-col items-center justify-center space-y-2">
                    <span className="text-sm font-black uppercase tracking-widest text-pink-400">Skill Level</span>
                    <span className="text-4xl font-black text-pink-500">{parsedEvaluation?.skillLevel ?? 'Unknown'}</span>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-green-400">
                      <CheckCircle2 size={20} /> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {(Array.isArray(parsedEvaluation?.strengths) ? parsedEvaluation.strengths : []).map((s: string, i: number) => (
                        <li key={i} className="text-[var(--text-secondary)] flex items-start gap-2">
                          <span className="text-green-500">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-amber-400">
                      <AlertCircle size={20} /> Weak Areas
                    </h3>
                    <ul className="space-y-2">
                      {(Array.isArray(parsedEvaluation?.weakAreas) ? parsedEvaluation.weakAreas : []).map((w: string, i: number) => (
                        <li key={i} className="text-[var(--text-secondary)] flex items-start gap-2">
                          <span className="text-amber-500">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Question-wise Feedback */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Cpu size={24} className="text-purple-500" /> Question-wise Feedback
                  </h3>
                  <div className="space-y-6">
                    {(Array.isArray(parsedEvaluation?.questionWiseFeedback) ? parsedEvaluation.questionWiseFeedback : []).map((qf: any, i: number) => (
                      <div key={i} className="p-6 rounded-2xl bg-white/5 border t-border space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold text-lg">Question {i + 1}: {qf?.question || 'N/A'}</h4>
                          <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 text-xs font-bold shrink-0">
                            Score: {qf?.score ?? 0}/10
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-bold text-purple-400">Your Answer:</span> <span className="text-[var(--text-secondary)]">{qf?.userAnswer || 'N/A'}</span></p>
                          <p><span className="font-bold text-green-400">Expected Answer Summary:</span> <span className="text-[var(--text-secondary)]">{qf?.expectedAnswerSummary || 'N/A'}</span></p>
                          <p><span className="font-bold text-blue-400">Feedback:</span> <span className="text-[var(--text-secondary)]">{qf?.feedback || 'N/A'}</span></p>
                          <p><span className="font-bold text-pink-400">Improvement:</span> <span className="text-[var(--text-secondary)]">{qf?.improvement || 'N/A'}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Recommendation */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-600/10 to-pink-500/10 border border-purple-500/20 space-y-3">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp size={20} className="text-purple-500" /> Final Recommendation
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {parsedEvaluation?.finalRecommendation || 'No final recommendation provided.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Fallback to raw text if parsing failed */
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-[var(--text-secondary)] bg-transparent p-0 m-0 border-none">
                  {typeof result.evaluation === 'object' ? JSON.stringify(result.evaluation, null, 2) : result.evaluation}
                </pre>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/5 blur-[120px] rounded-full -z-10" />
    </div>
  );
}
