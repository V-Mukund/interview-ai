"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { getAuthValue, setAuthValue } from '../lib/auth-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const toggleRegister = () => {
    setIsRegister(!isRegister);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const hashPassword = async (pwd: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleOfflineLogin = async () => {
    const normalizedEmail = email.toLowerCase().trim();
    const offlineUsers = await getAuthValue('offline_users') || {};
    const storedUser = offlineUsers[normalizedEmail];

    if (storedUser) {
      const computedHash = await hashPassword(password);
      if (computedHash === storedUser.passwordHash) {
        await setAuthValue('token', storedUser.token);
        await setAuthValue('user', { email: storedUser.email, username: storedUser.username });
        window.location.href = '/chatbot';
      } else {
        setError('Invalid email or password (Offline Mode).');
      }
    } else {
      setError('Offline login is not available on this device. You must log in online at least once first.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const isDeviceOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    if (isDeviceOffline) {
      if (isRegister) {
        setError('Internet connection is required to create a new account.');
        setIsLoading(false);
        return;
      } else {
        await handleOfflineLogin();
        setIsLoading(false);
        return;
      }
    }

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    try {
      const payload = isRegister ? { email, username, password } : { email, password };
      const baseUrl = (await import('../lib/config')).API_BASE_URL;
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          await setAuthValue('token', data.access_token);
          
          // Securely pre-cache profile for offline usage in IndexedDB
          try {
            const profileRes = await fetch(`${baseUrl}/auth/profile`, {
              headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              const normalizedEmail = email.toLowerCase().trim();
              const computedHash = await hashPassword(password);
              
              const offlineUsers = await getAuthValue('offline_users') || {};
              offlineUsers[normalizedEmail] = {
                email: normalizedEmail,
                username: profileData.username,
                passwordHash: computedHash,
                token: data.access_token
              };
              await setAuthValue('offline_users', offlineUsers);
              await setAuthValue('user', { email: normalizedEmail, username: profileData.username });
            }
          } catch (profileErr) {
            console.error('Failed to pre-cache offline credentials profile:', profileErr);
          }

          window.location.href = '/chatbot';
        } else {
          setError('Authentication succeeded but no token was received.');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        setError(
          Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message || 'Authentication failed'
        );
      }
    } catch (err) {
      if (!isRegister) {
        await handleOfflineLogin();
      } else {
        setError('Connection failed. Make sure the backend is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center p-6 font-sans relative"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/8 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[400px] z-10 animate-in fade-in zoom-in-95 duration-500">
        <div
          className="p-10 rounded-[32px] backdrop-blur-2xl shadow-2xl"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-key)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Lock className="text-white" size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-[4px] text-purple-500 mb-2">FORGE Interview AI</p>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isRegister ? 'Join our AI-powered interview platform' : 'Log in to continue to Forge'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium ml-1" style={{ color: 'var(--text-secondary)' }}>Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    placeholder="Your unique username"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium ml-1" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-sm"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 pb-2">
              <label className="text-[13px] font-medium ml-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-sm"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Get Started' : 'Sign In'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {isRegister ? 'Already part of the team?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={toggleRegister}
              className="font-bold hover:underline underline-offset-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>

        <p className="text-center text-[11px] mt-10 uppercase tracking-[3px] font-bold" style={{ color: 'var(--text-label)' }}>
          Protected by <span style={{ color: 'var(--text-primary)' }}>FORGE</span> Secure
        </p>
      </div>
    </main>
  );
}
