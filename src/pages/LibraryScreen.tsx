import React, { useState, useMemo } from 'react';
import { Book, BookStatus, HALL_OPTIONS } from '../types/book';
import { BookItemCard } from '../components/BookItemCard';
import { BookCover } from '../components/BookCover';
import { GlassCard } from '../components/GlassCard';
import { matchesArabic } from '../utils/arabic';
import { formatDZD } from '../utils/formatters';
import { Search, SlidersHorizontal, LayoutGrid, List, Plus, MapPin, CheckCircle2, ChevronDown } from 'lucide-react';

interface LibraryScreenProps {
  books: Book[];
  initialFilter?: BookStatus | 'all';
  initialSearch?: string;
  onOpenAddModal: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onStatusChange: (bookId: string, status: BookStatus) => void;
}

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'title' | 'stand';

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  books,
  initialFilter = 'all',
  initialSearch = '',
  onOpenAddModal,
  onEditBook,
  onDeleteBook,
  onStatusChange,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | 'all'>(initialFilter);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isGridView, setIsGridView] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedHall, setSelectedHall] = useState<string>('all');

  // Extract unique halls for filtering with SILA official halls always available
  const halls = useMemo(() => {
    const set = new Set<string>(HALL_OPTIONS);
    books.forEach((b) => {
      if (b.hall) set.add(b.hall);
    });
    return Array.from(set);
  }, [books]);

  // Filter & search books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Status filter
      if (selectedStatus !== 'all' && book.status !== selectedStatus) {
        return false;
      }

      // Hall filter
      if (selectedHall !== 'all' && book.hall !== selectedHall) {
        return false;
      }

      // Search query filter (title, author, publisher, stand, notes)
      if (searchQuery.trim()) {
        const query = searchQuery.trim();
        const matches =
          matchesArabic(book.title, query) ||
          matchesArabic(book.author, query) ||
          matchesArabic(book.publisher, query) ||
          matchesArabic(book.stand, query) ||
          matchesArabic(book.notes, query);
        if (!matches) return false;
      }

      return true;
    });
  }, [books, selectedStatus, selectedHall, searchQuery]);

  // Sort books
  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      if (sortBy === 'recent') {
        return b.updatedAt - a.updatedAt;
      }
      if (sortBy === 'price-asc') {
        const pA = a.priceDZD ?? Infinity;
        const pB = b.priceDZD ?? Infinity;
        return pA - pB;
      }
      if (sortBy === 'price-desc') {
        const pA = a.priceDZD ?? -Infinity;
        const pB = b.priceDZD ?? -Infinity;
        return pB - pA;
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '', 'ar');
      }
      if (sortBy === 'stand') {
        return (a.stand || '').localeCompare(b.stand || '');
      }
      return 0;
    });
  }, [filteredBooks, sortBy]);

  const statusChips: { id: BookStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'wanted', label: 'أريد شراءه' },
    { id: 'purchased', label: 'تم شراؤه' },
    { id: 'comparing', label: 'للمقارنة' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar with Title and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-sila-text font-arabic">
            مكتبتي
          </h1>
          <p className="text-xs text-sila-muted mt-0.5">
            عرض وتصنيف الكتب المحفوظة في جولتك
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / List View Toggle */}
          <button
            onClick={() => setIsGridView((prev) => !prev)}
            title={isGridView ? 'عرض كقائمة' : 'عرض كشبكة'}
            aria-label={isGridView ? 'عرض كقائمة' : 'عرض كشبكة'}
            className="w-10 h-10 rounded-2xl bg-white/70 hover:bg-white/80 border border-white/80 shadow-sm flex items-center justify-center text-sila-muted hover:text-sila-text active:scale-95 transition-all"
          >
            {isGridView ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>

          {/* Sort & Filter button */}
          <button
            onClick={() => setShowFilterSheet((prev) => !prev)}
            title="خيارات الترتيب والتصفية"
            aria-label="خيارات الترتيب والتصفية"
            className="h-10 px-3.5 rounded-2xl bg-white/70 hover:bg-white/80 border border-white/80 shadow-sm flex items-center gap-2 text-xs font-bold text-sila-muted hover:text-sila-text active:scale-95 transition-all relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">خيارات التصفية</span>
            {selectedHall !== 'all' && (
              <span className="w-2 h-2 rounded-full bg-sila-amber" />
            )}
          </button>

          {/* Counter Badge */}
          <span className="text-xs font-bold text-sila-muted bg-white/70 border border-white/80 px-3 py-2 rounded-2xl shadow-sm">
            {sortedBooks.length} كتاب
          </span>
        </div>
      </div>

      {/* Search Input & Status Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <GlassCard
          variant="surface"
          className="md:col-span-7 flex items-center px-4 py-2.5 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-sila-amber/30 transition-all"
        >
          <Search className="w-4 h-4 text-sila-muted/70 shrink-0 ml-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الكتب أو دور النشر أو أرقام الأجنحة..."
            className="w-full bg-transparent text-sm text-sila-text outline-none placeholder:text-sila-muted/60 font-arabic"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-sila-muted hover:text-sila-text p-1"
            >
              ✕
            </button>
          )}
        </GlassCard>

        {/* Filter Chips */}
        <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusChips.map((chip) => {
            const isActive = selectedStatus === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedStatus(chip.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-sila-amber to-sila-amberLight text-white shadow-sm'
                    : 'bg-white/60 hover:bg-white/75 text-sila-muted border border-white/70'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort & Hall Filter Drawer / Popover if opened */}
      {showFilterSheet && (
        <GlassCard variant="elevated" className="p-4 rounded-2xl animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between text-xs font-bold text-sila-text">
              <span>ترتيب حسب:</span>
              <div className="relative flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-[#E0D5C7] rounded-xl pr-3.5 pl-8 py-1.5 text-xs text-sila-text outline-none cursor-pointer"
                >
                  <option value="recent">الأحدث إضافة</option>
                  <option value="title">اسم الكتاب (أ - ي)</option>
                  <option value="price-asc">السعر: من الأقل للأعلى</option>
                  <option value="price-desc">السعر: من الأعلى للأقل</option>
                  <option value="stand">الجناح</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-sila-muted/70 absolute left-2.5 pointer-events-none" />
              </div>
            </div>

            {halls.length > 0 && (
              <div className="flex items-center justify-between text-xs font-bold text-sila-text">
                <span>تصفية حسب القاعة:</span>
                <div className="relative flex items-center">
                  <select
                    value={selectedHall}
                    onChange={(e) => setSelectedHall(e.target.value)}
                    className="appearance-none bg-white border border-[#E0D5C7] rounded-xl pr-3.5 pl-8 py-1.5 text-xs text-sila-text outline-none max-w-[190px] truncate cursor-pointer"
                  >
                    <option value="all">جميع القاعات</option>
                    {halls.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-sila-muted/70 absolute left-2.5 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Books Content (Responsive Grid) */}
      {sortedBooks.length > 0 ? (
        isGridView ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {sortedBooks.map((book) => (
              <GlassCard
                key={book.id}
                interactive
                onClick={() => onEditBook(book)}
                className="p-3.5 flex flex-col justify-between rounded-2xl relative"
              >
                <div className="flex flex-col items-center text-center">
                  <BookCover book={book} size="lg" className="mb-2.5 shadow-sm" />
                  <h3 className="font-bold text-xs md:text-sm text-sila-text line-clamp-2 mt-1">
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="text-[11px] text-sila-muted truncate max-w-full mt-0.5">
                      {book.author}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-sila-green">
                    {formatDZD(book.priceDZD)}
                  </span>
                  <div className="text-[11px] text-sila-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sila-amber" />
                    <span>{book.stand}</span>
                  </div>
                </div>

                {book.status === 'purchased' && (
                  <div className="absolute top-2.5 right-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sila-green fill-white" />
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        ) : (
          /* Responsive List View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedBooks.map((book) => (
              <BookItemCard
                key={book.id}
                book={book}
                onEdit={onEditBook}
                onDelete={onDeleteBook}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <GlassCard className="p-12 text-center my-6 rounded-3xl">
          <p className="text-base font-bold text-sila-text mb-1">
            لم يتم العثور على أي كتب
          </p>
          <p className="text-xs md:text-sm text-sila-muted mb-5">
            {searchQuery
              ? `لا توجد نتائج تطابق "${searchQuery}"`
              : 'جرب تغيير خيارات التصفية أو أضف كتباً جديدة.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sila-amber to-sila-amberLight text-white text-xs md:text-sm font-bold py-3 px-6 rounded-xl shadow-sm hover:opacity-95 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كتاب جديد</span>
          </button>
        </GlassCard>
      )}
    </div>
  );
};
