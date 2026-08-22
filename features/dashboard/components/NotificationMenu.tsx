"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { NotificationItem } from "../services/notifications.service";

const NOTIFICATION_ANIMATION_MS = 180;

interface NotificationMenuProps {
  notifications: NotificationItem[];
  onSelectNotification: (activityId: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationMenu({
  notifications,
  onSelectNotification,
  onMarkAllRead,
}: NotificationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markReadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const clearMarkReadTimer = useCallback(() => {
    if (markReadTimer.current) {
      clearTimeout(markReadTimer.current);
      markReadTimer.current = null;
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
    }, NOTIFICATION_ANIMATION_MS);
  }, [clearCloseTimer, isOpen]);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }, [closeMenu, isOpen, openMenu]);

  const handleMarkAllRead = useCallback(() => {
    if (notifications.length === 0 || isMarkingRead) return;

    clearMarkReadTimer();
    setIsMarkingRead(true);
    markReadTimer.current = setTimeout(() => {
      onMarkAllRead();
      setIsMarkingRead(false);
      markReadTimer.current = null;
    }, NOTIFICATION_ANIMATION_MS);
  }, [
    clearMarkReadTimer,
    isMarkingRead,
    notifications.length,
    onMarkAllRead,
  ]);

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
      clearMarkReadTimer();
    };
  }, [clearCloseTimer, clearMarkReadTimer]);

  return (
    <div className="notification-menu-wrapper" ref={menuRef}>
      <NotificationBellButton
        count={notifications.length}
        isOpen={isOpen || isClosing}
        isMarkingRead={isMarkingRead}
        onClick={toggleMenu}
      />

      {(isOpen || isClosing) && (
        <NotificationDropdown
          notifications={notifications}
          isClosing={isClosing}
          isMarkingRead={isMarkingRead}
          onMarkAllRead={handleMarkAllRead}
          onSelect={(activityId) => {
            onSelectNotification(activityId);
            closeMenu();
          }}
        />
      )}
    </div>
  );
}

function NotificationBellButton({
  count,
  isOpen,
  isMarkingRead,
  onClick,
}: {
  count: number;
  isOpen: boolean;
  isMarkingRead: boolean;
  onClick: () => void;
}) {
  const badgeLabel = count > 9 ? "9+" : String(count);

  return (
    <button
      type="button"
      className={`notification-fab-btn ${isMarkingRead ? "marking-read" : ""}`}
      aria-label={count > 0 ? `Buka notifikasi (${count} baru)` : "Buka notifikasi"}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={onClick}
    >
      <BellIcon />
      {count > 0 && <span className="notification-fab-badge">{badgeLabel}</span>}
    </button>
  );
}

function NotificationDropdown({
  notifications,
  isClosing,
  isMarkingRead,
  onMarkAllRead,
  onSelect,
}: {
  notifications: NotificationItem[];
  isClosing: boolean;
  isMarkingRead: boolean;
  onMarkAllRead: () => void;
  onSelect: (activityId: string) => void;
}) {
  return (
    <div
      className={`notification-dropdown ${isClosing ? "closing" : ""} ${isMarkingRead ? "marking-read" : ""}`}
      role="menu"
      aria-label="Notifikasi aktivitas"
    >
      <div className="notification-dropdown-header">
        <span>Notifikasi</span>
        <button
          type="button"
          className="notification-mark-all-btn"
          onClick={onMarkAllRead}
          disabled={notifications.length === 0 || isMarkingRead}
        >
          Tandai Semua
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="notification-empty-state">Tidak ada notifikasi</div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <NotificationMenuItem
              key={notification.id}
              notification={notification}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationMenuItem({
  notification,
  onSelect,
}: {
  notification: NotificationItem;
  onSelect: (activityId: string) => void;
}) {
  return (
    <button
      type="button"
      className={`notification-item notification-item-${notification.kind}`}
      role="menuitem"
      onClick={() => onSelect(notification.activityId)}
    >
      <span className="notification-item-status">{notification.statusLabel}</span>
      <span className="notification-item-title">{notification.title}</span>
      <span className="notification-item-description">
        {notification.description}
      </span>
    </button>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
