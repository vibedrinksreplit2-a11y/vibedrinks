export interface SerperImageResult {
  imageUrl: string;
  title: string;
  source: string;
}

export async function searchProductImages(
  productName: string
): Promise<SerperImageResult[]> {
  try {
    const response = await fetch('/api/search/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: productName }),
    });

    if (!response.ok) {
      throw new Error('Failed to search images');
    }

    const data = await response.json();
    return data.images || [];
  } catch (error) {
    throw error;
  }
}

export async function fetchImageAsFile(imageUrl: string, filename: string): Promise<File> {
  try {
    const response = await fetch('/api/download-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to download image');
    }

    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    throw error;
  }
}
