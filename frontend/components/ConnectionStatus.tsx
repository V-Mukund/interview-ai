'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        setShowOnlineToast(true);
        // Automatically hide the green success toast after 4 seconds
        const timer = setTimeout(() => {
          setShowOnlineToast(false);
        }, 4000);
        return () => clearTimeout(timer);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setShowOnlineToast(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    // Simulate network checking
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (typeof window !== 'undefined') {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        setShowOnlineToast(true);
        setTimeout(() => setShowOnlineToast(false), 4000);
      }
    }
    setIsChecking(false);
  };

  // 1. RENDER GORGEOUS DESIGNED OFFLINE PAGE WHEN DISCONNECTED
  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#050505] flex items-center justify-center p-4 font-sans select-none overflow-hidden animate-in fade-in duration-500">
        {/* Background Glowing Blurs */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full text-center space-y-8 z-10 px-4">
          {/* Animated Offline Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full scale-125 animate-pulse" />
            <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-rose-900/20 relative border border-rose-400/20 animate-bounce duration-[3000ms]">
              <WifiOff size={44} className="animate-pulse" />
            </div>
            {/* Warning badge */}
            <div className="absolute -top-1 -right-1 bg-amber-500 text-neutral-900 w-7 h-7 rounded-full flex items-center justify-center border-4 border-[#050505] shadow-lg">
              <AlertTriangle size={12} className="font-bold" />
            </div>
          </div>

          {/* Designed Content */}
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Connection Lost
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mx-auto">
              It looks like you've been disconnected. Don't worry, you can still browse cached dashboard data or attempt to reconnect below.
            </p>
          </div>

          {/* Feature Availability Checklist */}
          <div className="p-6 rounded-[28px] bg-white/[0.02] border border-white/5 text-left space-y-4 max-w-sm mx-auto backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-wider text-rose-400">Offline Status Map</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">✓ Cached History & Overview</span>
                <span className="text-emerald-400 font-extrabold uppercase text-[10px]">Available</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">✓ Saved Prep Materials</span>
                <span className="text-emerald-400 font-extrabold uppercase text-[10px]">Available</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">✗ Real-Time AI Generation</span>
                <span className="text-rose-500 font-extrabold uppercase text-[10px]">Offline</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">✗ Active Assessment Grading</span>
                <span className="text-rose-500 font-extrabold uppercase text-[10px]">Offline</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <button
              onClick={handleCheckConnection}
              disabled={isChecking}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-sm tracking-wide transition-all shadow-lg shadow-rose-950/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Verifying Link...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Retry Connection
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.history.back();
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-neutral-400 hover:text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Go to Previous Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. RENDER GORGEOUS "BACK ONLINE" TOAST BUBBLE WHEN RECONNECTED
  if (showOnlineToast) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-950/20 border border-emerald-400/20 backdrop-blur-md">
          <div className="p-2 rounded-xl bg-white/10 shrink-0">
            <Wifi size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="font-extrabold text-sm tracking-wide">Back Online</p>
            <p className="text-xs text-white/80 mt-0.5">
              All live interactive AI resources have been successfully restored.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
