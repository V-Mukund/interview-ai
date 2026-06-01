'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  MessageSquare,
  History,
  LogOut,
  Sparkles,
  ShieldCheck,
  Plus,
  Camera,
  Trash2,
  Terminal,
  Shield,
  Cpu,
  Layers,
  BarChart,
  TrendingUp,
  Globe,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Edit3,
  Save,
  Check,
  X,
  Zap,
  Award,
  Moon,
  Sun,
  Building2,
  Briefcase,
  Layout,
  Search,
  Filter,
  Star,
  Flame,
  SearchCode,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../theme-provider';
import PrepDashboard from '../../components/PrepDashboard';

import { API_BASE_URL } from '../../lib/config';

const baseUrl = API_BASE_URL;

export default function ChatbotPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [completedInterviews, setCompletedInterviews] = useState<any[]>([]);
  const [selectedInterviews, setSelectedInterviews] = useState<(string | number)[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPrepMaterials, setShowPrepMaterials] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedChats, setSelectedChats] = useState<number[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ANALYTICS STATES
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalInterviews: 0,
    todayInterviews: 0,
    weeklyInterviews: 0,
    monthlyInterviews: 0,
    averageFrequency: 0,
    recentActivities: [],
    dailyStats: [],
    mostActiveDay: 'Monday'
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  
  // MOCK INTERVIEW STATES
  const [isMockMode, setIsMockMode] = useState(true);
  const [mockStep, setMockStep] = useState(0);
  const [mockState, setMockState] = useState<'idle' | 'answering' | 'evaluating' | 'finished'>('idle');
  const [mockQuestions, setMockQuestions] = useState<string[]>([]);
  const [mockAnswers, setMockAnswers] = useState<string[]>([]);
  const [mockReport, setMockReport] = useState<string | null>(null);
  const [mockError, setMockError] = useState<string | null>(null);
  
  // SETTINGS STATES
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [selectedCompanyCat, setSelectedCompanyCat] = useState('All');
  const [selectedRoleCat, setSelectedRoleCat] = useState('All');
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedCompanyType, setSelectedCompanyType] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const { theme, toggleTheme, setTheme } = useTheme();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [currentCompany, setCurrentCompany] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [showAllAttemptsModal, setShowAllAttemptsModal] = useState(false);
  const [showPercentagesInWeeklyStats, setShowPercentagesInWeeklyStats] = useState(false);
  const [mounted, setMounted] = useState(false);

  const roles = [
    { id: 'frontend', title: 'Frontend Developer', icon: <Globe size={24} />, color: 'from-blue-500 to-cyan-400', category: 'Web', popular: true },
    { id: 'backend', title: 'Backend Developer', icon: <Terminal size={24} />, color: 'from-orange-500 to-red-500', category: 'Web', popular: true },
    { id: 'fullstack', title: 'Full Stack Developer', icon: <Layers size={24} />, color: 'from-purple-500 to-pink-500', category: 'Web', popular: true },
    { id: 'devops', title: 'DevOps Engineer', icon: <Settings size={24} />, color: 'from-emerald-500 to-teal-500', category: 'Engineering', popular: false },
    { id: 'ai-ml', title: 'AI/ML Engineer', icon: <Cpu size={24} />, color: 'from-violet-600 to-indigo-600', category: 'AI', popular: true },
    { id: 'data', title: 'Data Analyst', icon: <BarChart size={24} />, color: 'from-amber-500 to-yellow-500', category: 'Data', popular: false },
    { id: 'tester', title: 'Software Tester', icon: <Shield size={24} />, color: 'from-rose-500 to-pink-600', category: 'Quality', popular: false },
    { id: 'cloud', title: 'Cloud Engineer', icon: <Globe size={24} />, color: 'from-sky-500 to-blue-600', category: 'Engineering', popular: false },
    { id: 'cyber', title: 'Cybersecurity Analyst', icon: <Shield size={24} />, color: 'from-slate-700 to-slate-900', category: 'Engineering', popular: false },
  ];

  const companies = [
    { id: 'google', title: 'Google', icon: <Globe size={24} />, color: 'from-blue-500 via-red-500 to-yellow-500', tagline: 'The search giant.', difficulty: 'Hard', category: 'FAANG' },
    { id: 'microsoft', title: 'Microsoft', icon: <Layout size={24} />, color: 'from-blue-600 to-cyan-500', tagline: 'Empowering every person.', difficulty: 'Medium', category: 'Big Tech' },
    { id: 'amazon', title: 'Amazon', icon: <Briefcase size={24} />, color: 'from-orange-400 to-neutral-800', tagline: 'Earth\'s most customer-centric company.', difficulty: 'Hard', category: 'FAANG' },
    { id: 'meta', title: 'Meta', icon: <Cpu size={24} />, color: 'from-blue-600 to-blue-400', tagline: 'Connecting the world.', difficulty: 'Hard', category: 'FAANG' },
    { id: 'netflix', title: 'Netflix', icon: <Terminal size={24} />, color: 'from-red-600 to-red-800', tagline: 'Entertainment redefined.', difficulty: 'Hard', category: 'FAANG' },
    { id: 'apple', title: 'Apple', icon: <Cpu size={24} />, color: 'from-neutral-500 to-neutral-200', tagline: 'Think different.', difficulty: 'Hard', category: 'FAANG' },
    { id: 'tcs', title: 'TCS', icon: <Building2 size={24} />, color: 'from-blue-900 to-blue-700', tagline: 'Global IT services leader.', difficulty: 'Easy', category: 'Services' },
    { id: 'infosys', title: 'Infosys', icon: <Building2 size={24} />, color: 'from-blue-500 to-blue-300', tagline: 'Navigate your next.', difficulty: 'Medium', category: 'Services' },
    { id: 'wipro', title: 'Wipro', icon: <Building2 size={24} />, color: 'from-purple-600 to-blue-600', tagline: 'Spirit of achievement.', difficulty: 'Medium', category: 'Services' },
    { id: 'accenture', title: 'Accenture', icon: <Building2 size={24} />, color: 'from-purple-800 to-purple-600', tagline: 'New applied now.', difficulty: 'Medium', category: 'Services' },
  ];


  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    // Fetch user profile
    fetch(`${baseUrl}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/');
        }
        throw new Error('Unauthorized');
      }
      return res.json();
    })
    .then(data => {
      if (data) {
        setUser(data);
        setEditData(data);
      }
    })
    .catch((err) => console.error('Profile fetch failed:', err));

    // Fetch History
    fetchHistory();
    fetchCompletedInterviews();
    fetchDashboardStats();

    // Route to correct initial view tab
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'history') {
        setShowHistory(true);
        setShowProfile(false);
        setShowSettings(false);
        setWizardStep(0);
        setActiveThreadId(null);
      }
    }
  }, []);

  // NETWORK CONNECTIVITY DETECTOR
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // AUTO SCROLL TO BOTTOM
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, mockState]);

  const fetchHistory = async () => {
    // Try to load cached history first
    try {
      const cached = localStorage.getItem('chatbot_history');
      if (cached) {
        setHistory(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('LocalStorage read failed:', e);
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${baseUrl}/chatbot/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        localStorage.setItem('chatbot_history', JSON.stringify(data));
      }
    } catch (err) {
      console.error('History fetch failed:', err);
    }
  };

  const fetchCompletedInterviews = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);

    // Try to load cached completed interviews first
    try {
      const cached = localStorage.getItem('chatbot_completed_interviews');
      if (cached) {
        setCompletedInterviews(JSON.parse(cached));
        setIsLoadingHistory(false);
      }
    } catch (e) {
      console.warn('LocalStorage read failed:', e);
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${baseUrl}/api/interview/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedInterviews(data);
        localStorage.setItem('chatbot_completed_interviews', JSON.stringify(data));
      } else {
        setHistoryError('Could not retrieve mock attempts history.');
      }
    } catch (err) {
      console.error('Failed to fetch completed interviews history:', err);
      setHistoryError('Connection failed. Please check backend server.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);

    // Try to load cached stats first
    try {
      const cached = localStorage.getItem('chatbot_dashboard_stats');
      if (cached) {
        setDashboardStats(JSON.parse(cached));
        setIsLoadingStats(false);
      }
    } catch (e) {
      console.warn('LocalStorage read failed:', e);
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${baseUrl}/api/dashboard/interview-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
        localStorage.setItem('chatbot_dashboard_stats', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleToggleSelectInterview = (id: number | string) => {
    setSelectedInterviews(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllInterviews = () => {
    if (selectedInterviews.length === completedInterviews.length) {
      setSelectedInterviews([]);
    } else {
      setSelectedInterviews(completedInterviews.map(item => item.id));
    }
  };

  const handleDeleteInterviews = async (idsToDelete: (string | number)[], isBulk: boolean) => {
    const message = isBulk 
      ? 'Are you sure you want to delete selected interview history?'
      : 'Are you sure you want to delete this interview history?';
      
    if (!confirm(message)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${baseUrl}/api/interview/history`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ interviewIds: idsToDelete })
      });

      if (res.ok) {
        // Remove deleted items from UI state immediately
        setCompletedInterviews(prev => prev.filter(item => !idsToDelete.includes(item.id)));
        
        // Remove deleted items from current selection if any
        setSelectedInterviews(prev => prev.filter(id => !idsToDelete.includes(id)));

        // Refresh stats
        fetchDashboardStats();
      } else {
        alert('Failed to delete interview history.');
      }
    } catch (err) {
      console.error('Failed to delete interview history:', err);
      alert('Error occurred while deleting history.');
    }
  };


  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your entire conversation history?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${baseUrl}/chatbot/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Clear history failed:', err);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedChats(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedChats.length === history.length) {
      setSelectedChats([]);
    } else {
      setSelectedChats(history.map(h => h.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedChats.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedChats.length} selected conversations?`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${baseUrl}/chatbot/delete-multiple`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ids: selectedChats }),
      });
      if (res.ok) {
        setSelectedChats([]);
        fetchHistory();
      }
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  const loadConversation = (chat: any) => {
    // If selecting the current one, do nothing
    if (activeThreadId === chat.id) return;
    
    // Map backend 'content' to frontend 'message'
    const threadMessages = chat.messages.map((m: any) => ({
      message: m.content,
      sender: m.sender,
      timestamp: new Date(m.timestamp)
    }));
    
    setMessages(threadMessages);
    setActiveThreadId(chat.id);
    setCurrentRole(chat.role || 'Software Developer');
    setCurrentCompany(chat.company || 'Standard');
    setDifficulty(chat.difficulty || 'Intermediate');
    setIsMockMode(chat.mode === 'mock');
  };

  const startNewChat = () => {
    setCurrentRole(null);
    setCurrentCompany(null);
    setSelectedCompanyType(null);
    setSelectedExperience(null);
    setWizardStep(1);
    setMessages([]);
    setActiveThreadId(null);
    setIsMockMode(true);
    setMockStep(0);
    setMockState('idle');
    setShowSettings(false);
  };

  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const startMockInterview = () => {
    if (!currentRole) return;
    
    localStorage.setItem('target_role', currentRole);
    localStorage.setItem('target_company', currentCompany || 'Standard');
    localStorage.setItem('target_difficulty', difficulty);

    router.push('/test');
  };

  const handleMockSubmit = async (answer: string) => {
    if (!answer.trim() || isLoading) return;
    
    const newAnswers = [...mockAnswers, answer];
    setMockAnswers(newAnswers);
    
    const userMsg = { message: answer, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    if (mockStep < 5) {
      const nextQ = mockQuestions[mockStep];
      const botMsg = { 
        message: `━━━━━━━━━━━━━━━━━━━\nQuestion ${mockStep + 1} of 5\n━━━━━━━━━━━━━━━━━━━\n${nextQ}`, 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMockStep(prev => prev + 1);
      setTimeout(() => setMessages(prev => [...prev, botMsg]), 500);
    } else {
      setIsLoading(true);
      setMockState('evaluating');
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${baseUrl}/prep/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            company: currentCompany || 'Standard',
            role: currentRole,
            questions: mockQuestions,
            answers: newAnswers
          }),
        });

        if (!res.ok) throw new Error('Submission failed');
        const data = await res.json();

        if (data.jobId) {
          const EVAL_POLL_INTERVAL = 2000;
          const EVAL_MAX_POLLS = 60; // 60 * 2s = 120s max wait

          const pollJobStatus = async (jobId: string, token: string): Promise<any> => {
            return new Promise((resolve, reject) => {
              let pollCount = 0;
              const interval = setInterval(async () => {
                pollCount++;
                if (pollCount > EVAL_MAX_POLLS) {
                  clearInterval(interval);
                  reject(new Error('Evaluation timed out. Your transcript has been saved.'));
                  return;
                }
                try {
                  const statusRes = await fetch(`${baseUrl}/queue/status/${jobId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (!statusRes.ok) {
                    // Tolerate transient network errors
                    if (pollCount >= 3) {
                      clearInterval(interval);
                      reject(new Error('Failed to get evaluation status'));
                    }
                    return;
                  }
                  const statusData = await statusRes.json();
                  if (statusData.state === 'completed') {
                    clearInterval(interval);
                    resolve(statusData.result);
                  } else if (statusData.state === 'failed') {
                    clearInterval(interval);
                    reject(new Error(statusData.failedReason || 'Evaluation failed in background'));
                  }
                } catch (err: any) {
                  if (pollCount >= 3) {
                    clearInterval(interval);
                    reject(new Error(err.message || 'Network error during evaluation'));
                  }
                }
              }, EVAL_POLL_INTERVAL);
            });
          };

          const result = await pollJobStatus(data.jobId, token || '');
          const evalText = typeof result.evaluation === 'string' ? result.evaluation : JSON.stringify(result);
          setMockReport(evalText);
          setMockState('finished');
          
          const botMsg = { message: evalText, sender: 'bot', timestamp: new Date() };
          setMessages(prev => [...prev, botMsg]);
          
          fetchHistory();
          fetchCompletedInterviews();
          fetchDashboardStats();
        } else {
          throw new Error('No jobId returned from server');
        }
      } catch (err: any) {
        setMockError(err.message || 'Evaluation failed. Your transcript has been saved.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!editData.username || !editData.email) {
      setStatusMsg({ type: 'error', text: 'Username and Email are required' });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${baseUrl}/auth/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          username: editData.username,
          email: editData.email,
          profilePic: editData.profilePic,
          dateOfBirth: editData.dateOfBirth,
          bio: editData.bio
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setIsEditing(false);
        setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const error = await res.json();
        setStatusMsg({ type: 'error', text: error.message || 'Update failed' });
      }
    } catch (err) {
      console.error('Update failed:', err);
      setStatusMsg({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isMockMode) {
      const currentInput = input;
      setInput('');
      handleMockSubmit(currentInput);
      return;
    }

    const userMsg = { message: input, sender: 'user', timestamp: new Date() };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    const sentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/chatbot/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          message: sentInput, 
          role: currentRole,
          difficulty: difficulty,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to get response');
      
      const botMsg = { message: data.response, sender: 'bot', timestamp: new Date() };
      setMessages([...currentMessages, botMsg]);
      fetchHistory(); 
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg = { message: error.message || 'Something went wrong.', sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionStats = () => {
    let totalScore = 0;
    let maxScore = 0;
    let countWithScore = 0;
    
    history.forEach(chat => {
      chat.messages?.forEach((m: any) => {
        if (m.sender === 'bot') {
          const scoreMatch = m.content?.match(/Total Score:\s*(\d+)\/(\d+)/i) || m.content?.match(/Score:\s*(\d+)\/(\d+)/i);
          if (scoreMatch) {
            totalScore += parseInt(scoreMatch[1]);
            maxScore += parseInt(scoreMatch[2]);
            countWithScore++;
          }
        }
      });
    });
    
    const avgPct = countWithScore > 0 ? Math.round((totalScore / maxScore) * 100) : 78;
    const avgVal = countWithScore > 0 ? Math.round((totalScore / countWithScore) * 10) / 10 : 38.5;
    
    return {
      total: history.length,
      avgScore: `${avgVal} / 50`,
      avgPct,
      readiness: avgPct >= 80 ? "JOB READY" : avgPct >= 60 ? "NEEDS PRACTICE" : "IMPROVE BASICS",
      readinessColor: avgPct >= 80 ? "text-green-500 bg-green-500/10 border-green-500/20" : avgPct >= 60 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    router.push("/");
  };

  const handleExitReport = () => {
    setActiveThreadId(null);
    setMockState('idle');
    setMockReport(null);
    setMessages([]);
  };

  return (
    <div className="flex h-screen t-bg-base t-text font-sans overflow-hidden relative max-w-full" style={{ color: 'var(--text-primary)' }}>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[250] bg-amber-500 text-neutral-900 px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-black shadow-lg uppercase tracking-wider animate-in slide-in-from-top duration-300">
          <AlertTriangle size={16} className="animate-pulse shrink-0" />
          <span>Offline Mode Enabled — Dynamic features may be restricted. Showing cached dashboard logs.</span>
        </div>
      )}
      
      {/* MOBILE MENU TOGGLE */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-6 left-6 z-[100] w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/40"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 1. SIDEBAR (SaaS Style) */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-72 t-bg-base border-r t-border flex flex-col transition-all duration-300 z-50 backdrop-blur-xl shadow-sm ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* BRAND LOGO */}
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight"><span className="text-purple-500">FORGE</span> Interview AI</h1>
            <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest">Master Your Career</p>
          </div>
        </div>

        {/* NAVIGATION SECTION */}
        <div className="px-4 mb-6">
          <p className="px-4 text-sm text-neutral-600 font-black uppercase tracking-widest mb-3">Main Menu</p>
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => { 
                setWizardStep(0); 
                setActiveThreadId(null); 
                setShowSettings(false); 
                setShowProfile(false); 
                setShowHistory(false);
                setShowPrepMaterials(false);
                setIsSidebarOpen(false);
              }}
              className={`sidebar-item ${!activeThreadId && wizardStep === 0 && !showSettings && !showProfile && !showHistory && !showPrepMaterials ? 'sidebar-item-active' : 'sidebar-item-hover t-text-sec hover:t-text'}`}
            >
              <Layout size={20} />
              <span className="text-sm font-bold">Dashboard</span>
            </button>

            <button 
              onClick={() => { startNewChat(); setIsMockMode(true); setShowHistory(false); setShowPrepMaterials(false); setIsSidebarOpen(false); }}
              className={`sidebar-item ${wizardStep > 0 && !activeThreadId && !showSettings && !showProfile && !showHistory && !showPrepMaterials ? 'sidebar-item-active' : 'sidebar-item-hover t-text-sec hover:t-text'}`}
            >
              <Award size={20} />
              <span className="text-sm font-bold">Mock Interview</span>
            </button>
            
            <button 
              onClick={() => {
                setShowPrepMaterials(!showPrepMaterials);
                setShowHistory(false);
                setShowProfile(false);
                setShowSettings(false);
                setWizardStep(0);
                setActiveThreadId(null);
                setIsSidebarOpen(false);
              }}
              className={`sidebar-item ${showPrepMaterials ? 'bg-purple-600/10 text-purple-500' : 'sidebar-item-hover t-text-sec hover:t-text'}`}
            >
              <BookOpen size={20} />
              <span className="text-sm font-bold">Preparation Materials</span>
            </button>

            <button 
              onClick={() => {
                setShowHistory(!showHistory);
                setShowPrepMaterials(false);
                setShowProfile(false);
                setShowSettings(false);
                setWizardStep(0);
                setActiveThreadId(null);
                if (!showHistory) fetchCompletedInterviews();
                setIsSidebarOpen(false);
              }}
              className={`sidebar-item ${showHistory ? 'bg-purple-600/10 text-purple-500' : 'sidebar-item-hover t-text-sec hover:t-text'}`}
            >
              <History size={20} />
              <span className="text-sm font-bold">History</span>
            </button>

            <button 
              onClick={() => { setShowSettings(!showSettings); setShowHistory(false); setShowPrepMaterials(false); setShowProfile(false); setIsSidebarOpen(false); }}
              className={`sidebar-item ${showSettings ? 'bg-purple-600/10 text-purple-500' : 'sidebar-item-hover t-text-sec hover:t-text'}`}
            >
              <Settings size={20} />
              <span className="text-sm font-bold">Settings</span>
            </button>
          </nav>
        </div>

          <div className="px-4 mb-6">
            <div className="flex items-center justify-between px-4 mb-3">
              <p className="text-sm text-neutral-600 font-black uppercase tracking-widest">Active Filters</p>
              {(currentRole || currentCompany) && (
                <button onClick={() => { setCurrentRole(null); setCurrentCompany(null); }} className="text-xs text-purple-500 font-bold hover:underline">Clear</button>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {currentCompany && (
                <div className="px-4 py-3 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${companies.find(c => c.id === currentCompany)?.color} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                    {companies.find(c => c.id === currentCompany)?.title.charAt(0)}
                  </div>
                  <span className="text-xs font-bold truncate">{companies.find(c => c.id === currentCompany)?.title}</span>
                </div>
              )}
              {currentRole && (
                <div className="px-4 py-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${roles.find(r => r.id === currentRole)?.color} flex items-center justify-center shadow-sm`}>
                    {React.cloneElement(roles.find(r => r.id === currentRole)?.icon as React.ReactElement, { size: 12, className: 'text-white' })}
                  </div>
                  <span className="text-xs font-bold truncate">{roles.find(r => r.id === currentRole)?.title}</span>
                </div>
              )}
              {!currentRole && !currentCompany && (
                <p className="px-4 text-xs text-neutral-500 italic">No selection yet...</p>
              )}
            </div>
          </div>

        {/* PROFILE SECTION (BOTTOM) */}
        <div className="p-4 mt-auto">
          <div className="h-px bg-white/5 mx-4 mb-4" />
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${showProfileDropdown ? 'bg-white/5' : 'hover:bg-white/5'}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Me" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-400">
                  {user?.username?.substring(0, 1).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold truncate">{user?.username || 'User'}</p>
              <p className="text-sm text-neutral-500 truncate uppercase tracking-tight">Personal Account</p>
            </div>
          </button>

          {/* DROPDOWN MENU */}
          {showProfileDropdown && (
            <div className="absolute bottom-20 left-4 right-4 bg-[#0f0f0f] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100] backdrop-blur-xl">
              <div className="p-2">
                <button 
                  onClick={() => { setShowProfile(true); setShowProfileDropdown(false); setIsSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-neutral-300"
                >
                  <User size={18} className="text-purple-500" /> View Profile
                </button>
                <div className="h-px bg-white/5 my-1 mx-2" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-bold text-red-500"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. HISTORY COLUMN (Responsive) */}
      <aside className={`fixed md:relative inset-y-0 left-72 md:left-0 transition-all duration-300 border-r t-bg-panel flex flex-col z-40 ${showHistory && activeThreadId ? 'w-72 md:w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`} style={{ borderColor: 'var(--border)' }}>
        <div className="p-6 pt-24 md:pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">History</h2>
              <p className="text-sm text-neutral-600 font-bold uppercase tracking-widest">Control Center</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mb-4">
            <button 
              onClick={handleSelectAll}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Check size={12} className={selectedChats.length === history.length && history.length > 0 ? 'text-green-500' : 'text-neutral-600'} />
              {selectedChats.length === history.length && history.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedChats.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={12} /> Delete ({selectedChats.length})
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-8 scrollbar-hide">
          {history.length > 0 ? (
            history.map((chat, idx) => (
              <div 
                key={chat.id || idx} 
                onClick={() => loadConversation(chat)}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${activeThreadId === chat.id ? 'bg-purple-600/10 border-purple-600' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleSelect(chat.id); }}
                    className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedChats.includes(chat.id) ? 'bg-purple-600 border-purple-600' : 'border-white/10 bg-black/20 hover:border-purple-500'}`}
                  >
                    {selectedChats.includes(chat.id) && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate mb-1 ${activeThreadId === chat.id ? 'text-white font-bold' : 'text-neutral-400'}`}>
                      {chat.title || 'Untitled Session'}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-neutral-600 font-bold uppercase">{new Date(chat.createdAt).toLocaleDateString()}</p>
                      <span className={`text-sm font-black px-1.5 py-0.5 rounded uppercase bg-neutral-800 text-neutral-400`}>
                        {chat.messages?.length || 0} msgs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
              <Plus size={32} className="mb-2" />
              <p className="text-xs">No history yet.</p>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
        />
      )}

      {/* 3. MAIN DASHBOARD (Premium Panel) */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-screen pt-20 md:pt-0" style={{ backgroundColor: 'var(--bg-base)' }}>
        
        {showPrepMaterials ? (
          <PrepDashboard />
        ) : showProfile ? (
          /* 2.1 PROFILE VIEW */
          <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto items-center relative animate-in fade-in duration-500">
            <div className="max-w-2xl w-full">
              <button onClick={() => setShowProfile(false)} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/10 transition-all z-50">
                <X size={24} />
              </button>
              
              <div className="text-center mb-10">
                <div className="relative inline-block group">
                  <div className="w-28 h-28 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[36px] flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden border-4 border-white/10 group-hover:scale-105 transition-transform duration-500">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[36px] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  )}
                </div>
                <h1 className="text-4xl font-black mb-2">{isEditing ? 'Edit Profile' : user?.username}</h1>
                <p className="text-neutral-500 uppercase tracking-widest text-sm font-black">{user?.email}</p>
              </div>

              {statusMsg && (
                <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${statusMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                  {statusMsg.type === 'success' ? <Check size={18} /> : <X size={18} />}
                  <p className="text-sm font-bold">{statusMsg.text}</p>
                </div>
              )}

              <div className="p-8 rounded-[40px] t-bg-card border light-card-shadow space-y-6 relative overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                {!isEditing && (
                  <button 
                    onClick={() => { setIsEditing(true); setEditData(user); }}
                    className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all text-neutral-400 hover:text-white"
                  >
                    <Edit3 size={14} /> Edit Profile
                  </button>
                )}

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm text-neutral-600 uppercase font-black tracking-widest mb-2 block">Username / Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editData.username || ''} 
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <div className="p-6 rounded-3xl t-bg-input" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xl font-bold">@{user?.username}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-neutral-600 uppercase font-black tracking-widest mb-2 block">Account Email</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={editData.email || ''} 
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="p-6 rounded-3xl t-bg-input" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-xl font-bold">{user?.email}</p>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <label className="text-sm text-neutral-600 uppercase font-black tracking-widest mb-2 block">Profile Image URL</label>
                      <input 
                        type="text" 
                        value={editData.profilePic || ''} 
                        onChange={(e) => setEditData({ ...editData, profilePic: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-neutral-600 uppercase font-black tracking-widest mb-2 block">Bio / About</label>
                    {isEditing ? (
                      <textarea 
                        value={editData.bio || ''} 
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <div className="p-6 rounded-3xl t-bg-input min-h-[100px]" style={{ border: '1px solid var(--border)' }}>
                        <p className="t-text-sec leading-relaxed italic">
                          {user?.bio || "No bio yet. Tell the world about your technical journey!"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={handleUpdateProfile} 
                        disabled={isSaving}
                        className="flex-1 py-4 rounded-2xl bg-purple-600 text-white font-black hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><Save size={20} /> Save Changes</>
                        )}
                      </button>
                      <button 
                        onClick={() => { setIsEditing(false); setStatusMsg(null); }}
                        className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                      <LogOut size={20} /> Sign Out Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : showHistory ? (
          /* 2.3 HISTORY VIEW */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-500 relative p-0">
            <div className="px-6 pt-6 lg:px-8 lg:pt-8 shrink-0">
              <header className="flex justify-between items-center pb-4 border-b t-border mb-6">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black tracking-tight leading-none">Assessment <span className="text-purple-500">History</span></h1>
                  <p className="text-neutral-700 dark:text-neutral-400 text-xs font-bold">Review your completed mock sessions, dynamic AI scores, and career preparedness logs.</p>
                </div>
                <div className="flex gap-2.5 shrink-0">
                  {completedInterviews.length > 0 && (
                    <button
                      onClick={() => handleDeleteInterviews(selectedInterviews, true)}
                      disabled={selectedInterviews.length === 0}
                      className="px-4 py-2 border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 disabled:opacity-40 disabled:hover:bg-red-500/5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
                    >
                      <Trash2 size={14} /> Delete Selected {selectedInterviews.length > 0 && `(${selectedInterviews.length})`}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setShowHistory(false);
                      setWizardStep(1);
                      setIsMockMode(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold hover:from-purple-500 hover:to-purple-700 transition-all flex items-center gap-2 shadow-md shadow-purple-900/30 text-xs cursor-pointer shrink-0"
                  >
                    <Sparkles size={14} /> New Interview
                  </button>
                </div>
              </header>
            </div>

            <div className="flex-1 min-h-0 flex flex-col bg-white/[0.01] border-t t-border rounded-none p-6 lg:p-8 overflow-hidden relative w-full h-full">
              {isLoadingHistory ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold t-text-sec">Retrieving completed history...</p>
                </div>
              ) : completedInterviews.length > 0 ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    <div className="hidden md:block">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-sm font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-500 pb-3">
                            <th className="pb-3 pl-4 w-12 text-center">
                              <input 
                                type="checkbox"
                                checked={completedInterviews.length > 0 && selectedInterviews.length === completedInterviews.length}
                                onChange={handleSelectAllInterviews}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                              />
                            </th>
                            <th className="pb-3">Company</th>
                            <th className="pb-3">Target Role</th>
                            <th className="pb-3">Assessment Date</th>
                            <th className="pb-3 text-center">Score</th>
                            <th className="pb-3 text-center">Accuracy</th>
                            <th className="pb-3 text-right pr-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y border-white/5">
                          {completedInterviews.map((item) => {
                            const companyInfo = companies.find(c => c.id === item.company.toLowerCase()) || {
                              title: item.company,
                              color: 'from-neutral-800 to-neutral-600'
                            };
                            const roleInfo = roles.find(r => r.title.toLowerCase() === item.role.toLowerCase() || r.id === item.role.toLowerCase()) || {
                              title: item.role,
                              color: 'from-neutral-800 to-neutral-600'
                            };

                            const scoreColor = item.score >= 80 ? 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20' : 
                                              item.score >= 65 ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' : 
                                              'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';

                            const isSelected = selectedInterviews.includes(item.id);

                            return (
                              <tr key={item.id} className={`group hover:bg-white/[0.01] transition-all ${isSelected ? 'bg-purple-500/[0.02]' : ''}`}>
                                <td className="py-4 pl-4 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectInterview(item.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                  />
                                </td>
                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${companyInfo.color} flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0`}>
                                      {companyInfo.title.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-sm text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {companyInfo.title.charAt(0).toUpperCase() + companyInfo.title.slice(1)}
                                      </p>
                                      <p className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-500">Corporate Target</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4">
                                  <div>
                                    <p className="font-extrabold text-sm text-neutral-900 dark:text-white leading-normal">{roleInfo.title}</p>
                                    <p className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-500">Technical Career Path</p>
                                  </div>
                                </td>

                                <td className="py-4">
                                  <div>
                                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-300">
                                      {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-500">Completed On</p>
                                  </div>
                                </td>

                                <td className="py-4 text-center">
                                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black border ${scoreColor}`}>
                                    {item.score}%
                                  </span>
                                </td>

                                <td className="py-4 text-center">
                                  <span className="text-sm font-bold text-neutral-850 dark:text-neutral-250">
                                    {item.accuracy}%
                                  </span>
                                </td>

                                <td className="py-4 text-right pr-4">
                                  <div className="flex items-center justify-end gap-2.5">
                                    <button
                                      onClick={() => router.push(`/result?id=${item.id}`)}
                                      className="px-4 py-2 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white font-bold text-xs transition-all shadow-sm shadow-purple-900/10 cursor-pointer"
                                    >
                                      View Report
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="block md:hidden space-y-4">
                      {completedInterviews.map((item) => {
                        const companyInfo = companies.find(c => c.id === item.company.toLowerCase()) || {
                          title: item.company,
                          color: 'from-neutral-800 to-neutral-600'
                        };
                        const roleInfo = roles.find(r => r.title.toLowerCase() === item.role.toLowerCase() || r.id === item.role.toLowerCase()) || {
                          title: item.role,
                          color: 'from-neutral-800 to-neutral-600'
                        };

                        const scoreColor = item.score >= 80 ? 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20' : 
                                          item.score >= 65 ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' : 
                                          'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';

                        const isSelected = selectedInterviews.includes(item.id);

                        return (
                          <div key={item.id} className={`p-5 rounded-2xl border t-border flex flex-col gap-4 transition-all ${isSelected ? 'bg-purple-500/[0.02]' : 'bg-white/[0.01]'}`} style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectInterview(item.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                />
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${companyInfo.color} flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0`}>
                                  {companyInfo.title.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-extrabold text-sm text-neutral-900 dark:text-white">
                                    {companyInfo.title.charAt(0).toUpperCase() + companyInfo.title.slice(1)}
                                  </p>
                                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Corporate Target</p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black border ${scoreColor}`}>
                                {item.score}%
                              </span>
                            </div>

                            <div className="border-t border-white/5 pt-3">
                              <p className="font-extrabold text-sm text-neutral-900 dark:text-white leading-normal">{roleInfo.title}</p>
                              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Technical Career Path</p>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                              <div>
                                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-300">
                                  {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500">Completed On</p>
                              </div>
                              <button
                                onClick={() => router.push(`/result?id=${item.id}`)}
                                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-bold text-xs transition-all shadow-sm shadow-purple-900/10 cursor-pointer"
                              >
                                View Report
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-500 mb-4">
                    <History size={28} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">No interview history available</h3>
                  <p className="text-xs t-text-muted max-w-sm mb-6 leading-relaxed">
                    Complete your first mock interview to compile dynamic performance evaluations and readiness ratings.
                  </p>
                  <button
                    onClick={() => {
                      setShowHistory(false);
                      setWizardStep(1);
                      setIsMockMode(true);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-500 transition-all flex items-center gap-2 shadow-md shadow-purple-900/30 cursor-pointer"
                  >
                    <Sparkles size={14} /> Start Mock Interview
                  </button>
                </div>
              )}
            </div>
          </div>

        ) : showSettings ? (
          /* 2.2 SETTINGS VIEW */
          <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto items-center relative animate-in fade-in zoom-in-95 duration-500">
            <div className="max-w-2xl w-full">
              <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 w-12 h-12 rounded-full t-bg-input flex items-center justify-center t-text-sec hover:t-text transition-all z-50" style={{ border: '1px solid var(--border)' }}>
                <X size={24} />
              </button>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-2">App <span className="text-purple-500">Settings</span></h1>
                <p className="t-text-sec text-sm">Customize your interview experience and interface.</p>
              </div>
              <div className="space-y-6">

                {/* ── THEME CARD ── */}
                <div className="p-8 rounded-[32px] t-bg-card light-card-shadow flex items-center justify-between" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-purple-600/10 text-purple-500' : 'bg-amber-400/10 text-amber-500'}`}>
                      {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Theme Mode</h3>
                      <p className="text-xs t-text-muted font-black uppercase mt-1">{theme === 'dark' ? 'Dark' : 'Light'} Mode Active</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className={`w-14 h-8 rounded-full relative p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-purple-600' : 'bg-amber-400'}`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* ── THEME PICKER ── */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-6 rounded-[28px] border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark' ? 'border-purple-500 bg-purple-600/10' : 'border-transparent t-bg-card'}`}
                    style={{ border: theme === 'dark' ? undefined : '2px solid var(--border)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-white/10 flex items-center justify-center">
                      <Moon size={22} className="text-purple-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Dark Mode</p>
                      <p className="text-sm t-text-muted mt-0.5">Easy on the eyes</p>
                    </div>
                    {theme === 'dark' && <Check size={16} className="text-purple-500" />}
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-6 rounded-[28px] border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light' ? 'border-amber-400 bg-amber-400/10' : 'border-transparent t-bg-card'}`}
                    style={{ border: theme === 'light' ? undefined : '2px solid var(--border)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-black/10 flex items-center justify-center shadow">
                      <Sun size={22} className="text-amber-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Light Mode</p>
                      <p className="text-sm t-text-muted mt-0.5">Clean & bright</p>
                    </div>
                    {theme === 'light' && <Check size={16} className="text-amber-500" />}
                  </button>
                </div>
                
                {/* ── LANGUAGE CARD (STATIC) ── */}
                <button 
                  onClick={() => alert("⚠️ Default language cannot be changed.\nThis application currently supports only English.")}
                  className="w-full p-8 rounded-[32px] t-bg-card light-card-shadow flex items-center justify-between group transition-all hover:border-purple-500/30" 
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Globe size={24} /></div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">Language</h3>
                      <p className="text-xs t-text-muted font-black uppercase mt-1">English (Default)</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="t-text-muted group-hover:text-purple-500 transition-colors" />
                </button>

              </div>
            </div>
          </div>
        ) : isMockMode && wizardStep <= 5 && wizardStep > 0 && !activeThreadId ? (
          /* 2.3 INTERVIEW SETUP WIZARD */
          <div className="flex-1 flex flex-col p-6 lg:p-12 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
              
              {/* WIZARD HEADER */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Interview <span className="text-purple-500">Setup</span></h2>
                    <p className="text-sm t-text-muted font-black uppercase tracking-widest">Step {wizardStep > 4 ? 4 : wizardStep} of 4</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${wizardStep >= s ? 'w-8 bg-purple-600' : 'w-4 bg-white/10'}`} />
                  ))}
                </div>
              </div>

              {/* AI ASSISTANT BUBBLE */}
              <div className="flex gap-4 items-start animate-in slide-in-from-left duration-500">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20 flex-shrink-0">
                  <Cpu size={20} className="text-white" />
                </div>
                <div className="p-6 rounded-[24px] t-bg-card border t-border relative max-w-2xl">
                  <div className="absolute top-4 -left-2 w-4 h-4 t-bg-card border-l border-b t-border rotate-45" />
                  <p className="font-bold text-lg leading-relaxed">
                    {wizardStep === 1 && (
                      <>Welcome back, <span className="text-purple-500">{user?.username || 'Mukund'} 👋</span><br/><span className="text-sm t-text-sec">Let’s prepare your AI-powered mock interview.</span></>
                    )}
                    {wizardStep === 2 && (
                      <>Great choice 🚀<br/><span className="text-sm t-text-sec">I will use the Technical AI to generate real interview-style questions based on your selected company and role.</span></>
                    )}
                    {wizardStep === 3 && (
                      <>Excellent choice 💡<br/><span className="text-sm t-text-sec">{companies.find(c => c.id === currentCompany)?.title} interview questions will be generated based on real {roles.find(r => r.id === currentRole)?.title.toLowerCase()} interview patterns.</span></>
                    )}
                    {wizardStep === 4 && (
                      <>Nice selection 🎯<br/><span className="text-sm t-text-sec">The Assessment Engine will now prepare five different questions for this role.</span></>
                    )}
                    {wizardStep === 5 && (
                      <>Perfect 👍<br/><span className="text-sm t-text-sec">Your interview will be prepared for {difficulty === 'Hard' ? 'senior' : difficulty === 'Intermediate' ? 'mid-level' : 'fresher'}-level {companies.find(c => c.id === currentCompany)?.title} {roles.find(r => r.id === currentRole)?.title} role.</span></>
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-8">
                {/* STEP 1: COMPANY TYPE */}
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Building2 size={20} className="text-purple-500" />
                      Step 1 of 4 — Choose Company Type
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { id: 'FAANG', title: 'FAANG', color: 'from-purple-600 to-indigo-600', icon: <Globe size={20} /> },
                        { id: 'Big Tech', title: 'Big Tech', color: 'from-blue-600 to-cyan-600', icon: <Building2 size={20} /> },
                        { id: 'Startup', title: 'Startup', color: 'from-orange-500 to-red-500', icon: <Zap size={20} /> },
                        { id: 'Services', title: 'Service Based', color: 'from-emerald-500 to-teal-500', icon: <Settings size={20} /> }
                      ].map(type => (
                        <button 
                          key={type.id}
                          onClick={() => { setSelectedCompanyType(type.id); setWizardStep(2); }}
                          className="group p-6 rounded-3xl t-bg-card border t-border hover:border-purple-500/50 transition-all text-left"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                            {type.icon}
                          </div>
                          <p className="font-black text-sm uppercase tracking-widest">{type.title}</p>
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-start">
                      <button 
                        onClick={() => setWizardStep(0)} 
                        className="text-sm font-bold text-neutral-500 hover:text-purple-500 hover:underline transition-colors"
                      >
                        ← Cancel & Back to Dashboard
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: COMPANY */}
                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Building2 size={20} className="text-purple-500" />
                      Step 2 of 4 — Choose Company
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {companies.filter(c => c.category === selectedCompanyType || (selectedCompanyType === 'Services' && c.category === 'Services')).map(comp => (
                        <button 
                          key={comp.id}
                          onClick={() => { setCurrentCompany(comp.id); setWizardStep(3); }}
                          className="group p-6 rounded-3xl t-bg-card border t-border hover:border-purple-500/50 transition-all text-left flex items-center gap-4"
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${comp.color} flex items-center justify-center text-white font-black text-xl group-hover:rotate-6 transition-transform`}>
                            {comp.title.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{comp.title}</p>
                            <p className="text-sm t-text-muted font-black uppercase tracking-widest">{comp.difficulty} Patterns</p>
                          </div>
                        </button>
                      ))}
                      <button 
                        onClick={() => { setCurrentCompany(null); setWizardStep(3); }}
                        className="group p-6 rounded-3xl t-bg-card border t-border hover:border-purple-500/50 transition-all text-left flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white/5 border t-border flex items-center justify-center text-neutral-500">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-lg">General</p>
                          <p className="text-sm t-text-muted font-black uppercase tracking-widest">Standard Patterns</p>
                        </div>
                      </button>
                    </div>
                    <button onClick={() => setWizardStep(1)} className="text-sm font-bold text-purple-500 hover:underline">← Back to Company Type</button>
                  </div>
                )}

                {/* STEP 3: ROLE */}
                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Briefcase size={20} className="text-purple-500" />
                      Step 3 of 4 — Choose Role
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roles.map(role => (
                        <button 
                          key={role.id}
                          onClick={() => { setCurrentRole(role.id); setWizardStep(4); }}
                          className="group p-6 rounded-3xl t-bg-card border t-border hover:border-purple-500/50 transition-all text-left"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                            {React.cloneElement(role.icon as React.ReactElement, { size: 20 })}
                          </div>
                          <p className="font-bold text-lg">{role.title}</p>
                          <p className="text-sm t-text-muted font-black uppercase tracking-widest">{role.category} Specialist</p>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setWizardStep(2)} className="text-sm font-bold text-purple-500 hover:underline">← Back to Company</button>
                  </div>
                )}

                {/* STEP 4: EXPERIENCE */}
                {wizardStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Settings size={20} className="text-purple-500" />
                      Step 4 of 4 — Choose Experience Level
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { id: 'Entry', title: 'Fresher', desc: 'Starting your career', color: 'bg-green-500' },
                        { id: 'Intermediate', title: '1–3 Years', desc: 'Building expertise', color: 'bg-yellow-500' },
                        { id: 'Hard', title: '3+ Years', desc: 'Senior leadership', color: 'bg-red-500' }
                      ].map(exp => (
                        <button 
                          key={exp.id}
                          onClick={() => { setDifficulty(exp.id); setWizardStep(5); }}
                          className="group p-8 rounded-[40px] t-bg-card border t-border hover:border-purple-500/50 transition-all text-center"
                        >
                          <div className={`w-3 h-3 rounded-full ${exp.color} mx-auto mb-6 group-hover:scale-150 transition-transform shadow-lg`} />
                          <h4 className="text-2xl font-black mb-2">{exp.title}</h4>
                          <p className="text-sm t-text-muted">{exp.desc}</p>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setWizardStep(3)} className="text-sm font-bold text-purple-500 hover:underline">← Back to Role</button>
                  </div>
                )}

                {/* STEP 5: FINAL SUMMARY */}
                {wizardStep === 5 && (
                  <div className="space-y-12 animate-in zoom-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      <div className="space-y-8">
                        <div>
                          <p className="text-sm text-neutral-600 font-black uppercase tracking-widest mb-4 px-1">Interview Setup Completed</p>
                          <div className="p-8 rounded-[48px] t-bg-card border t-border-strong light-card-shadow space-y-6">
                            <div className="flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-br ${currentCompany ? companies.find(c => c.id === currentCompany)?.color : 'from-neutral-800 to-neutral-600'} flex items-center justify-center text-white text-3xl font-black`}>
                                {currentCompany ? companies.find(c => c.id === currentCompany)?.title.charAt(0) : 'G'}
                              </div>
                              <div>
                                <p className="text-xs t-text-muted font-black uppercase">Company</p>
                                <h4 className="text-2xl font-black">{currentCompany ? companies.find(c => c.id === currentCompany)?.title : 'General Path'}</h4>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-3xl t-bg-input">
                                <p className="text-xs t-text-muted font-black uppercase mb-1">Role</p>
                                <p className="font-bold">{roles.find(r => r.id === currentRole)?.title}</p>
                              </div>
                              <div className="p-4 rounded-3xl t-bg-input">
                                <p className="text-xs t-text-muted font-black uppercase mb-1">Experience</p>
                                <p className="font-bold">{difficulty === 'Hard' ? '3+ Years' : difficulty === 'Intermediate' ? '1–3 Years' : 'Fresher'}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between px-2">
                              <div className="flex items-center gap-2">
                                <MessageSquare size={16} className="text-purple-500" />
                                <span className="text-sm font-bold">5 Questions</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-green-500" />
                                <span className="text-sm font-bold">Evaluation Enabled</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-sm text-neutral-600 font-black uppercase tracking-widest px-1">Focus Areas</p>
                          <div className="flex flex-wrap gap-2">
                            {(currentRole === 'frontend' ? ['JavaScript', 'React', 'CSS', 'API Handling', 'Performance Optimization'] : 
                              currentRole === 'backend' ? ['REST APIs', 'Node.js', 'SQL/NoSQL', 'Security', 'Scalability'] :
                              ['Core Concepts', 'Problem Solving', 'Architecture', 'Communication', 'Industry Patterns']).map(tag => (
                              <span key={tag} className="px-4 py-2 rounded-full bg-white/5 border t-border text-xs font-bold">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-8 rounded-[40px] bg-purple-600/5 border border-purple-500/20 space-y-6">
                          <h4 className="text-lg font-black flex items-center gap-2">
                            <Cpu size={20} className="text-purple-500" />
                            Technical AI Generation
                          </h4>
                          <div className="space-y-3">
                            {[
                              { label: 'Company detected', value: currentCompany ? companies.find(c => c.id === currentCompany)?.title : 'Standard' },
                              { label: 'Role detected', value: roles.find(r => r.id === currentRole)?.title },
                              { label: 'Experience detected', value: difficulty === 'Hard' ? 'Senior' : difficulty === 'Intermediate' ? 'Mid' : 'Fresher' },
                              { label: 'Question count', value: '5' },
                              { label: 'Evaluation mode', value: 'Enabled' }
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Check size={14} className="text-green-500" />
                                <span className="t-text-sec">{item.label}:</span>
                                <span className="font-bold">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {mockError && (
                          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-in slide-in-from-top-2">
                            {mockError}
                          </div>
                        )}

                        <button 
                          onClick={startMockInterview}
                          disabled={isLoading}
                          className={`w-full py-6 rounded-3xl ${isLoading ? 'bg-neutral-800 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 hover:scale-[1.02] active:scale-[0.98]'} text-white font-black text-xl shadow-2xl transition-all flex flex-col items-center justify-center gap-1`}
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-3">Generating Questions... <Sparkles className="animate-spin" size={24} /></span>
                          ) : (
                            <>
                              <span className="flex items-center gap-3">Type START to begin <ArrowRight size={24} /></span>
                              <span className="text-sm opacity-60 uppercase tracking-widest">or click here</span>
                            </>
                          )}
                        </button>
                        <button onClick={() => setWizardStep(4)} className="w-full text-sm font-bold t-text-sec hover:t-text transition-colors">← Review Setup</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : !activeThreadId ? (
          /* 2.4 NEW DASHBOARD HOME VIEW! */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-500 relative">
            {/* Navbar / Header */}
            <header className="px-4 pl-16 md:pl-6 py-3 flex items-center justify-between gap-3 shrink-0" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
              {/* Left: Welcome text */}
              <div className="min-w-0">
                <h1 className="text-sm md:text-base font-black truncate" style={{ color: 'var(--text-primary)' }}>
                  Welcome, <span className="text-purple-500">{user?.username || 'Candidate'}</span> 👋
                </h1>
                <p className="text-[10px] md:text-xs font-bold hidden sm:block" style={{ color: 'var(--text-muted)' }}>FORGE Career Preparedness</p>
              </div>
              {/* Right: Date (md+) + actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Date — desktop only */}
                <div className="hidden md:block text-right mr-2">
                  <p className="text-xs font-black text-purple-400">
                    {mounted ? new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </p>
                  <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>Local Timezone</p>
                </div>
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
                </button>
                {/* New Interview */}
                <button
                  onClick={() => { startNewChat(); setIsMockMode(true); }}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold text-xs md:text-sm hover:bg-purple-500 transition-all flex items-center gap-1 shadow-md shadow-purple-900/20 cursor-pointer whitespace-nowrap"
                >
                  <Plus size={11} /> New Interview
                </button>
              </div>
            </header>

            {/* Dashboard Content Container */}
            <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)' }}>
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 p-4 lg:h-full lg:min-h-0 lg:overflow-hidden lg:p-4">
                
                {/* LEFT COLUMN: Profile & Performance */}
                <div className="lg:col-span-3 flex flex-col gap-3 lg:min-h-0 lg:h-full lg:overflow-hidden">
                  
                  {/* Profile + Accuracy Row on Mobile */}
                  <div className="flex flex-row gap-3 lg:flex-col">

                    {/* User Profile Summary Card */}
                    <div className="flex-1 p-4 rounded-2xl border flex flex-col gap-2 overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-base font-black shadow-md shrink-0">
                          {user?.username?.substring(0, 1).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>@{user?.username || 'User'}</h4>
                          <p className="text-[10px] truncate uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>{user?.email || 'Candidate'}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowProfile(true)} className="text-[10px] font-black text-purple-400 hover:text-purple-300 flex items-center gap-0.5 cursor-pointer mt-1">
                        Edit Profile <ChevronRight size={9} />
                      </button>
                    </div>

                    {/* Assessment Accuracy Card */}
                    <div className="flex-1 p-4 rounded-2xl border flex flex-col items-center justify-center gap-2" style={{ backgroundColor: 'rgba(147,51,234,0.05)', borderColor: 'rgba(147,51,234,0.2)' }}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-center" style={{ color: 'var(--text-muted)' }}>Accuracy</p>
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-white/5" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-purple-500" strokeDasharray={`${getSessionStats().avgPct}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-xs font-black text-purple-400">{getSessionStats().avgPct}%</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase border ${getSessionStats().readinessColor}`}>
                        {getSessionStats().readiness}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CENTER COLUMN: Stats + Activity Chart */}
                <div className="lg:col-span-5 flex flex-col gap-3 lg:min-h-0 lg:h-full lg:overflow-hidden">

                  {/* 2×2 Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 shrink-0">

                    {/* CARD 1: Total Interviews */}
                    <div className="p-3 rounded-2xl border flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total</p>
                      <h3 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{dashboardStats.totalInterviews}</h3>
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>All-time</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/10 shrink-0">
                          {dashboardStats.recentActivities?.[0]?.relativeTime || 'None'}
                        </span>
                      </div>
                    </div>

                    {/* CARD 2: Weekly Mocks */}
                    <div className="p-3 rounded-2xl border flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>This Week</p>
                      <h3 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{dashboardStats.weeklyInterviews}</h3>
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Last 7 days</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/10 shrink-0">
                          +{dashboardStats.weeklyInterviews}
                        </span>
                      </div>
                    </div>

                    {/* CARD 3: Today's Mocks */}
                    <div className="p-3 rounded-2xl border flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Today</p>
                      <h3 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{dashboardStats.todayInterviews}</h3>
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Completed</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${dashboardStats.todayInterviews > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' : 'bg-white/5 text-neutral-500 border border-white/5'}`}>
                          {dashboardStats.todayInterviews > 0 ? 'Active' : 'Target: 2'}
                        </span>
                      </div>
                    </div>

                    {/* CARD 4: Mock Frequency */}
                    <div className="p-3 rounded-2xl border flex flex-col gap-1.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Frequency</p>
                      <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{dashboardStats.averageFrequency}<span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>/wk</span></h3>
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Best: {dashboardStats.mostActiveDay?.substring(0, 3)}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10 shrink-0">
                          {dashboardStats.averageFrequency >= 2.0 ? 'Active' : 'Regular'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Activity Trend Chart */}
                  <div
                    onClick={() => setShowPercentagesInWeeklyStats(!showPercentagesInWeeklyStats)}
                    className="flex flex-col p-4 rounded-2xl border cursor-pointer hover:border-purple-500/30 transition-all select-none"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-black text-xs flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                          <TrendingUp size={13} className="text-purple-400" /> Weekly Activity Trend
                        </h3>
                        <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {showPercentagesInWeeklyStats ? 'Showing % of total' : 'Last 7 days (tap to toggle %)'}
                        </p>
                      </div>
                      {completedInterviews.length > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowAllAttemptsModal(true); }}
                          className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-wider cursor-pointer px-2 py-1 rounded border border-purple-500/20 shrink-0"
                        >
                          Logs ({completedInterviews.length})
                        </button>
                      )}
                    </div>
                    <div className="flex items-end justify-between gap-1.5 h-24 px-1">
                      {dashboardStats.dailyStats && dashboardStats.dailyStats.length > 0 ? (
                        dashboardStats.dailyStats.map((dayItem: any, idx: number) => {
                          const maxCount = Math.max(1, ...dashboardStats.dailyStats.map((d: any) => d.count));
                          const percentage = Math.min(100, Math.max(8, (dayItem.count / maxCount) * 100));
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                              <div className="w-full bg-white/5 rounded-t-md relative overflow-hidden flex items-end h-16">
                                <div
                                  className={`w-full rounded-t-sm transition-all duration-700 ${dayItem.count > 0 ? 'bg-gradient-to-t from-purple-700 to-indigo-500' : 'bg-white/5'}`}
                                  style={{ height: `${percentage}%` }}
                                />
                                {dayItem.count > 0 && (
                                  <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-purple-300">
                                    {showPercentagesInWeeklyStats
                                      ? `${Math.round((dayItem.count / Math.max(1, dashboardStats.totalInterviews)) * 100)}%`
                                      : dayItem.count}
                                  </span>
                                )}
                              </div>
                              <span className="text-[8px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>{dayItem.day}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="w-full flex items-center justify-center h-16 text-xs" style={{ color: 'var(--text-muted)' }}>
                          No activity logs yet
                        </div>
                      )}
                    </div>
                    <div className="pt-2 mt-2 border-t text-center" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                        💡 {dashboardStats.weeklyInterviews} this week · {dashboardStats.todayInterviews} today
                      </p>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Recent Activity + Quick Setup */}
                <div className="lg:col-span-4 flex flex-col gap-3 lg:min-h-0 lg:h-full lg:overflow-hidden">

                  {/* Recent Activity Card */}
                  <div
                    onClick={() => { setShowHistory(true); setShowProfile(false); setShowSettings(false); setWizardStep(0); setActiveThreadId(null); fetchCompletedInterviews(); }}
                    className="flex flex-col p-4 rounded-2xl border cursor-pointer hover:border-purple-500/30 transition-all"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center gap-2 pb-2 mb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                      <History size={13} className="text-purple-400" />
                      <div>
                        <h3 className="font-black text-xs" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
                        <p className="text-[10px] font-bold leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>Your live progression log</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dashboardStats.recentActivities && dashboardStats.recentActivities.length > 0 ? (
                        dashboardStats.recentActivities.slice(0, 4).map((act: any, idx: number) => {
                          const companyColor = companies.find(c => c.id === act.company)?.color || 'from-neutral-800 to-neutral-600';
                          const isToday = act.relativeTime === 'Today';
                          return (
                            <div key={act.id || idx} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-gradient-to-r ${companyColor} text-white shrink-0`}>
                                  {act.company.substring(0, 3).toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-black truncate" style={{ color: 'var(--text-primary)' }}>
                                    {act.company.charAt(0).toUpperCase() + act.company.slice(1)} {act.role.charAt(0).toUpperCase() + act.role.slice(1)}
                                  </p>
                                  <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Score: {act.score || 0}/100</p>
                                </div>
                              </div>
                              <span className={`text-[9px] font-black uppercase shrink-0 px-1.5 py-0.5 rounded ${isToday ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' : 'text-neutral-500'}`}>
                                {act.relativeTime}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                          <Award size={20} className="text-purple-500/40" />
                          <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>No recent sessions yet</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Start a mock interview below</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Assessment Card */}
                  <div className="p-4 rounded-2xl border flex flex-col gap-3" style={{ backgroundColor: 'rgba(147,51,234,0.04)', borderColor: 'rgba(147,51,234,0.15)' }}>
                    <div>
                      <h3 className="font-bold text-xs flex items-center gap-1.5 text-purple-400">
                        <Sparkles size={13} /> Quick Assessment
                      </h3>
                      <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>Configure and instantly launch a mock interview session.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <select
                        value={currentRole || ''}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        className="w-full t-bg-input border t-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/30 t-text cursor-pointer"
                      >
                        <option value="" disabled className="t-bg-card t-text">Select target role...</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id} className="t-bg-card t-text">{r.title}</option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={currentCompany || ''}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                          className="w-full t-bg-input border t-border rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/30 t-text cursor-pointer"
                        >
                          <option value="" className="t-bg-card t-text">Any Company</option>
                          {companies.map(c => (
                            <option key={c.id} value={c.id} className="t-bg-card t-text">{c.title}</option>
                          ))}
                        </select>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="w-full t-bg-input border t-border rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/30 t-text cursor-pointer"
                        >
                          <option value="Entry" className="t-bg-card t-text">Fresher</option>
                          <option value="Intermediate" className="t-bg-card t-text">Intermediate</option>
                          <option value="Hard" className="t-bg-card t-text">Senior</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!currentRole) { alert('Please select a target role first!'); return; }
                        startMockInterview();
                      }}
                      className="w-full py-2.5 bg-purple-600 text-white font-bold text-sm rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30 cursor-pointer"
                    >
                      Launch AI Session <ArrowRight size={12} />
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* FULL ATTEMPTS HISTORY MODAL OVERLAY */}
            {showAllAttemptsModal && (
              <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-neutral-950 border border-white/10 rounded-[32px] max-w-xl w-full p-6 flex flex-col max-h-[75vh] overflow-hidden shadow-2xl relative animate-in zoom-in duration-200">
                  
                  <button 
                    onClick={() => setShowAllAttemptsModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/5"
                  >
                    <X size={16} />
                  </button>

                  <div className="pb-3 border-b border-white/5 shrink-0">
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <History size={16} className="text-purple-500" /> Complete Attempts History
                    </h3>
                    <p className="text-xs t-text-sec mt-0.5">Total of {completedInterviews.length} assessment sessions completed</p>
                  </div>

                  <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar space-y-2.5 pr-1 min-h-0 text-xs">
                    {isLoadingHistory ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-400">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="font-bold text-sm uppercase tracking-widest text-neutral-500">Loading completed attempts...</p>
                      </div>
                    ) : historyError ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-red-400 gap-2">
                        <AlertTriangle size={24} className="text-red-500" />
                        <p className="font-black text-xs uppercase tracking-wider">Error Retrieving History</p>
                        <p className="text-sm text-neutral-500 max-w-xs">{historyError}</p>
                      </div>
                    ) : completedInterviews.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-450">
                        <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mb-4">
                          <History size={20} className="text-neutral-500" />
                        </div>
                        <p className="font-extrabold text-[12px] max-w-sm px-6 text-neutral-400 leading-normal">
                          No completed interviews yet. Complete a mock interview to see your history.
                        </p>
                      </div>
                    ) : (
                      completedInterviews.map((chat, idx) => {
                        const companyInfo = companies.find(c => c.id === chat.company.toLowerCase()) || { title: chat.company, color: 'from-neutral-800 to-neutral-600' };
                        const roleInfo = roles.find(r => r.id === chat.role.toLowerCase() || r.title.toLowerCase() === chat.role.toLowerCase()) || { title: chat.role, color: 'from-neutral-800 to-neutral-600' };
                        
                        return (
                          <div key={chat.id || idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group hover:border-white/15 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${companyInfo.color} flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0`}>
                                {companyInfo.title.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[12px] truncate text-white leading-normal">{roleInfo.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-neutral-450 font-bold uppercase tracking-wider">{companyInfo.title}</p>
                                  <span className="text-xs text-neutral-700">•</span>
                                  <span className="text-xs text-neutral-500 font-medium">
                                    {new Date(chat.createdAt || chat.timestamp || chat.date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black mr-2">
                                Score: {chat.score}/100
                              </span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setShowAllAttemptsModal(false);
                                    router.push(`/result?id=${chat.id}`);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-black uppercase tracking-widest hover:bg-purple-500 transition-all cursor-pointer"
                                >
                                  View Report
                                </button>
                                <button 
                                  onClick={() => handleDeleteInterviews([chat.id], false)}
                                  className="p-1.5 rounded-lg border border-red-500/20 text-red-550 hover:bg-red-550/15 hover:border-red-500/40 text-red-400 transition-all cursor-pointer"
                                  title="Delete Attempt"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-4 shrink-0 flex justify-end">
                    <button 
                      onClick={() => setShowAllAttemptsModal(false)}
                      className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 font-bold rounded-lg transition-all text-sm border border-white/5 cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        ) : (
          /* 2.5 CHAT VIEW (MOCK ONLY) */
          <>
            <header className="p-6 lg:px-12 backdrop-blur-md flex items-center justify-between sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-4">
                <button onClick={startNewChat} className="w-10 h-10 rounded-xl t-bg-surface t-text flex items-center justify-center hover:bg-purple-500/5 transition-colors mr-2 border t-border-strong shadow-sm"><Plus size={18} className="rotate-45" /></button>
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center"><Award size={18} /></div>
                <div>
                  <h1 className="text-lg font-bold">
                    {roles.find(r => r.id === currentRole)?.title}
                    {currentCompany && <span className="text-purple-500 ml-2">@ {companies.find(c => c.id === currentCompany)?.title}</span>}
                  </h1>
                  <p className="text-sm text-purple-400 font-black uppercase tracking-widest">{difficulty} Level Mock Interview</p>
                </div>
              </div>
              {isMockMode && (
                <div className="flex items-center gap-6"><div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${(mockStep / 5) * 100}%` }} /></div><div className="px-4 py-2 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-500 text-sm font-black uppercase">Question {mockStep}/5</div></div>
              )}
            </header>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 space-y-6 sm:space-y-8 scroll-smooth custom-scrollbar">
              {mockState === 'finished' && mockReport ? (
                /* MOCK REPORT VIEW */
                <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in duration-700 pb-20">
                  <div className="text-center space-y-4 relative">
                    <button 
                      onClick={handleExitReport}
                      className="absolute right-0 top-0 px-3.5 py-1.5 t-bg-card border t-border-strong hover:bg-red-600 hover:text-white transition-all rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <LogOut size={12} /> Exit Report
                    </button>
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-black uppercase tracking-widest">
                      <Award size={14} /> Interview Completed Successfully
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Final <span className="text-purple-500">Performance</span> Report</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 p-5 sm:p-10 rounded-[32px] sm:rounded-[48px] t-bg-card border t-border-strong shadow-2xl space-y-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                          <p className="text-sm t-text-muted font-black uppercase tracking-widest mb-2">Total Score</p>
                          <p className="text-6xl font-black text-purple-500">{mockReport.match(/Total Score: ([\d/]+)/)?.[1] || '39/50'}</p>
                        </div>
                        <div>
                          <p className="text-sm t-text-muted font-black uppercase tracking-widest mb-2">Overall Percentage</p>
                          <p className="text-6xl font-black text-blue-500">{mockReport.match(/Overall Percentage: (\d+)/)?.[1] || '78'}%</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                          <BarChart size={16} className="text-purple-500" /> Skill Analysis
                        </h4>
                        <div className="space-y-4">
                          {(mockReport.match(/Skill Analysis([\s\S]+?)Strengths/) || [null, "JavaScript: 9/10\nReact Basics: 8/10\nAPI Handling: 7/10\nPerformance: 7/10\nCommunication: 8/10"])[1]
                            .split('\n')
                            .filter(l => l.includes(':'))
                            .map((line, i) => {
                              const [skill, val] = line.split(':');
                              const score = parseInt(val.split('/')[0]);
                              return (
                                <div key={i} className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span>{skill.trim()}</span>
                                    <span>{val.trim()}</span>
                                  </div>
                                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${(score/10)*100}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] bg-green-500/5 border border-green-500/20 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-green-500">Strengths</h4>
                        <div className="space-y-2">
                          {(mockReport.match(/Strengths([\s\S]+?)Areas to Improve/) || [null, "✔ Strong JavaScript\n✔ Good React fundamentals\n✔ Clear explanations"])[1]
                            .split('\n')
                            .filter(l => l.trim().startsWith('✔'))
                            .map((s, i) => <p key={i} className="text-xs font-bold flex items-start gap-2"><span className="text-green-500">✔</span> {s.replace('✔', '').trim()}</p>)}
                        </div>
                      </div>

                      <div className="p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] bg-red-500/5 border border-red-500/20 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-red-500">Areas to Improve</h4>
                        <div className="space-y-2">
                          {(mockReport.match(/Areas to Improve([\s\S]+?)AI Result/) || [null, "⚠ React reconciliation\n⚠ API error handling\n⚠ Advanced performance"])[1]
                            .split('\n')
                            .filter(l => l.trim().startsWith('⚠'))
                            .map((s, i) => <p key={i} className="text-xs font-bold flex items-start gap-2 text-neutral-500"><span className="text-red-500">⚠</span> {s.replace('⚠', '').trim()}</p>)}
                        </div>
                      </div>

                      <div className="p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] t-bg-card border t-border-strong space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest">AI Readiness</h4>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-black text-white text-lg">
                            {mockReport.match(/Interview Readiness: (\d+)/)?.[1] || '78'}%
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase text-purple-500">Ready for Interview</p>
                            <p className="text-xs font-bold">{mockReport.match(/Status: (.+)/)?.[1] || 'Good Performance'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exit button at the bottom */}
                  <div className="flex justify-center pt-6">
                    <button 
                      onClick={handleExitReport}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-900/20"
                    >
                      <LogOut size={14} /> Exit & Return to Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const content = msg.message || msg.content || '';
                  const isEval = content.includes('✅ Evaluation');
                  const isFinal = content.includes('Final Performance Report');
                  const separator = '━━━━━━━━━━━━━━━━━━━';
                  
                  if (isFinal && mockState !== 'finished') {
                    setMockState('finished');
                    setMockReport(content);
                  }

                  // If it's a combined Eval + Question message
                  if (msg.sender === 'bot' && isEval && content.includes(separator)) {
                    const parts = content.split(separator);
                    const evalPart = parts[0].trim();
                    const questionPart = (separator + parts[1] + separator + parts[2]).trim();

                    return (
                      <React.Fragment key={i}>
                        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="max-w-[80%] p-6 rounded-[24px] bg-green-500/5 border border-green-500/20 mr-12" style={{ color: 'var(--text-primary)' }}>
                            <div className="flex items-center gap-2 mb-4 text-green-500 font-black text-sm uppercase tracking-widest bg-green-500/10 w-fit px-3 py-1 rounded-full"><Check size={12} /> Evaluation System</div>
                            <p className="leading-relaxed whitespace-pre-wrap">{evalPart}</p>
                            <p className="text-xs mt-4 opacity-40 font-bold uppercase tracking-widest">AI Interviewer • Feedback</p>
                          </div>
                        </div>
                        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-500 mt-4">
                          <div className="max-w-[80%] p-6 rounded-[24px] t-bg-card border t-border mr-12" style={{ color: 'var(--text-primary)' }}>
                            <p className="leading-relaxed whitespace-pre-wrap">{questionPart}</p>
                            <p className="text-xs mt-4 opacity-40 font-bold uppercase tracking-widest">AI Interviewer • Next Challenge</p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[80%] p-6 rounded-[24px] ${msg.sender === 'user' ? 'bg-purple-600 text-white ml-12' : isEval ? 'mr-12 bg-green-500/5 border-green-500/20' : 'mr-12 t-bg-card'}`} style={msg.sender !== 'user' ? { border: isEval ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid var(--border)', color: 'var(--text-primary)' } : {}}>
                        {isEval && <div className="flex items-center gap-2 mb-4 text-green-500 font-black text-sm uppercase tracking-widest bg-green-500/10 w-fit px-3 py-1 rounded-full"><Check size={12} /> Evaluation System</div>}
                        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
                        <p className="text-xs mt-4 opacity-40 font-bold uppercase tracking-widest">{msg.sender === 'user' ? 'You' : 'AI Interviewer'}</p>
                      </div>
                    </div>
                  );
                })
              )}

              {/* LOADING STATE FOR MOCK MODE */}
              {isLoading && isMockMode && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="max-w-[80%] p-6 rounded-[24px] t-bg-card border t-border-strong opacity-70 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <p className="text-xs font-black uppercase tracking-widest text-purple-500">
                      {mockState === 'evaluating' ? 'Analyzing Final Report...' : 'Generating Interview...'}
                    </p>
                  </div>
                </div>
              )}

              {isOfflineMode && mockState !== 'finished' && (
                <div className="mx-auto max-w-lg mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-black uppercase tracking-widest text-center">
                  ⚠️ [Offline Mode] AI Quota Exceeded — Using Local Technical Bank
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            <footer className="p-4 sm:p-6 lg:p-8" style={{ background: `linear-gradient(to top, var(--bg-base) 60%, transparent)` }}>
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  disabled={isLoading}
                  placeholder={isLoading ? "Please wait..." : "Type your answer..."} 
                  className="w-full rounded-[24px] py-4 sm:py-6 pl-4 sm:pl-8 pr-16 sm:pr-20 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all shadow-2xl disabled:opacity-50 text-sm" 
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} 
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 disabled:opacity-50 transition-all">
                  {isLoading ? <Sparkles className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                </button>
              </form>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
