'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    const success = await login({ email, password });
    if (success) router.push('/');
  };

  const displayError = error || localError;

  return (
    <div className="login-root">
      {/* Subtle background grid */}
      <div className="login-bg-grid" />

      <div className="login-wrapper">

        {/* Logo area */}
        <div className="login-logo-area">
          {/* TV / Broadcast icon from Flaticon (inline SVG) */}

          <p className="login-subtitle">Admin Control Panel</p>
        </div>

        {/* Card */}
        <div className="login-card">
          <h2 className="login-card-title">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="login-form">

            {/* Email field */}
            <div className={`login-field ${focused === 'email' ? 'focused' : ''}`}>
              <label htmlFor="email">Email</label>
              <div className="login-input-wrap">
                {/* Email icon (Flaticon style inline SVG) */}
                <svg className="login-field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                  <path d="M28 6H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1.54 2L16 14.77 5.54 8zM4 24V9.23l11.37 7.58a1 1 0 0 0 1.26 0L28 9.23V24z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div className={`login-field ${focused === 'password' ? 'focused' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                {/* Lock icon (Flaticon style inline SVG) */}
                <svg className="login-field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                  <path d="M24 14h-1v-3a7 7 0 0 0-14 0v3H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V16a2 2 0 0 0-2-2zm-9 7.72V24a1 1 0 0 0 2 0v-2.28A2 2 0 0 0 16 18a2 2 0 0 0-1 3.72zM20 14H12v-3a4 4 0 0 1 8 0z" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {/* Eye toggle icon */}
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <path d="m4.71 3.29-1.42 1.42 4.1 4.1A14.25 14.25 0 0 0 2 16c2.73 5.56 8.27 9 14 9a13.9 13.9 0 0 0 6.31-1.51l4 4 1.42-1.42zm8.45 8.45 5.1 5.1A3 3 0 0 1 13.16 11.74zM16 23c-4.68 0-9.3-2.86-11.72-7a12.26 12.26 0 0 1 4.89-5L11.34 13A5 5 0 0 0 21 16v-.34l3 3A11.8 11.8 0 0 1 16 23zm14-7a14 14 0 0 1-2.14 4l-1.42-1.43A11.84 11.84 0 0 0 27.72 16C25.3 11.86 20.68 9 16 9a12.11 12.11 0 0 0-3.2.44L11.1 7.75A14 14 0 0 1 16 7c5.73 0 11.27 3.44 14 9z" />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <path d="M16 7C10.27 7 4.73 10.44 2 16c2.73 5.56 8.27 9 14 9s11.27-3.44 14-9c-2.73-5.56-8.27-9-14-9zm0 15a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm0-10a4 4 0 1 0 4 4 4 4 0 0 0-4-4z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {displayError && (
              <div className="login-error">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                  <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm1 21h-2v-2h2zm0-4h-2V9h2z" />
                </svg>
                <span>{displayError}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="login-btn">
              {isLoading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path d="M26.71 16.29 20 9.59V14H6v4h14v4.41l6.71-6.12z" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}

      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b0f1a;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .login-wrapper {
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        /* ── Logo ── */
        .login-logo-area {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-icon-wrap {
          width: 64px;
          height: 64px;
          margin: 0 auto 14px;
          background: rgba(229,57,53,0.12);
          border: 1px solid rgba(229,57,53,0.25);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }

        .login-tv-icon {
          width: 40px;
          height: 40px;
        }

        .login-brand {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
          margin: 0 0 4px;
        }

        .login-subtitle {
          font-size: 12px;
          color: #64748b;
          letter-spacing: 0.3px;
          margin: 0;
        }

        /* ── Card ── */
        .login-card {
          width: 100%;
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 28px 28px 32px;
        }

        .login-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #94a3b8;
          margin: 0 0 22px;
          letter-spacing: 0.2px;
        }

        /* ── Form ── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .login-field label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-field-icon {
          position: absolute;
          left: 13px;
          width: 16px;
          height: 16px;
          fill: #475569;
          pointer-events: none;
          transition: fill 0.2s;
        }

        .login-field.focused .login-field-icon {
          fill: #e53935;
        }

        .login-input-wrap input {
          width: 100%;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 11px 42px 11px 40px;
          color: #f1f5f9;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }

        .login-input-wrap input::placeholder {
          color: #334155;
        }

        .login-input-wrap input:focus {
          border-color: #e53935;
          background: #0a0f1e;
        }

        .login-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }

        .login-eye-btn svg {
          width: 17px;
          height: 17px;
          fill: #475569;
          transition: fill 0.2s;
        }

        .login-eye-btn:hover svg {
          fill: #94a3b8;
        }

        /* ── Error ── */
        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 10px 12px;
        }

        .login-error svg {
          width: 16px;
          height: 16px;
          fill: #f87171;
          flex-shrink: 0;
        }

        .login-error span {
          font-size: 13px;
          color: #f87171;
          font-weight: 500;
        }

        /* ── Button ── */
        .login-btn {
          width: 100%;
          background: #e53935;
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          padding: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.1s;
          font-family: inherit;
          margin-top: 4px;
          letter-spacing: 0.2px;
        }

        .login-btn svg {
          width: 16px;
          height: 16px;
          fill: #fff;
        }

        .login-btn:hover:not(:disabled) {
          background: #c62828;
        }

        .login-btn:active:not(:disabled) {
          transform: scale(0.99);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Spinner */
        .login-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Footer ── */
        .login-footer {
          margin-top: 24px;
          font-size: 11px;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.3px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e53935;
          display: inline-block;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
