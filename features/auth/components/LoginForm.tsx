"use client";

import { useActionState } from "react";
import { login } from "../actions/login";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <div className="login-container">
      <div className="login-backdrop" />

      <div className="login-card">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="48"
                height="48"
                rx="12"
                fill="url(#logo-gradient)"
              />
              <path
                d="M14 34V14h6l4 12 4-12h6v20h-5V21l-3.5 10h-3L19 21v13h-5z"
                fill="white"
              />
              <defs>
                <linearGradient
                  id="logo-gradient"
                  x1="0"
                  y1="0"
                  x2="48"
                  y2="48"
                >
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="login-title">SMK Portal</h1>
          <p className="login-subtitle">
            Masuk dengan akun agent Anda
          </p>
        </div>

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
            <input
              id="kode_agent"
              name="kode_agent"
              type="text"
              required
              autoComplete="username"
              placeholder="Masukkan kode agent"
              className="form-input"
              disabled={isPending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Masukkan password"
              className="form-input"
              disabled={isPending}
            />
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

        {/* Footer */}
        <p className="login-footer">
          &copy; {new Date().getFullYear()} SMK Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}
