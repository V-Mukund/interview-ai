'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, BookOpen, Star, Clock, BrainCircuit, X, Play, Zap, FileText, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://interview-ai-production-517f.up.railway.app';

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

    // Load from LocalStorage Cache first (Instant render!)
    try {
      const cachedMats = localStorage.getItem('prep_materials');
      const cachedProg = localStorage.getItem('prep_progress');
      const cachedBook = localStorage.getItem('prep_bookmarks');
      const cachedRec = localStorage.getItem('prep_recently_viewed');

      if (cachedMats) {
        const parsed = JSON.parse(cachedMats);
        setMaterials(parsed);
        setFilteredMaterials(parsed);
      }
      if (cachedProg) setProgress(JSON.parse(cachedProg));
      if (cachedBook) setBookmarks(JSON.parse(cachedBook));
      if (cachedRec) setRecentlyViewed(JSON.parse(cachedRec));
      
      // If we had cache, bypass show full-page loading spinner to avoid flashes
      if (cachedMats) {
        setIsLoading(false);
      }
    } catch (e) {
      console.warn('LocalStorage read failed:', e);
    }

    const token = localStorage.getItem('token');
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
        localStorage.setItem('prep_materials', JSON.stringify(data));
      }
      if (progRes.ok) {
        const progData = await progRes.json();
        setProgress(progData);
        localStorage.setItem('prep_progress', JSON.stringify(progData));
      }
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookmarks(bookData);
        localStorage.setItem('prep_bookmarks', JSON.stringify(bookData));
      }
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecentlyViewed(recData);
        localStorage.setItem('prep_recently_viewed', JSON.stringify(recData));
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
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
    setActiveQuestions(mat.questions || []);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
    if (!selectedMaterial) return;
    setGeneratingQuestions(true);
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Session expired. Please log in again.', 'error');
      setGeneratingQuestions(false);
      return;
    }
    try {
      // Use the standardized async queue endpoint
      const res = await fetch(`${baseUrl}/prep/questions/async`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedMaterial.title,
          company: 'Standard',
          difficulty: 'Intermediate',
        })
      });

      if (!res.ok) throw new Error('Failed to start question generation');

      const data = await res.json();
      if (!data.jobId) throw new Error('No jobId returned from server');

      // Poll GET /queue/status/:jobId until completed
      const result = await pollJobStatus(data.jobId, token || '');
      if (result.questions && result.questions.length > 0) {
        setActiveQuestions(result.questions);
        setCurrentQuestionIndex(0);
        setShowAnswer(false);
        showToast('Generated new questions!', 'success');
      } else {
        showToast('No questions generated', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Generation request failed', 'error');
    } finally {
      setGeneratingQuestions(false);
    }
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
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Learning Center</span></h2>
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
                        <button onClick={handleGenerateQuestions} disabled={generatingQuestions} className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                          {generatingQuestions ? <Loader2 size={12} className="animate-spin" /> : <BrainCircuit size={12} />} Generate New
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
