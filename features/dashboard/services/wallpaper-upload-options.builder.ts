import { randomUUID } from "node:crypto";
import type { UploadApiOptions } from "cloudinary";

export function buildWallpaperUploadOptions(): UploadApiOptions {
  return {
    folder: "smk/wallpapers",
    public_id: `wallpaper-${randomUUID()}`,
    resource_type: "image",
    overwrite: false,
    invalidate: true,
  };
}
