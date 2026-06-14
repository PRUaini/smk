import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEq = vi.hoisted(() => vi.fn());
const mockSelect = vi.hoisted(() => vi.fn());
const mockSingle = vi.hoisted(() => vi.fn());
const mockMaybeSingle = vi.hoisted(() => vi.fn());
const mockUpsert = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());

const mockQuery = vi.hoisted(() => ({
  select: mockSelect,
  eq: mockEq,
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
  upsert: mockUpsert,
  delete: mockDelete,
}));

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => mockQuery),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import {
  deleteUserWallpaper,
  getUserWallpaper,
  upsertUserWallpaper,
} from "./wallpaper.repository";

describe("wallpaper repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue(mockQuery);
    mockEq.mockReturnValue(mockQuery);
    mockDelete.mockReturnValue(mockQuery);
    mockUpsert.mockReturnValue(mockQuery);
  });

  it("maps stored wallpaper rows to domain shape", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        user_id: "user-1",
        wallpaper_url: "https://example.com/wallpaper.png",
        cloudinary_public_id: "smk/wallpapers/wallpaper-1",
        updated_at: "2026-06-14T00:00:00.000Z",
      },
      error: null,
    });

    const result = await getUserWallpaper("user-1");

    expect(mockSupabase.from).toHaveBeenCalledWith("user_wallpapers");
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
    expect(result).toEqual({
      userId: "user-1",
      wallpaperUrl: "https://example.com/wallpaper.png",
      cloudinaryPublicId: "smk/wallpapers/wallpaper-1",
      updatedAt: "2026-06-14T00:00:00.000Z",
    });
  });

  it("upserts wallpaper metadata by user id", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        user_id: "user-1",
        wallpaper_url: "https://example.com/wallpaper.png",
        cloudinary_public_id: "smk/wallpapers/wallpaper-1",
        updated_at: "2026-06-14T00:00:00.000Z",
      },
      error: null,
    });

    await upsertUserWallpaper("user-1", {
      wallpaperUrl: "https://example.com/wallpaper.png",
      cloudinaryPublicId: "smk/wallpapers/wallpaper-1",
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        wallpaper_url: "https://example.com/wallpaper.png",
        cloudinary_public_id: "smk/wallpapers/wallpaper-1",
      },
      { onConflict: "user_id" }
    );
  });

  it("hides raw database errors", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "permission denied for table user_wallpapers" },
    });

    await expect(getUserWallpaper("user-1")).rejects.toThrow(
      "Failed to fetch wallpaper. Please try again later."
    );
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("deletes wallpaper by user id", async () => {
    mockEq.mockResolvedValueOnce({ error: null });

    await deleteUserWallpaper("user-1");

    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
  });
});
