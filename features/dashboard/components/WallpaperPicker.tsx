"use client";

import { useRef, useState, useTransition } from "react";
import { removeWallpaperAction, uploadWallpaperAction } from "../actions";
import type { ToastType } from "../utils/useToast";

interface WallpaperPickerProps {
  initialWallpaperUrl: string | null;
  onWallpaperChange: (wallpaperUrl: string | null) => void;
  onToast: (message: string, type: ToastType) => void;
}

export default function WallpaperPicker({
  initialWallpaperUrl,
  onWallpaperChange,
  onToast,
}: WallpaperPickerProps) {
  const [currentWallpaperUrl, setCurrentWallpaperUrl] = useState(initialWallpaperUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      onToast("Pilih file wallpaper terlebih dahulu", "error");
      return;
    }

    const formData = new FormData();
    formData.append("wallpaper", selectedFile);

    startTransition(async () => {
      try {
        const result = await uploadWallpaperAction(formData);
        setCurrentWallpaperUrl(result.wallpaperUrl);
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = "";
        onWallpaperChange(result.wallpaperUrl);
        onToast("Wallpaper dashboard berhasil diperbarui", "success");
      } catch (error) {
        onToast(
          error instanceof Error ? error.message : "Gagal mengunggah wallpaper",
          "error"
        );
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await removeWallpaperAction();
        setCurrentWallpaperUrl(null);
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = "";
        onWallpaperChange(null);
        onToast("Wallpaper dashboard berhasil dihapus", "success");
      } catch (error) {
        onToast(
          error instanceof Error ? error.message : "Gagal menghapus wallpaper",
          "error"
        );
      }
    });
  };

  return (
    <div className="wallpaper-picker">
      <label className="wallpaper-picker-trigger">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Pilih wallpaper dashboard"
          onChange={handleFileChange}
          disabled={isPending}
        />
        <span>Wallpaper</span>
      </label>

      <button
        type="button"
        className="wallpaper-action-btn"
        onClick={handleUpload}
        disabled={isPending || !selectedFile}
      >
        {isPending ? "Mengunggah..." : "Upload Wallpaper"}
      </button>

      {currentWallpaperUrl && (
        <button
          type="button"
          className="wallpaper-action-btn secondary"
          onClick={handleRemove}
          disabled={isPending}
        >
          Hapus Wallpaper
        </button>
      )}
    </div>
  );
}
