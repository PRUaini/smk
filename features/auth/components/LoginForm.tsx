"use client";

import { useActionState, useState, useRef } from "react";
import { login } from "../actions/login";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const illustrationRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!illustrationRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    illustrationRef.current.style.setProperty("--tilt-x", `${y * -35}deg`);
    illustrationRef.current.style.setProperty("--tilt-y", `${x * 35}deg`);
    illustrationRef.current.style.setProperty("--scale", "1.08");
  };

  const handleMouseLeave = () => {
    if (!illustrationRef.current) return;
    illustrationRef.current.style.setProperty("--tilt-x", "0deg");
    illustrationRef.current.style.setProperty("--tilt-y", "0deg");
    illustrationRef.current.style.setProperty("--scale", "1");
  };

  return (
    <div className="login-container">
      <div className="login-backdrop" />

      <div className="login-card-split">
        {/* Left Banner */}
        <div 
          className="login-banner"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <h1 className="banner-title">Sistem Manajemen Kegiatan</h1>
          <p className="banner-subtitle">
            Kelola kegiatan harian, sasaran mingguan, dan capaian Anda dengan lebih terstruktur.
          </p>

          {/* Animated Glassmorphism Illustration */}
          <div 
            ref={illustrationRef}
            className="banner-illustration-glass"
          >
            {/* Floating Checklist Board */}
            <div className="glass-board floating-slow">
              <div className="glass-board-header" />
              <div className="glass-board-subtitle" />
              <div className="glass-board-items">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-item">
                    <div className="glass-checkbox" style={{ flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '10px', height: '10px' }}>
                        <path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="glass-line" style={{ width: i === 3 ? '60%' : '85%' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Calendar */}
            <div className="glass-calendar floating-fast">
              <div className="glass-calendar-header" />
              <div className="glass-calendar-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={`glass-dot ${i === 5 ? 'active' : ''}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="login-form-pane">
          {/* Error message */}
          {state?.error && (
            <div className="login-error" role="alert" id="login-error">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="login-error-icon"
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.75" fill="currentColor" />
              </svg>
              {state.error}
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="login-form">
            <div className="form-group">
              <label htmlFor="kode_agent" className="form-label">
                Kode Agent
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="kode_agent"
                  name="kode_agent"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Masukkan kode agent"
                  className="form-input form-input-padded"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  className="form-input form-input-padded"
                  disabled={isPending}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="login-button"
              id="login-submit"
            >
              {isPending ? (
                <span className="login-button-loading">
                  <svg
                    className="spinner"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="50"
                      strokeDashoffset="15"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Absolute Bottom Footer */}
      <p className="login-split-footer">
        &copy; {new Date().getFullYear()} PRUaini Group
      </p>
    </div>
  );
}
