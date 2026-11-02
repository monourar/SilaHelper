/**
 * Compress an image file to a sensible size for IndexedDB storage.
 * Mobile photos can be 5-15MB; we compress them to ~150-300KB JPEG/WebP.
 */
export async function compressImage(file: File | Blob, maxWidth = 900, maxHeight = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Calculate scaled dimensions while preserving aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file instanceof Blob ? file : new Blob([file]));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file instanceof Blob ? file : new Blob([file]));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
}

/**
 * Generate a lightweight thumbnail for smooth list rendering
 */
export async function generateThumbnail(file: File | Blob): Promise<Blob> {
  return compressImage(file, 200, 280, 0.7);
}

/**
 * Convert a Blob to Base64 string for JSON export
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // remove data:mime/type;base64, prefix if desired or keep it
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert a Base64 string back to a Blob for JSON import
 */
export async function base64ToBlob(base64Data: string, mimeType = 'image/jpeg'): Promise<Blob> {
  const parts = base64Data.split(';base64,');
  const contentType = parts.length > 1 ? parts[0].replace('data:', '') : mimeType;
  const raw = window.atob(parts.length > 1 ? parts[1] : parts[0]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}
