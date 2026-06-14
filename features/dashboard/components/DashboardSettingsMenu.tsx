"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastType } from "../utils/useToast";
import WallpaperPicker from "./WallpaperPicker";

const SETTINGS_ANIMATION_MS = 180;

interface DashboardSettingsMenuProps {
  initialWallpaperUrl: string | null;
  onWallpaperChange: (wallpaperUrl: string | null) => void;
  onToast: (message: string, type: ToastType) => void;
}

export default function DashboardSettingsMenu({
  initialWallpaperUrl,
  onWallpaperChange,
  onToast,
}: DashboardSettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setIsClosing(false);
    setIsOpen(true);
  }, [clearCloseTimer]);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    if (!isOpen) return;

    setIsOpen(false);
    setIsClosing(true);
    closeTimer.current = setTimeout(() => {
      setIsClosing(false);
      closeTimer.current = null;
    }, SETTINGS_ANIMATION_MS);
  }, [clearCloseTimer, isOpen]);

  const closeMenuImmediately = useCallback(() => {
    clearCloseTimer();
    setIsOpen(false);
    setIsClosing(false);
  }, [clearCloseTimer]);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }, [closeMenu, isOpen, openMenu]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  return (
    <div className="settings-menu-wrapper" ref={menuRef}>
      <button
        type="button"
        className="settings-fab-btn"
        aria-label="Buka pengaturan"
        aria-haspopup="menu"
        aria-expanded={isOpen || isClosing}
        onClick={toggleMenu}
      >
        <SettingsIcon />
      </button>

      {(isOpen || isClosing) && (
        <div
          className={`settings-dropdown ${isClosing ? "closing" : ""}`}
          role="menu"
          aria-label="Pengaturan dashboard"
        >
          <div className="settings-dropdown-header">Pengaturan</div>
          <section className="settings-section">
            <div className="settings-section-copy">
              <h2>Wallpaper Dashboard</h2>
              <p>Unggah gambar JPG, PNG, atau WEBP maksimal 5MB.</p>
            </div>
            <WallpaperPicker
              initialWallpaperUrl={initialWallpaperUrl}
              onWallpaperChange={onWallpaperChange}
              onToast={onToast}
              onComplete={closeMenuImmediately}
            />
          </section>
        </div>
      )}
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
