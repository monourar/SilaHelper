import React, { useState, useRef, useEffect } from 'react';
import { Book, BookStatus } from '../types/book';
import { BookCover } from './BookCover';
import { formatDZD } from '../utils/formatters';
import { MapPin, Bookmark, MoreHorizontal, Edit3, Trash2, CheckCircle2, ShoppingBag } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface BookItemCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
  onStatusChange: (bookId: string, newStatus: BookStatus) => void;
}

export const BookItemCard: React.FC<BookItemCardProps> = ({
  book,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when tapping outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Cycle status: wanted -> purchased -> comparing -> wanted
    if (book.status === 'wanted') {
      onStatusChange(book.id, 'purchased');
    } else if (book.status === 'purchased') {
      onStatusChange(book.id, 'comparing');
    } else {
      onStatusChange(book.id, 'wanted');
    }
  };

  const statusRibbon = () => {
    if (book.status === 'purchased') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-sila-green bg-sila-greenSoft px-2 py-0.5 rounded-full shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          تم شراؤه
        </span>
      );
    }
    if (book.status === 'comparing') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
          للمقارنة
        </span>
      );
    }
    return null;
  };

  return (
    <GlassCard
      variant="surface"
      interactive
      onClick={() => onEdit(book)}
      className={`p-3 mb-2 flex items-center gap-3 relative group transition-all ${
        showMenu ? 'z-40' : 'z-0'
      }`}
    >
      {/* Book Cover Thumbnail with fixed shrink */}
      <BookCover book={book} size="md" className="shadow-sm shrink-0" />

      {/* Book Information */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h3
            className="font-bold text-[15px] text-sila-text truncate leading-snug"
            title={book.title}
          >
            {book.title}
          </h3>
          {statusRibbon()}
        </div>

        {book.author && (
          <p
            className="text-[12px] text-sila-muted truncate font-medium"
            title={book.author}
          >
            {book.author}
          </p>
        )}

        {/* Location Info */}
        <div className="flex items-center gap-1 text-[11px] text-sila-muted/90 mt-1 truncate">
          <MapPin className="w-3 h-3 text-sila-amber shrink-0" />
          <span className="truncate" title={`${book.publisher} · جناح ${book.stand}${book.hall ? ` · ${book.hall}` : ''}`}>
            {book.publisher}
            {book.stand ? ` · جناح ${book.stand}` : ''}
            {book.hall ? ` (${book.hall.replace('جناح ', '')})` : ''}
          </span>
        </div>

        {/* Price tag */}
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[13px] font-bold text-sila-green tabular-nums">
            {formatDZD(book.priceDZD)}
          </span>
        </div>
      </div>

      {/* Action buttons (Bookmark & More Menu with 44px touch targets) */}
      <div className="flex items-center gap-0.5 self-center shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Bookmark Icon */}
        <button
          onClick={handleToggleBookmark}
          title="تغيير الحالة السريعة"
          aria-label="تغيير الحالة السريعة"
          className="w-11 h-11 flex items-center justify-center text-sila-muted/70 hover:text-sila-amber rounded-full hover:bg-black/5 active:scale-90 transition-transform duration-100 ease-out"
        >
          <Bookmark
            className={`w-4 h-4 ${
              book.status === 'wanted'
                ? 'fill-sila-amber text-sila-amber'
                : book.status === 'purchased'
                ? 'fill-sila-green text-sila-green'
                : 'text-sila-muted'
            }`}
          />
        </button>

        {/* Three dots menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            title="خيارات إضافية"
            aria-label="خيارات إضافية"
            className="w-11 h-11 flex items-center justify-center text-sila-muted/70 hover:text-sila-text rounded-full hover:bg-black/5 active:scale-90 transition-transform duration-100 ease-out"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute left-0 top-10 z-50 w-48 bg-white/95 backdrop-blur-2xl border border-white/90 rounded-2xl shadow-2xl py-1 text-xs origin-top-left animate-in fade-in zoom-in-95 duration-150 ease-out">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(book);
                }}
                className="w-full text-right px-4 py-2.5 flex items-center gap-2 hover:bg-sila-amberSoft text-sila-text font-medium min-h-[40px]"
              >
                <Edit3 className="w-4 h-4 text-sila-amber shrink-0" />
                تعديل بيانات الكتاب
              </button>

              <div className="h-[1px] bg-stone-100 my-0.5" />

              <button
                onClick={() => {
                  setShowMenu(false);
                  onStatusChange(book.id, 'wanted');
                }}
                className="w-full text-right px-4 py-2.5 flex items-center gap-2 hover:bg-stone-50 text-sila-text min-h-[40px]"
              >
                <ShoppingBag className="w-4 h-4 text-sila-amber shrink-0" />
                نقل إلى «أريد شراءه»
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onStatusChange(book.id, 'purchased');
                }}
                className="w-full text-right px-4 py-2.5 flex items-center gap-2 hover:bg-stone-50 text-sila-text min-h-[40px]"
              >
                <CheckCircle2 className="w-4 h-4 text-sila-green shrink-0" />
                تحديد «تم شراؤه»
              </button>

              <div className="h-[1px] bg-stone-100 my-0.5" />

              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(book.id);
                }}
                className="w-full text-right px-4 py-2.5 flex items-center gap-2 hover:bg-red-50 text-sila-red font-medium min-h-[40px]"
              >
                <Trash2 className="w-4 h-4 text-sila-red shrink-0" />
                حذف من مكتبتي
              </button>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
