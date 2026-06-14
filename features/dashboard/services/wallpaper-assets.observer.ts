import { deleteCloudinaryAsset } from "@/lib/cloudinary/server";

export async function notifyWallpaperAssetRemoved(
  publicId: string | null | undefined
): Promise<void> {
  if (!publicId) return;

  try {
    await deleteCloudinaryAsset(publicId);
  } catch (error) {
    console.error("Failed to delete Cloudinary wallpaper asset:", error);
  }
}
