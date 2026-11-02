import { z } from 'zod';
import { db, DEFAULT_SETTINGS } from '../db/database';
import { Book, AppSettings, BackupData } from '../types/book';
import { blobToBase64, base64ToBlob } from './image';

export const BookSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  author: z.string().optional(),
  publisher: z.string().min(1),
  hall: z.string().optional(),
  stand: z.string().min(1),
  priceDZD: z.number().nullable(),
  status: z.enum(['wanted', 'purchased', 'comparing']),
  notes: z.string().optional(),
  coverImageId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const BackupSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  app: z.string(),
  settings: z.object({
    id: z.string(),
    budgetDZD: z.number(),
    hasSeenOnboarding: z.boolean().optional(),
    defaultHall: z.string().optional(),
    updatedAt: z.number(),
  }).optional(),
  books: z.array(BookSchema),
  images: z.array(z.object({
    id: z.string(),
    bookId: z.string(),
    mimeType: z.string(),
    base64Data: z.string(),
  })).optional(),
});

/**
 * Export full backup as JSON
 */
export async function exportDatabaseToJSON(includePhotos = true): Promise<void> {
  const books = await db.books.toArray();
  const settings = (await db.settings.get('default')) || DEFAULT_SETTINGS;

  let images: BackupData['images'] = [];
  if (includePhotos) {
    const rawImages = await db.coverImages.toArray();
    for (const img of rawImages) {
      try {
        const base64 = await blobToBase64(img.blob);
        images.push({
          id: img.id,
          bookId: img.bookId,
          mimeType: img.mimeType,
          base64Data: base64,
        });
      } catch (err) {
        console.warn('Failed to convert image to base64 during export:', err);
      }
    }
  }

  const backupData: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'SILA Book Tracker',
    settings,
    books,
    images: includePhotos ? images : undefined,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json',
  });
  downloadFile(blob, `sila-books-backup-${new Date().toISOString().slice(0, 10)}.json`);
}

/**
 * Export books to CSV format (UTF-8 with BOM for Excel/Numbers Arabic support)
 */
export async function exportBooksToCSV(): Promise<void> {
  const books = await db.books.toArray();
  
  const headers = ['العنوان', 'المؤلف', 'دار النشر', 'القاعة', 'الجناح', 'السعر (دج)', 'الحالة', 'ملاحظات', 'تاريخ الإضافة'];
  
  const statusLabels: Record<string, string> = {
    wanted: 'أريد شراءه',
    purchased: 'تم شراؤه',
    comparing: 'للمقارنة',
  };

  const rows = books.map((b) => [
    `"${(b.title || '').replace(/"/g, '""')}"`,
    `"${(b.author || '').replace(/"/g, '""')}"`,
    `"${(b.publisher || '').replace(/"/g, '""')}"`,
    `"${(b.hall || '').replace(/"/g, '""')}"`,
    `"${(b.stand || '').replace(/"/g, '""')}"`,
    b.priceDZD !== null && b.priceDZD !== undefined ? b.priceDZD : '',
    `"${statusLabels[b.status] || b.status}"`,
    `"${(b.notes || '').replace(/"/g, '""')}"`,
    `"${new Date(b.createdAt).toLocaleDateString('ar-DZ')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `sila-books-${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Trigger browser file download
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Validate and restore JSON backup
 */
export async function importDatabaseFromJSON(
  jsonString: string,
  mode: 'merge' | 'replace' = 'merge'
): Promise<{ added: number; updated: number; imagesCount: number }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('ملف النسخ الاحتياطي غير صالح (ليس ملف JSON صحيح)');
  }

  const validation = BackupSchema.safeParse(parsed);
  if (!validation.success) {
    const errorMsg = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`بنية النسخة الاحتياطية غير مطابقة: ${errorMsg}`);
  }

  const data = validation.data;
  let added = 0;
  let updated = 0;
  let imagesCount = 0;

  await db.transaction('rw', db.books, db.coverImages, db.settings, async () => {
    if (mode === 'replace') {
      await db.books.clear();
      await db.coverImages.clear();
    }

    if (data.settings) {
      await db.settings.put(data.settings as AppSettings);
    }

    for (const book of data.books) {
      const existing = await db.books.get(book.id);
      if (existing) {
        if (mode === 'merge') {
          // If merging and already exists, update with latest
          await db.books.put(book as Book);
          updated++;
        }
      } else {
        await db.books.add(book as Book);
        added++;
      }
    }

    if (data.images && data.images.length > 0) {
      for (const img of data.images) {
        try {
          const blob = await base64ToBlob(img.base64Data, img.mimeType);
          await db.coverImages.put({
            id: img.id,
            bookId: img.bookId,
            blob,
            mimeType: img.mimeType,
            sizeBytes: blob.size,
            createdAt: Date.now(),
          });
          imagesCount++;
        } catch (imgErr) {
          console.warn('Failed restoring image:', imgErr);
        }
      }
    }
  });

  return { added, updated, imagesCount };
}
