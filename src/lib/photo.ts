import { useEffect, useState } from 'react';
import { supabase } from './supabase';

const BUCKET = 'passport-photos';
const WIDTH = 480;
const HEIGHT = 600; // passport proportions, 4:5
const pathFor = (userId: string) => `${userId}/photo.jpg`;

// Crop the centre of any photo to passport shape and shrink it to a small JPEG,
// so uploads are quick and never carry the original's location data.
export async function preparePhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo.');
  if (file.size > 25 * 1024 * 1024) throw new Error('That photo is too large (over 25 MB).');
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("That photo couldn't be opened. Try a JPEG or PNG.");
  });
  const scale = Math.max(WIDTH / bitmap.width, HEIGHT / bitmap.height);
  const w = WIDTH / scale;
  const h = HEIGHT / scale;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.getContext('2d')!.drawImage(bitmap, (bitmap.width - w) / 2, (bitmap.height - h) / 2, w, h, 0, 0, WIDTH, HEIGHT);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare the photo.'))), 'image/jpeg', 0.85),
  );
}

export async function uploadPhoto(userId: string, photo: Blob) {
  const { error } = await supabase!.storage.from(BUCKET).upload(pathFor(userId), photo, { upsert: true, contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
}

export async function removePhoto(userId: string) {
  const { error } = await supabase!.storage.from(BUCKET).remove([pathFor(userId)]);
  if (error) throw new Error(error.message);
}

// A short-lived private link to the traveller's own photo; refreshed whenever it changes.
export function usePassportPhoto(userId: string | undefined, updatedAt: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!supabase || !userId || !updatedAt) return setUrl(null);
    let cancelled = false;
    supabase.storage
      .from(BUCKET)
      .createSignedUrl(pathFor(userId), 60 * 60)
      .then(({ data }) => !cancelled && setUrl(data ? `${data.signedUrl}&v=${encodeURIComponent(updatedAt)}` : null));
    return () => {
      cancelled = true;
    };
  }, [userId, updatedAt]);
  return url;
}
