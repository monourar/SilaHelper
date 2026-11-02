import { useEffect, useState } from 'react';
import { db } from '../db/database';

export function useCoverImage(coverImageId?: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!coverImageId) {
      setImageUrl(null);
      return;
    }

    let isMounted = true;
    let createdUrl: string | null = null;

    setLoading(true);
    db.coverImages
      .get(coverImageId)
      .then((img) => {
        if (!isMounted) return;
        if (img?.blob) {
          createdUrl = URL.createObjectURL(img.blob);
          setImageUrl(createdUrl);
        } else {
          setImageUrl(null);
        }
      })
      .catch((err) => {
        console.warn('Could not load cover image:', err);
        if (isMounted) setImageUrl(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [coverImageId]);

  return { imageUrl, loading };
}
