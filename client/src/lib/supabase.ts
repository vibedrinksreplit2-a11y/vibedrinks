const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

export const STORAGE_BUCKET = 'images';

function getUserId(): string | null {
  const saved = localStorage.getItem('vibe-drinks-user');
  if (saved) {
    try {
      const user = JSON.parse(saved);
      return user.id;
    } catch {
      return null;
    }
  }
  return null;
}

export function getStorageUrl(path: string): string {
  if (!path) return '';
  
  // If it's already a complete URL (starts with http), return as-is
  // BUT only if it doesn't contain the supabase storage parts we want to force
  if (path.startsWith('http') && !path.includes('/storage/v1/object/public/')) return path;
  
  // If it's a complete URL with supabase parts, extract the relative path and rebuild
  if (path.startsWith('http') && path.includes('/storage/v1/object/public/')) {
    const parts = path.split('/storage/v1/object/public/' + STORAGE_BUCKET + '/');
    if (parts[1]) {
      return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${parts[1]}`;
    }
  }

  // If it contains /storage/v1/ but maybe wrong domain
  if (path.includes('/storage/v1/')) {
    const parts = path.split('/storage/v1/');
    if (parts[1]) {
      const subPath = parts[1].replace('object/public/', '');
      const finalPath = subPath.startsWith(STORAGE_BUCKET + '/') ? subPath.substring(STORAGE_BUCKET.length + 1) : subPath;
      return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${finalPath}`;
    }
  }
  
  // Treat as relative path
  let cleanPath = path;
  if (path.startsWith(STORAGE_BUCKET + '/')) {
    cleanPath = path.substring(STORAGE_BUCKET.length + 1);
  }
  
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${cleanPath}`;
}

// Ensure all image URLs are complete before displaying
export function ensureImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  // If it's already a full URL, trust getStorageUrl to handle it
  // (it already checks for http and keeps it if it's not a broken Supabase URL)
  return getStorageUrl(imageUrl);
}

export async function uploadImage(
  file: File,
  folder: string = 'products'
): Promise<{ path: string; publicUrl: string }> {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    headers: {
      'x-user-id': userId,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  const result = await response.json();
  return {
    path: result.path,
    publicUrl: result.publicUrl
  };
}

export async function deleteImage(path: string): Promise<void> {
  if (!path || path.startsWith('http')) {
    return;
  }
  
  const userId = getUserId();
  if (!userId) {
    return;
  }

  try {
    const response = await fetch('/api/storage/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      const error = await response.json();
    }
  } catch (error) {
  }
}
