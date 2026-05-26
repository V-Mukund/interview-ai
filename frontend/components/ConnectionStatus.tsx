'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'online' | 'offline' | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Determine initial status only on client-side
    const handleOnline = () => {
      setStatus('online');
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setStatus('offline');
      setIsVisible(true);
      // For offline, we keep it visible or let it auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    };

    // Set initial state without showing a toast on first load if already online
    if (typeof window !== 'undefined') {
      if (!navigator.onLine) {
        setStatus('offline');
        setIsVisible(true);
      }
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isVisible || status === null) return null;

  const isOffline = status === 'offline';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-center justify-between p-4 rounded-2xl shadow-xl backdrop-blur-md border ${
          isOffline
            ? 'bg-rose-500/90 text-white border-rose-400/30'
            : 'bg-emerald-500/90 text-white border-emerald-400/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 shrink-0">
            {isOffline ? <WifiOff size={20} className="animate-pulse" /> : <Wifi size={20} />}
          </div>
          <div>
            <p className="font-extrabold text-sm tracking-wide">
              {isOffline ? 'Connection Lost' : 'Back Online'}
            </p>
            <p className="text-xs text-white/80 mt-0.5">
              {isOffline ? 'You are offline. Running in offline mode.' : 'Internet connection restored successfully.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-4 shrink-0"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
