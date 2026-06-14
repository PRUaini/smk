import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  removeWallpaperForUser,
  uploadWallpaperForUser,
} from "./wallpaper.service";

vi.mock("../data/wallpaper.repository", () => ({
  deleteUserWallpaper: vi.fn(),
  getUserWallpaper: vi.fn(),
  upsertUserWallpaper: vi.fn(),
}));

vi.mock("@/lib/cloudinary/server", () => ({
  deleteCloudinaryAsset: vi.fn(),
  uploadWallpaperBuffer: vi.fn(),
}));

const validFile = (overrides?: Partial<File>) => {
  const file = new File(["image-bytes"], "wallpaper.png", { type: "image/png" });
  Object.entries(overrides ?? {}).forEach(([key, value]) => {
    Object.defineProperty(file, key, { value });
  });
  return file;
};

describe("wallpaper service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates image mime type", async () => {
    await expect(
      uploadWallpaperForUser(
        "user-1",
        new File(["bad"], "wallpaper.txt", { type: "text/plain" })
      )
    ).rejects.toThrow("Wallpaper harus berupa gambar JPG, PNG, atau WEBP");
  });

  it("validates max image size", async () => {
    await expect(
      uploadWallpaperForUser("user-1", validFile({ size: 5 * 1024 * 1024 + 1 }))
    ).rejects.toThrow("Ukuran wallpaper maksimal 5MB");
  });

  it("uploads and saves wallpaper metadata", async () => {
    const { getUserWallpaper, upsertUserWallpaper } = await import(
      "../data/wallpaper.repository"
    );
    const { uploadWallpaperBuffer } = await import("@/lib/cloudinary/server");

    vi.mocked(getUserWallpaper).mockResolvedValue(null);
    vi.mocked(uploadWallpaperBuffer).mockResolvedValue({
      secureUrl: "https://res.cloudinary.com/demo/image/upload/wallpaper.png",
      publicId: "smk/wallpapers/wallpaper-1",
    });
    vi.mocked(upsertUserWallpaper).mockResolvedValue({
      userId: "user-1",
      wallpaperUrl: "https://res.cloudinary.com/demo/image/upload/wallpaper.png",
      cloudinaryPublicId: "smk/wallpapers/wallpaper-1",
      updatedAt: "2026-06-14T00:00:00.000Z",
    });

    const result = await uploadWallpaperForUser("user-1", validFile());

    expect(uploadWallpaperBuffer).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({ folder: "smk/wallpapers" })
    );
    expect(upsertUserWallpaper).toHaveBeenCalledWith("user-1", {
      wallpaperUrl: "https://res.cloudinary.com/demo/image/upload/wallpaper.png",
      cloudinaryPublicId: "smk/wallpapers/wallpaper-1",
    });
    expect(result.wallpaperUrl).toBe(
      "https://res.cloudinary.com/demo/image/upload/wallpaper.png"
    );
  });

  it("cleans up newly uploaded asset when persistence fails", async () => {
    const { getUserWallpaper, upsertUserWallpaper } = await import(
      "../data/wallpaper.repository"
    );
    const { deleteCloudinaryAsset, uploadWallpaperBuffer } = await import(
      "@/lib/cloudinary/server"
    );

    vi.mocked(getUserWallpaper).mockResolvedValue(null);
    vi.mocked(uploadWallpaperBuffer).mockResolvedValue({
      secureUrl: "https://res.cloudinary.com/demo/image/upload/wallpaper.png",
      publicId: "smk/wallpapers/new-wallpaper",
    });
    vi.mocked(upsertUserWallpaper).mockRejectedValue(new Error("DB failed"));

    await expect(uploadWallpaperForUser("user-1", validFile())).rejects.toThrow(
      "DB failed"
    );
    expect(deleteCloudinaryAsset).toHaveBeenCalledWith(
      "smk/wallpapers/new-wallpaper"
    );
  });

  it("deletes the previous asset after replacing wallpaper", async () => {
    const { getUserWallpaper, upsertUserWallpaper } = await import(
      "../data/wallpaper.repository"
    );
    const { deleteCloudinaryAsset, uploadWallpaperBuffer } = await import(
      "@/lib/cloudinary/server"
    );

    vi.mocked(getUserWallpaper).mockResolvedValue({
      userId: "user-1",
      wallpaperUrl: "https://old.example/wallpaper.png",
      cloudinaryPublicId: "smk/wallpapers/old-wallpaper",
      updatedAt: "2026-06-14T00:00:00.000Z",
    });
    vi.mocked(uploadWallpaperBuffer).mockResolvedValue({
      secureUrl: "https://new.example/wallpaper.png",
      publicId: "smk/wallpapers/new-wallpaper",
    });
    vi.mocked(upsertUserWallpaper).mockResolvedValue({
      userId: "user-1",
      wallpaperUrl: "https://new.example/wallpaper.png",
      cloudinaryPublicId: "smk/wallpapers/new-wallpaper",
      updatedAt: "2026-06-14T00:00:00.000Z",
    });

    await uploadWallpaperForUser("user-1", validFile());

    expect(deleteCloudinaryAsset).toHaveBeenCalledWith(
      "smk/wallpapers/old-wallpaper"
    );
  });

  it("removes wallpaper metadata and Cloudinary asset", async () => {
    const { deleteUserWallpaper, getUserWallpaper } = await import(
      "../data/wallpaper.repository"
    );
    const { deleteCloudinaryAsset } = await import("@/lib/cloudinary/server");

    vi.mocked(getUserWallpaper).mockResolvedValue({
      userId: "user-1",
      wallpaperUrl: "https://old.example/wallpaper.png",
      cloudinaryPublicId: "smk/wallpapers/old-wallpaper",
      updatedAt: "2026-06-14T00:00:00.000Z",
    });

    await removeWallpaperForUser("user-1");

    expect(deleteUserWallpaper).toHaveBeenCalledWith("user-1");
    expect(deleteCloudinaryAsset).toHaveBeenCalledWith(
      "smk/wallpapers/old-wallpaper"
    );
  });
});
