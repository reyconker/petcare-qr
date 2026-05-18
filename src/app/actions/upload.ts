'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';

/**
 * Uploads an image to Supabase Storage.
 * Falls back to the provided fallback URL if no file or on error.
 */
export async function uploadImage(file: File, fallbackUrl = '', bucket: 'petcare-public' | 'petcare-private' = 'petcare-public'): Promise<string> {
  if (!file || file.size === 0) return fallbackUrl;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const dogId = await getDogId();

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/${dogId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error('Upload error:', error.message);
      return fallbackUrl;
    }

    if (bucket === 'petcare-private') {
      return path; // Store the relative path for private buckets to generate signed URLs later
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error('Upload failed:', e);
    return fallbackUrl;
  }
}
