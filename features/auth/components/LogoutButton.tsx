"use client";

import React, { useTransition } from "react";
import { logout } from "@/features/auth/actions/logout";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <form onSubmit={handleLogout}>
      <button
        type="submit"
        className={`header-logout-btn ${className || ""}`}
        id="logout-btn"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span
              className="animate-spin"
              style={{
                width: "12px",
                height: "12px",
                border: "2px solid currentColor",
                borderTopColor: "transparent",
                borderRadius: "50%",
                display: "inline-block",
                marginRight: "6px",
              }}
            />
            <span>Sedang keluar...</span>
          </>
        ) : (
          <>
            <span>Keluar</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M12 4H9V14H12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 4L15 2V16L12 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 9H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6L11 9L8 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
