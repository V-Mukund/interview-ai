'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-6 font-sans relative"
      style={{ backgroundColor: '#0a0a0f', color: '#e5e5e5' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)' }}
      />

      <div className="w-full max-w-[420px] z-10 text-center">
        <div
          className="p-10 rounded-[32px] backdrop-blur-2xl shadow-2xl"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <WifiOff className="text-white" size={28} />
          </div>

          <p className="text-xs font-black uppercase tracking-[4px] text-amber-500 mb-2">
            FORGE Interview AI
          </p>
          <h1 className="text-2xl font-bold tracking-tight mb-3" style={{ color: '#f5f5f5' }}>
            You&apos;re Offline
          </h1>
          <p className="text-sm mb-8" style={{ color: '#a3a3a3' }}>
            It looks like you&apos;ve lost your internet connection.
            Your cached data is still available, but some features require network access.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/chatbot'; }}
              className="w-full font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#d4d4d4',
              }}
            >
              <Home size={16} />
              Go to Dashboard (Cached)
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] mt-10 uppercase tracking-[3px] font-bold" style={{ color: '#525252' }}>
          Protected by <span style={{ color: '#e5e5e5' }}>FORGE</span> Secure
        </p>
      </div>
    </main>
  );
}
