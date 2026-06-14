import type { UserWallpaper } from "../data/wallpaper.repository";
import {
  deleteUserWallpaper,
  getUserWallpaper,
  upsertUserWallpaper,
} from "../data/wallpaper.repository";
import { uploadWallpaperBuffer } from "@/lib/cloudinary/server";
import { notifyWallpaperAssetRemoved } from "./wallpaper-assets.observer";
import { buildWallpaperUploadOptions } from "./wallpaper-upload-options.builder";

const MAX_WALLPAPER_BYTES = 5 * 1024 * 1024;
const ACCEPTED_WALLPAPER_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function validateWallpaperFile(file: File) {
  if (!ACCEPTED_WALLPAPER_TYPES.has(file.type)) {
    throw new Error("Wallpaper harus berupa gambar JPG, PNG, atau WEBP");
  }

  if (file.size <= 0) {
    throw new Error("Wallpaper tidak boleh kosong");
  }

  if (file.size > MAX_WALLPAPER_BYTES) {
    throw new Error("Ukuran wallpaper maksimal 5MB");
  }
}

export async function uploadWallpaperForUser(
  userId: string,
  file: File
): Promise<UserWallpaper> {
  validateWallpaperFile(file);

  const currentWallpaper = await getUserWallpaper(userId);
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadWallpaperBuffer(
    buffer,
    buildWallpaperUploadOptions()
  );

  try {
    const saved = await upsertUserWallpaper(userId, {
      wallpaperUrl: uploaded.secureUrl,
      cloudinaryPublicId: uploaded.publicId,
    });

    if (currentWallpaper?.cloudinaryPublicId !== uploaded.publicId) {
      await notifyWallpaperAssetRemoved(currentWallpaper?.cloudinaryPublicId);
    }

    return saved;
  } catch (error) {
    await notifyWallpaperAssetRemoved(uploaded.publicId);
    throw error;
  }
}

export async function removeWallpaperForUser(userId: string): Promise<void> {
  const currentWallpaper = await getUserWallpaper(userId);

  await deleteUserWallpaper(userId);
  await notifyWallpaperAssetRemoved(currentWallpaper?.cloudinaryPublicId);
}
