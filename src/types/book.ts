export type BookStatus = 'wanted' | 'purchased' | 'comparing';

export const HALL_OPTIONS = [
  'جناح فلسطين (Palestine)',
  'جناح الكونكورد (Concorde)',
  'جناح قورارة (Gourara)',
  'جناح القصبة (Casbah)',
] as const;

export interface Book {
  id: string;
  title: string;
  author?: string;
  publisher: string;
  hall?: string;
  stand: string;
  priceDZD: number | null;
  status: BookStatus;
  notes?: string;
  coverImageId?: string; // ID referencing the CoverImage table in Dexie
  createdAt: number;
  updatedAt: number;
}

export interface CoverImage {
  id: string;
  bookId: string;
  blob: Blob;
  thumbnailBlob?: Blob;
  mimeType: string;
  sizeBytes: number;
  createdAt: number;
}

export interface AppSettings {
  id: string; // usually 'default'
  budgetDZD: number;
  hasSeenOnboarding?: boolean;
  defaultHall?: string;
  updatedAt: number;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  app: string;
  settings: AppSettings;
  books: Book[];
  images?: {
    id: string;
    bookId: string;
    mimeType: string;
    base64Data: string;
  }[];
}
