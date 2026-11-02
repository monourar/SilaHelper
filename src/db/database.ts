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
  hasSeenOnboarding: true,
  updatedAt: Date.now()
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'b1-atomic-habits',
    title: 'العادات الذرية',
    author: 'جيمس كلير',
    publisher: 'دار عصير الكتب',
    hall: 'جناح فلسطين (Palestine)',
    stand: 'B12',
    priceDZD: 1800,
    status: 'wanted',
    notes: 'طبعة جديدة مترجمة مع كتيب التمارين العملية',
    createdAt: Date.now() - 3600 * 1000 * 3,
    updatedAt: Date.now() - 3600 * 1000 * 3
  },
  {
    id: 'b2-algeria-history',
    title: 'تاريخ الجزائر المعاصر',
    author: 'أحمد توفيق المدني',
    publisher: 'دار الأمة',
    hall: 'جناح الكونكورد (Concorde)',
    stand: 'A5',
    priceDZD: 2200,
    status: 'wanted',
    notes: 'مجلد فاخر في جزئين، تخفيض المعرض 15%',
    createdAt: Date.now() - 3600 * 1000 * 2,
    updatedAt: Date.now() - 3600 * 1000 * 2
  },
  {
    id: 'b3-encyclopedia-phil',
    title: 'موسوعة الفلسفة',
    author: 'موريس بلانشو',
    publisher: 'دار الفارابي',
    hall: 'جناح قورارة (Gourara)',
    stand: 'C3',
    priceDZD: 3000,
    status: 'purchased',
    notes: 'تم الشراء في اليوم الأول من المعرض',
    createdAt: Date.now() - 3600 * 1000 * 1,
    updatedAt: Date.now() - 3600 * 1000 * 1
  },
  {
    id: 'b4-arabic-lit',
    title: 'الأدب العربي الحديث',
    author: 'شوقي ضيف',
    publisher: 'دار المعارف',
    hall: 'جناح القصبة (Casbah)',
    stand: 'A8',
    priceDZD: 1500,
    status: 'wanted',
    notes: 'المجلد الثاني، دراسة مقارنة',
    createdAt: Date.now() - 3600 * 1000 * 4,
    updatedAt: Date.now() - 3600 * 1000 * 4
  },
  {
    id: 'b5-ibn-khaldoun',
    title: 'سيرة ابن خلدون',
    author: 'عبد الرحمن بن خلدون',
    publisher: 'دار الكتب',
    hall: 'جناح فلسطين (Palestine)',
    stand: 'B7',
    priceDZD: 2800,
    status: 'comparing',
    notes: 'مقارنة مع طبعة دار التنوير',
    createdAt: Date.now() - 3600 * 1000 * 5,
    updatedAt: Date.now() - 3600 * 1000 * 5
  }
];

export async function initDatabase() {
  try {
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add(DEFAULT_SETTINGS);
    }

    const booksCount = await db.books.count();
    if (booksCount === 0) {
      await db.books.bulkAdd(INITIAL_BOOKS);
    } else {
      // Migrate existing books with legacy hall names to the official SILA pavilions
      const allBooks = await db.books.toArray();
      for (const b of allBooks) {
        if (!b.hall || b.hall.includes('القاعة')) {
          let updatedHall = 'جناح فلسطين (Palestine)';
          if (b.hall?.includes('القاعة 2')) updatedHall = 'جناح الكونكورد (Concorde)';
          else if (b.hall?.includes('القاعة 3')) updatedHall = 'جناح قورارة (Gourara)';
          else if (b.hall?.includes('القاعة 4')) updatedHall = 'جناح القصبة (Casbah)';
          await db.books.update(b.id, { hall: updatedHall });
        }
      }
    }
  } catch (error) {
    console.error('Failed to initialize database defaults:', error);
  }
}
