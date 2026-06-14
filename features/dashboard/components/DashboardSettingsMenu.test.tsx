import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { removeWallpaperAction, uploadWallpaperAction } from "../actions";
import DashboardSettingsMenu from "./DashboardSettingsMenu";

vi.mock("../actions", () => ({
  removeWallpaperAction: vi.fn(),
  uploadWallpaperAction: vi.fn(),
}));

describe("DashboardSettingsMenu", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens the settings menu and shows disabled wallpaper upload state", () => {
    render(
      <DashboardSettingsMenu
        initialWallpaperUrl={null}
        onToast={vi.fn()}
        onWallpaperChange={vi.fn()}
      />
    );

    expect(screen.queryByText("Wallpaper Dashboard")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Buka pengaturan" }));

    expect(screen.getByRole("menu", { name: "Pengaturan dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Wallpaper Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload Wallpaper" })).toBeDisabled();
  });

  it("uploads selected wallpaper, reports success, and closes the menu", async () => {
    vi.useRealTimers();
    const onToast = vi.fn();
    const onWallpaperChange = vi.fn();
    vi.mocked(uploadWallpaperAction).mockResolvedValue({
      wallpaperUrl: "https://example.com/new-wallpaper.png",
    });

    render(
      <DashboardSettingsMenu
        initialWallpaperUrl={null}
        onToast={onToast}
        onWallpaperChange={onWallpaperChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buka pengaturan" }));
    fireEvent.change(screen.getByLabelText("Pilih wallpaper dashboard"), {
      target: {
        files: [new File(["image"], "wallpaper.png", { type: "image/png" })],
      },
    });

    expect(screen.getByText("wallpaper.png")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Upload Wallpaper" }));

    await waitFor(() => {
      expect(uploadWallpaperAction).toHaveBeenCalledWith(expect.any(FormData));
      expect(onWallpaperChange).toHaveBeenCalledWith(
        "https://example.com/new-wallpaper.png"
      );
      expect(onToast).toHaveBeenCalledWith(
        "Wallpaper dashboard berhasil diperbarui",
        "success"
      );
      expect(screen.queryByRole("menu", { name: "Pengaturan dashboard" })).not.toBeInTheDocument();
    });
  });

  it("keeps the menu open when upload fails", async () => {
    vi.useRealTimers();
    const onToast = vi.fn();
    vi.mocked(uploadWallpaperAction).mockRejectedValue(
      new Error("Ukuran wallpaper maksimal 5MB")
    );

    render(
      <DashboardSettingsMenu
        initialWallpaperUrl={null}
        onToast={onToast}
        onWallpaperChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buka pengaturan" }));
    fireEvent.change(screen.getByLabelText("Pilih wallpaper dashboard"), {
      target: {
        files: [new File(["image"], "wallpaper.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload Wallpaper" }));

    await waitFor(() => {
      expect(onToast).toHaveBeenCalledWith(
        "Ukuran wallpaper maksimal 5MB",
        "error"
      );
      expect(screen.getByRole("menu", { name: "Pengaturan dashboard" })).toBeInTheDocument();
    });
  });

  it("removes existing wallpaper and closes the menu", async () => {
    vi.useRealTimers();
    const onToast = vi.fn();
    const onWallpaperChange = vi.fn();
    vi.mocked(removeWallpaperAction).mockResolvedValue({ wallpaperUrl: null });

    render(
      <DashboardSettingsMenu
        initialWallpaperUrl="https://example.com/old-wallpaper.png"
        onToast={onToast}
        onWallpaperChange={onWallpaperChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buka pengaturan" }));
    fireEvent.click(screen.getByRole("button", { name: "Hapus Wallpaper" }));

    await waitFor(() => {
      expect(removeWallpaperAction).toHaveBeenCalled();
      expect(onWallpaperChange).toHaveBeenCalledWith(null);
      expect(onToast).toHaveBeenCalledWith(
        "Wallpaper dashboard berhasil dihapus",
        "success"
      );
      expect(screen.queryByRole("menu", { name: "Pengaturan dashboard" })).not.toBeInTheDocument();
    });
  });

  it("closes on outside click", () => {
    render(
      <DashboardSettingsMenu
        initialWallpaperUrl={null}
        onToast={vi.fn()}
        onWallpaperChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buka pengaturan" }));
    fireEvent.pointerDown(document.body);

    expect(screen.getByRole("menu", { name: "Pengaturan dashboard" })).toHaveClass("closing");

    act(() => {
      vi.advanceTimersByTime(180);
    });

    expect(screen.queryByRole("menu", { name: "Pengaturan dashboard" })).not.toBeInTheDocument();
  });
});
