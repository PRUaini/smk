import { createClient } from "@/lib/supabase/server";

export interface UserWallpaper {
  userId: string;
  wallpaperUrl: string;
  cloudinaryPublicId: string;
  updatedAt: string;
}

interface UserWallpaperRow {
  user_id: string;
  wallpaper_url: string;
  cloudinary_public_id: string;
  updated_at: string;
}

interface SaveUserWallpaperData {
  wallpaperUrl: string;
  cloudinaryPublicId: string;
}

const WALLPAPER_SELECT =
  "user_id, wallpaper_url, cloudinary_public_id, updated_at";

function mapWallpaper(row: UserWallpaperRow): UserWallpaper {
  return {
    userId: row.user_id,
    wallpaperUrl: row.wallpaper_url,
    cloudinaryPublicId: row.cloudinary_public_id,
    updatedAt: row.updated_at,
  };
}

export async function getUserWallpaper(
  userId: string
): Promise<UserWallpaper | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_wallpapers")
    .select(WALLPAPER_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch wallpaper:", error);
    throw new Error("Failed to fetch wallpaper. Please try again later.");
  }

  return data ? mapWallpaper(data as UserWallpaperRow) : null;
}

export async function upsertUserWallpaper(
  userId: string,
  wallpaper: SaveUserWallpaperData
): Promise<UserWallpaper> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_wallpapers")
    .upsert(
      {
        user_id: userId,
        wallpaper_url: wallpaper.wallpaperUrl,
        cloudinary_public_id: wallpaper.cloudinaryPublicId,
      },
      { onConflict: "user_id" }
    )
    .select(WALLPAPER_SELECT)
    .single();

  if (error || !data) {
    console.error("Failed to save wallpaper:", error);
    throw new Error("Failed to save wallpaper. Please try again later.");
  }

  return mapWallpaper(data as UserWallpaperRow);
}

export async function deleteUserWallpaper(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_wallpapers")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete wallpaper:", error);
    throw new Error("Failed to delete wallpaper. Please try again later.");
  }
}
