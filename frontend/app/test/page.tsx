'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, User, Cpu, ChevronLeft, Loader2 } from 'lucide-react';

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewData, setInterviewData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('interview_data');
    if (!stored) {
      router.push('/chatbot');
      return;
    }
    const data = JSON.parse(stored);
    setQuestions(data.questions);
    setInterviewData(data);
  }, [router]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim() || isLoading) return;

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentIndex < 4) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Final submission
      setIsLoading(true);
      const token = localStorage.getItem('token');
      try {
        // Format data as requested: { company, role, answers: [{ question, userAnswer }] }
        const formattedAnswers = questions.map((q, i) => ({
          question: q,
          userAnswer: newAnswers[i]
        }));

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/interview/analyze`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            company: interviewData.company,
            role: interviewData.role,
            answers: formattedAnswers
          })
        });
        
        if (!res.ok) {
          throw new Error('Analysis failed');
        }

        const data = await res.json();
        // Store analysis in localStorage or state
        localStorage.setItem('last_result', JSON.stringify({ evaluation: JSON.stringify(data) }));
        router.push('/result');
      } catch (err) {
        console.error(err);
        alert('Performance analysis failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (questions.length === 0) return null;

  return (
    <div className="min-h-screen t-bg-base t-text-pri flex flex-col font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="p-6 lg:p-10 border-b t-border flex justify-between items-center bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/chatbot')}
            className="p-3 rounded-2xl hover:bg-white/5 transition-all text-purple-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tight">Technical Assessment</h1>
            <p className="text-xs font-black uppercase tracking-widest text-purple-500">
              {interviewData?.company} • {interviewData?.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-purple-600/10 px-6 py-3 rounded-2xl border border-purple-500/20">
          <Cpu size={18} className="text-purple-500 animate-pulse" />
          <span className="text-sm font-black tracking-widest text-purple-400">Question {currentIndex + 1} / 5</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 lg:p-12 flex flex-col justify-center">
        <div className="space-y-12">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-700 ease-out"
              style={{ width: `${((currentIndex + 1) / 5) * 100}%` }}
            />
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20">
                <Cpu size={24} className="text-white" />
              </div>
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-purple-500">The Challenge</span>
                <h2 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight italic">
                  "{questions[currentIndex]}"
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-6 pt-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-500/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Explain your approach here..."
                  className="w-full min-h-[200px] p-8 rounded-[32px] t-bg-card border t-border focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all text-lg leading-relaxed relative resize-none"
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!currentAnswer.trim() || isLoading}
                  className="px-10 py-5 bg-purple-600 text-white rounded-[24px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-purple-500 disabled:opacity-50 transition-all shadow-xl shadow-purple-600/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      {currentIndex === 4 ? 'Finish Assessment' : 'Next Question'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Decorative */}
      <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-purple-600/5 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
