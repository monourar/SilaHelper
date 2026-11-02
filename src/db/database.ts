import Dexie, { type EntityTable } from 'dexie';
import { Book, CoverImage, AppSettings } from '../types/book';

export class SilaDatabase extends Dexie {
  books!: EntityTable<Book, 'id'>;
  coverImages!: EntityTable<CoverImage, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('SilaDatabase');
    this.version(1).stores({
      books: 'id, title, author, publisher, hall, stand, priceDZD, status, createdAt, updatedAt',
      coverImages: 'id, bookId, createdAt',
      settings: 'id'
    });
  }
}

export const db = new SilaDatabase();

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'default',
  budgetDZD: 30000,
  hasSeenOnboarding: false,
  updatedAt: Date.now()
};

export const INITIAL_BOOKS: Book[] = [];

export async function initDatabase() {
  try {
    // Clean out demo seed data so app starts completely clean & fresh
    const demoIds = ['b1-atomic-habits', 'b2-algeria-history', 'b3-encyclopedia-phil', 'b4-arabic-lit', 'b5-ibn-khaldoun'];
    await db.books.bulkDelete(demoIds);

    const existingSettings = await db.settings.get('default');
    if (!existingSettings) {
      await db.settings.add(DEFAULT_SETTINGS);
    } else {
      // If user had no custom books, reset onboarding flag so they see the budget question fresh
      const totalBooks = await db.books.count();
      if (totalBooks === 0 && !localStorage.getItem('sila_budget_set')) {
        await db.settings.update('default', { hasSeenOnboarding: false });
      }
    }
  } catch (error) {
    console.error('Failed to initialize database defaults:', error);
  }
}
