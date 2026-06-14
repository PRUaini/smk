import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";

export interface UploadedWallpaperAsset {
  secureUrl: string;
  publicId: string;
}

let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  isConfigured = true;
}

export async function uploadWallpaperBuffer(
  buffer: Buffer,
  options: UploadApiOptions
): Promise<UploadedWallpaperAsset> {
  configureCloudinary();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, upload) => {
      if (error) {
        reject(error);
        return;
      }

      if (!upload?.secure_url || !upload.public_id) {
        reject(new Error("Cloudinary upload did not return asset metadata."));
        return;
      }

      resolve(upload);
    });

    Readable.from(buffer).pipe(stream);
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });
}
