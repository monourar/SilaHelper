import React, { useState } from 'react';
import { Book, AppSettings, BookStatus } from '../types/book';
import { db } from '../db/database';
import { GlassCard } from '../components/GlassCard';
import { formatDZD, formatNumber } from '../utils/formatters';
import { BookCover } from '../components/BookCover';
import { Wallet, Coins, ShoppingBag, AlertCircle, Edit2, Check, CheckCircle2 } from 'lucide-react';

interface BudgetScreenProps {
  books: Book[];
  settings: AppSettings;
  onEditBook: (book: Book) => void;
  onStatusChange: (bookId: string, status: BookStatus) => void;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  books,
  settings,
  onEditBook,
  onStatusChange,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(settings.budgetDZD || 30000));
  const [activeTab, setActiveTab] = useState<'purchased' | 'wanted'>('purchased');

  const budget = settings.budgetDZD || 30000;

  // Purchased calculations
  const purchasedBooks = books.filter((b) => b.status === 'purchased');
  const purchasedTotal = purchasedBooks.reduce((sum, b) => sum + (b.priceDZD || 0), 0);
  const purchasedUnknownCount = purchasedBooks.filter((b) => b.priceDZD === null || b.priceDZD === undefined).length;

  // Wanted calculations
  const wantedBooks = books.filter((b) => b.status === 'wanted');
  const wantedTotal = wantedBooks.reduce((sum, b) => sum + (b.priceDZD || 0), 0);
  const wantedUnknownCount = wantedBooks.filter((b) => b.priceDZD === null || b.priceDZD === undefined).length;

  // Remaining budget
  const remainingBudget = budget - purchasedTotal;
  const percentSpent = budget > 0 ? Math.round((purchasedTotal / budget) * 100) : 0;
  const isOverBudget = remainingBudget < 0;
  const isProjectedOverBudget = (purchasedTotal + wantedTotal) > budget;

  const handleSaveBudget = async () => {
    const parsed = Number(budgetInput);
    if (!isNaN(parsed) && parsed >= 0) {
      await db.settings.put({
        ...settings,
        budgetDZD: Math.round(parsed),
        updatedAt: Date.now(),
      });
      setIsEditingBudget(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Screen Title */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-sila-text font-arabic">
            الميزانية والمصاريف
          </h1>
          <p className="text-xs text-sila-muted mt-0.5">
            تتبع نفقاتك في المعرض ومراقبة السقف المالي المحدد
          </p>
        </div>

        <button
          onClick={() => {
            if (isEditingBudget) {
              handleSaveBudget();
            } else {
              setBudgetInput(String(budget));
              setIsEditingBudget(true);
            }
          }}
          className="text-xs md:text-sm font-bold text-sila-amber hover:text-sila-amberHover flex items-center gap-1.5 active:scale-95 transition-all bg-white/80 hover:bg-white px-4 py-2 rounded-xl border border-white/90 shadow-sm"
        >
          {isEditingBudget ? (
            <>
              <Check className="w-4 h-4 text-sila-green" />
              <span>تأكيد الميزانية</span>
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" />
              <span>تعديل الميزانية</span>
            </>
          )}
        </button>
      </div>

      {/* Main Budget Card with Restrained Ring / Meter */}
      <GlassCard variant="elevated" className="p-6 md:p-7 rounded-3xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className={`absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isOverBudget ? 'bg-sila-red' : 'bg-sila-amber'
          }`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sila-amber to-sila-amberLight text-white flex items-center justify-center shadow-md shadow-sila-amber/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-sila-muted">
                الميزانية المخصصة للمعرض
              </span>
              {isEditingBudget ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-32 bg-white border border-sila-amber px-3 py-1 text-base font-bold rounded-xl outline-none"
                    autoFocus
                  />
                  <span className="text-xs text-sila-muted">دج</span>
                </div>
              ) : (
                <div className="text-xl md:text-2xl font-bold text-sila-text leading-tight mt-0.5">
                  {formatNumber(budget)} دج
                </div>
              )}
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative w-18 h-18 self-center sm:self-auto flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-stone-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isOverBudget ? 'text-sila-red' : 'text-sila-amber'}
                strokeDasharray={`${Math.min(100, Math.max(0, percentSpent))}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-bold text-sila-text">
                {percentSpent}%
              </span>
            </div>
          </div>
        </div>

        {/* Linear breakdown bar with gradient */}
        <div className="w-full h-2.5 rounded-full bg-stone-200/80 overflow-hidden mb-4 flex">
          <div
            className={`h-full transition-all duration-300 ${
              isOverBudget
                ? 'bg-gradient-to-r from-red-500 to-rose-600'
                : 'bg-gradient-to-r from-emerald-500 to-green-600'
            }`}
            style={{ width: `${Math.min(100, percentSpent)}%` }}
          />
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-black/5">
          <div>
            <span className="text-xs text-sila-muted font-medium">
              إجمالي ما تم إنفاقه
            </span>
            <div className="text-lg md:text-xl font-bold text-sila-green mt-0.5">
              {formatNumber(purchasedTotal)} دج
            </div>
            <span className="text-xs text-sila-muted">
              ({purchasedBooks.length} كتب مشتراة)
            </span>
          </div>

          <div>
            <span className="text-xs text-sila-muted font-medium">
              المبلغ المتبقي
            </span>
            <div
              className={`text-lg md:text-xl font-bold mt-0.5 ${
                isOverBudget ? 'text-sila-red' : 'text-sila-text'
              }`}
            >
              {formatNumber(remainingBudget)} دج
            </div>
            <span className="text-xs text-sila-muted">
              {isOverBudget ? 'تجاوزت الميزانية' : 'متاح للصرف'}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Gentle Budget Warnings if needed */}
      {isOverBudget && (
        <div className="flex items-center gap-2.5 p-3.5 bg-sila-redSoft border border-sila-red/30 rounded-2xl text-xs md:text-sm text-sila-red">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            لقد تجاوزت إجمالي ميزانيتك بمقدار {formatNumber(Math.abs(remainingBudget))} دج.
          </span>
        </div>
      )}

      {!isOverBudget && isProjectedOverBudget && (
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs md:text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 shrink-0 text-sila-amber" />
          <span>
            تنبيه: تكلفة الكتب المشتراة + التي تريد شراءها ({formatNumber(purchasedTotal + wantedTotal)} دج) ستتجاوز ميزانيتك المحددة.
          </span>
        </div>
      )}

      {(purchasedUnknownCount > 0 || wantedUnknownCount > 0) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-black/[0.03] rounded-xl text-xs text-sila-muted">
          <span>* ملاحظة: هناك {purchasedUnknownCount + wantedUnknownCount} كتب مسجلة بدون سعر، ولم يتم احتسابها في الإجمالي التقديري.</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Books Wanted Summary */}
        <GlassCard
          variant="surface"
          interactive
          onClick={() => setActiveTab('wanted')}
          className={`p-4 rounded-2xl border transition-all ${
            activeTab === 'wanted' ? 'ring-2 ring-sila-amber/50 bg-white/95' : ''
          }`}
        >
          <div className="flex items-center gap-2 text-sila-amber mb-1.5">
            <Coins className="w-4 h-4" />
            <span className="text-xs md:text-sm font-bold">في قائمة الشراء (أريد شراءه)</span>
          </div>
          <div className="text-lg md:text-xl font-bold text-sila-text">
            {formatNumber(wantedTotal)} دج
          </div>
          <span className="text-xs text-sila-muted font-medium mt-0.5 block">
            {wantedBooks.length} كتب بانتظار الشراء
          </span>
        </GlassCard>

        {/* Books Purchased Summary */}
        <GlassCard
          variant="surface"
          interactive
          onClick={() => setActiveTab('purchased')}
          className={`p-4 rounded-2xl border transition-all ${
            activeTab === 'purchased' ? 'ring-2 ring-sila-green/50 bg-white/95' : ''
          }`}
        >
          <div className="flex items-center gap-2 text-sila-green mb-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs md:text-sm font-bold">تم شراؤها بالفعل</span>
          </div>
          <div className="text-lg md:text-xl font-bold text-sila-text">
            {formatNumber(purchasedTotal)} دج
          </div>
          <span className="text-xs text-sila-muted font-medium mt-0.5 block">
            {purchasedBooks.length} كتب تم اقتناؤها
          </span>
        </GlassCard>
      </div>

      {/* Books Detail Tab View */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-sila-text font-arabic">
            {activeTab === 'purchased' ? 'قائمة الكتب المشتراة' : 'كتب تنوي شراءها'}
          </h2>
          <span className="text-xs text-sila-muted">
            {activeTab === 'purchased' ? purchasedBooks.length : wantedBooks.length} كتب
          </span>
        </div>

        {/* List of relevant books in responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(activeTab === 'purchased' ? purchasedBooks : wantedBooks).map((book) => (
            <GlassCard
              key={book.id}
              interactive
              onClick={() => onEditBook(book)}
              className="p-3.5 flex items-center justify-between rounded-2xl"
            >
              <div className="flex items-center gap-3 min-w-0 pr-1">
                <BookCover book={book} size="sm" />
                <div className="min-w-0">
                  <h4 className="text-xs md:text-sm font-bold text-sila-text truncate">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-sila-muted truncate mt-0.5">
                    {book.publisher} · {book.stand}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs md:text-sm font-bold text-sila-green">
                  {formatDZD(book.priceDZD)}
                </span>
                {activeTab === 'wanted' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(book.id, 'purchased');
                    }}
                    title="تحديد كـ تم شراؤه"
                    className="p-1.5 rounded-full bg-sila-greenSoft text-sila-green hover:bg-sila-green hover:text-white transition-all active:scale-90"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </GlassCard>
          ))}

          {(activeTab === 'purchased' ? purchasedBooks : wantedBooks).length === 0 && (
            <GlassCard className="col-span-full p-8 text-center rounded-2xl">
              <p className="text-xs md:text-sm text-sila-muted">
                {activeTab === 'purchased'
                  ? 'لم تقم بتسجيل أي كتاب مشترى بعد.'
                  : 'لا توجد كتب متبقية في قائمة الشراء.'}
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
