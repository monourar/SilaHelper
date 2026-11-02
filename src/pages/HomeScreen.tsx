import React, { useState } from 'react';
import { Book, BookStatus } from '../types/book';
import { SilaHeroHeader } from '../components/SilaHeroHeader';
import { GlassCard } from '../components/GlassCard';
import { BookItemCard } from '../components/BookItemCard';
import { formatNumber } from '../utils/formatters';
import { Search, BookMarked, ShoppingCart, Coins, Plus, ArrowLeft } from 'lucide-react';

interface HomeScreenProps {
  books: Book[];
  onOpenAddModal: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onStatusChange: (bookId: string, status: BookStatus) => void;
  onNavigateToLibrary: (initialFilter?: BookStatus) => void;
  onNavigateToBudget: () => void;
  onSearchChange: (query: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  books,
  onOpenAddModal,
  onEditBook,
  onDeleteBook,
  onStatusChange,
  onNavigateToLibrary,
  onNavigateToBudget,
  onSearchChange,
}) => {
  const [localSearch, setLocalSearch] = useState('');

  // Calculate live statistics
  const totalBooks = books.length;
  const wantedBooks = books.filter((b) => b.status === 'wanted');
  const wantedCount = wantedBooks.length;
  
  // Calculate total wanted price (excluding unknown null prices)
  const estimatedCost = wantedBooks.reduce((sum, b) => {
    return sum + (b.priceDZD || 0);
  }, 0);

  // Recent 5 books
  const recentBooks = [...books]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      onSearchChange(localSearch.trim());
      onNavigateToLibrary();
    }
  };

  return (
    <div className="space-y-6">
      {/* Real Website Hero Header */}
      <SilaHeroHeader />

      {/* Quick Search and Action Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <form onSubmit={handleSearchSubmit} className="md:col-span-3">
          <GlassCard
            variant="surface"
            className="flex items-center px-4 py-3 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-sila-amber/30 transition-all"
          >
            <Search className="w-5 h-5 text-sila-muted/70 shrink-0 ml-3" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="ابحث عن عنوان كتاب، اسم مؤلف، دار نشر، أو رقم جناح..."
              className="w-full bg-transparent text-sm md:text-base text-sila-text outline-none placeholder:text-sila-muted/60 font-arabic"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="text-xs text-sila-muted hover:text-sila-text p-1"
              >
                ✕
              </button>
            )}
          </GlassCard>
        </form>

        <button
          onClick={onOpenAddModal}
          className="hidden md:flex bg-gradient-to-r from-sila-amber to-sila-amberLight text-white py-3 px-5 rounded-2xl font-bold text-sm shadow-sm hover:opacity-95 active:scale-95 transition-all items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>إضافة كتاب جديد</span>
        </button>
      </div>

      {/* 3 Summary Statistic Cards with Gradient Backdrops */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {/* Card 1: Total Saved Books */}
        <GlassCard
          variant="surface"
          interactive
          onClick={() => onNavigateToLibrary()}
          className="p-4 md:p-5 text-center flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/15 to-blue-500/25 flex items-center justify-center mb-2 text-sila-blue">
            <BookMarked className="w-5 h-5" />
          </div>
          <span className="text-xl md:text-3xl font-bold text-sila-text leading-tight">
            {totalBooks}
          </span>
          <span className="text-xs md:text-sm text-sila-muted font-medium mt-1">
            كتاب محفوظ
          </span>
        </GlassCard>

        {/* Card 2: Wanted Books */}
        <GlassCard
          variant="surface"
          interactive
          onClick={() => onNavigateToLibrary('wanted')}
          className="p-4 md:p-5 text-center flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/15 to-green-500/25 flex items-center justify-center mb-2 text-sila-green">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-xl md:text-3xl font-bold text-sila-text leading-tight">
            {wantedCount}
          </span>
          <span className="text-xs md:text-sm text-sila-muted font-medium mt-1">
            أريد شراءه
          </span>
        </GlassCard>

        {/* Card 3: Estimated Cost */}
        <GlassCard
          variant="surface"
          interactive
          onClick={onNavigateToBudget}
          className="p-4 md:p-5 text-center flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/15 to-orange-500/25 flex items-center justify-center mb-2 text-sila-amber">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-base md:text-2xl font-bold text-sila-text leading-tight truncate max-w-full">
            {formatNumber(estimatedCost)}
          </span>
          <span className="text-[11px] md:text-xs text-sila-muted font-medium mt-1 truncate">
            دج (تقديري)
          </span>
        </GlassCard>
      </div>

      {/* Section Heading: "أحدث الكتب المضافة" with "عرض الكل" */}
      <div className="flex items-center justify-between pt-2 px-1">
        <h2 className="text-lg md:text-xl font-bold text-sila-text font-arabic">
          أحدث الكتب المضافة
        </h2>
        <button
          onClick={() => onNavigateToLibrary()}
          className="text-xs md:text-sm text-sila-muted hover:text-sila-text font-semibold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Books List (Responsive: 1 col on mobile, 2 cols on tablet/desktop) */}
      {recentBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentBooks.map((book) => (
            <BookItemCard
              key={book.id}
              book={book}
              onEdit={onEditBook}
              onDelete={onDeleteBook}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="p-10 text-center my-4 rounded-3xl">
          <p className="text-sm md:text-base text-sila-muted mb-4 font-medium">
            لم تحفظ أي كتاب بعد في جولتك بالمعرض.
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sila-amber to-sila-amberLight text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول كتاب</span>
          </button>
        </GlassCard>
      )}

      {/* Mobile Floating / Bottom Action Button */}
      <div className="md:hidden pt-2">
        <button
          onClick={onOpenAddModal}
          className="w-full bg-gradient-to-r from-sila-amber to-sila-amberLight text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>إضافة كتاب جديد</span>
        </button>
      </div>
    </div>
  );
};
