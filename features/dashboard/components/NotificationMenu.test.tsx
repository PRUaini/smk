import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationItem } from "../services/notifications.service";
import NotificationMenu from "./NotificationMenu";

const notifications: NotificationItem[] = [
  {
    id: "notification-1",
    activityId: "activity-1",
    title: "Pendekatan",
    description: "Budi - 25 Mei 2026, 08:00",
    kind: "today",
    statusLabel: "Hari ini",
    scheduledAt: new Date(2026, 4, 25, 8, 0, 0).getTime(),
  },
];

describe("NotificationMenu", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens the menu, shows the primary badge, and selects a notification", () => {
    const onSelectNotification = vi.fn();

    render(
      <NotificationMenu
        notifications={notifications}
        onSelectNotification={onSelectNotification}
        onMarkAllRead={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: "Buka notifikasi" });
    expect(button).toHaveClass("notification-fab-btn");
    expect(screen.getByText("1")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Tandai Semua" })).toBeInTheDocument();
    expect(screen.queryByText("1 item")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: /Pendekatan/ }));

    expect(onSelectNotification).toHaveBeenCalledWith("activity-1");
  });

  it("keeps the menu mounted while closing animation runs", () => {
    render(
      <NotificationMenu
        notifications={notifications}
        onSelectNotification={vi.fn()}
        onMarkAllRead={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: "Buka notifikasi" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.getByRole("menu", { name: "Notifikasi aktivitas" })).toHaveClass("closing");

    act(() => {
      vi.advanceTimersByTime(180);
    });

    expect(screen.queryByRole("menu", { name: "Notifikasi aktivitas" })).not.toBeInTheDocument();
  });

  it("marks all notifications as read from the menu header", () => {
    const onMarkAllRead = vi.fn();

    render(
      <NotificationMenu
        notifications={notifications}
        onSelectNotification={vi.fn()}
        onMarkAllRead={onMarkAllRead}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buka notifikasi" }));
    fireEvent.click(screen.getByRole("button", { name: "Tandai Semua" }));

    expect(screen.getByRole("menu", { name: "Notifikasi aktivitas" })).toHaveClass("marking-read");
    expect(onMarkAllRead).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(180);
    });

    expect(onMarkAllRead).toHaveBeenCalledOnce();
  });

  it("shows an empty state when there are no notifications", () => {
    render(
      <NotificationMenu
        notifications={[]}
        onSelectNotification={vi.fn()}
        onMarkAllRead={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buka notifikasi" }));

    expect(screen.getByText("Tidak ada notifikasi")).toBeInTheDocument();
  });
});
