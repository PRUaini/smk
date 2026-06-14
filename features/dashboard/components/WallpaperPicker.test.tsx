import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { removeWallpaperAction, uploadWallpaperAction } from "../actions";
import WallpaperPicker from "./WallpaperPicker";

vi.mock("../actions", () => ({
  removeWallpaperAction: vi.fn(),
  uploadWallpaperAction: vi.fn(),
}));

describe("WallpaperPicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads selected wallpaper and reports success", async () => {
    const onToast = vi.fn();
    const onWallpaperChange = vi.fn();
    vi.mocked(uploadWallpaperAction).mockResolvedValue({
      wallpaperUrl: "https://example.com/new-wallpaper.png",
    });

    render(
      <WallpaperPicker
        initialWallpaperUrl={null}
        onToast={onToast}
        onWallpaperChange={onWallpaperChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Pilih wallpaper dashboard"), {
      target: {
        files: [new File(["image"], "wallpaper.png", { type: "image/png" })],
      },
    });
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
    });
  });

  it("removes existing wallpaper", async () => {
    const onToast = vi.fn();
    const onWallpaperChange = vi.fn();
    vi.mocked(removeWallpaperAction).mockResolvedValue({ wallpaperUrl: null });

    render(
      <WallpaperPicker
        initialWallpaperUrl="https://example.com/old-wallpaper.png"
        onToast={onToast}
        onWallpaperChange={onWallpaperChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Hapus Wallpaper" }));

    await waitFor(() => {
      expect(removeWallpaperAction).toHaveBeenCalled();
      expect(onWallpaperChange).toHaveBeenCalledWith(null);
      expect(onToast).toHaveBeenCalledWith(
        "Wallpaper dashboard berhasil dihapus",
        "success"
      );
    });
  });

  it("shows upload errors through toast", async () => {
    const onToast = vi.fn();
    vi.mocked(uploadWallpaperAction).mockRejectedValue(
      new Error("Ukuran wallpaper maksimal 5MB")
    );

    render(
      <WallpaperPicker
        initialWallpaperUrl={null}
        onToast={onToast}
        onWallpaperChange={vi.fn()}
      />
    );

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
    });
  });
});
