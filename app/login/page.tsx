'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { DEMO_CREDENTIALS } from '@/app/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const success = await login({ email, password });
    if (success) {
      router.push('/');
    }
  };

  const handleDemoLogin = (credentials: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#060c18] via-slate-900 to-black">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl font-black text-white mb-2 mukta-extrabold">
            ⚡ ELECTION
          </div>
          <p className="text-blue-400 text-lg font-semibold mukta-semibold">Global TV Khabar 2026</p>
          <p className="text-slate-400 text-sm mt-2">Nepal Election Live Tracking System</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0a1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8">

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2 mukta-bold">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@electionglobal.com"
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-2 mukta-bold">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition"
              />
            </div>

            {/* Error Messages */}
            {(error || localError) && (
              <div className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
                <p className="text-red-400 text-sm font-semibold mukta-semibold">
                  {error || localError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center gap-2 mukta-bold"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Logging in...
                </>
              ) : (
                '🔐 Login'
              )}
            </button>
          </form>

          {/* Demo Credentials Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mukta-bold text-center">
              📝 Demo Credentials
            </p>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(cred)}
                  className="w-full p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-lg transition group text-left"
                >
                  <p className="text-sm font-bold text-white group-hover:text-blue-300 transition mukta-bold">
                    {cred.role === 'admin' ? '👨‍💼' : '👁️'} {cred.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{cred.email} / {cred.password}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-xs mukta-semibold">
            <span className="animate-pulse">🔴</span> Live Election Tracking System
          </p>
        </div>
      </div>
    </div>
  );
}
