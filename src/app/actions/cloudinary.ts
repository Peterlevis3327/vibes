"use server";

import { v2 as cloudinary } from 'cloudinary';
import { unstable_cache, revalidateTag } from 'next/cache';

// Note: Ensure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env.local
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function getCloudinarySignature() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  try {
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'portfolio' },
      process.env.CLOUDINARY_API_SECRET || ''
    );
    
    return {
      timestamp,
      signature,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    };
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    throw new Error("Failed to generate signature");
  }
}

const getCachedImages = unstable_cache(
  async () => {
    try {
      // Note: To use the Admin API to list resources, you need the API key and secret.
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      prefix: 'portfolio/', // folder
      max_results: 50,
      context: true, // gets context (alt text)
    });
    
    return result.resources.map((res: any) => ({
      url: res.secure_url,
      publicId: res.public_id,
      alt: res.context?.custom?.alt || '',
      width: res.width,
      height: res.height,
    }));
  } catch (error) {
    console.error("Cloudinary resources error:", error);
      // Return empty array or throw based on preference. If not configured, just return empty to not break the UI.
      return [];
    }
  },
  ['cloudinary-images'],
  { tags: ['cloudinary-images'], revalidate: 300 }
);

export async function getCloudinaryImages() {
  return getCachedImages();
}

export async function invalidateCloudinaryCache() {
  // @ts-expect-error Next.js 15 cache typings expect 2 arguments in some versions
  revalidateTag('cloudinary-images');
}

export async function uploadUrlToCloudinary(imageUrl: string) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'portfolio',
    });
    // @ts-expect-error Next.js 15 cache typings expect 2 arguments in some versions
    revalidateTag('cloudinary-images');
    return { secure_url: result.secure_url };
  } catch (error: any) {
    console.error("Cloudinary url upload error:", error);
    throw new Error(error.message || "Failed to upload image URL");
  }
}
