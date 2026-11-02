import React, { useState } from 'react';
import { db } from '../db/database';
import { AppSettings } from '../types/book';
import { Wallet, Sparkles, Check, ArrowLeft } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { formatNumber } from '../utils/formatters';

interface OnboardingBudgetModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onComplete: () => void;
}

const PRESET_BUDGETS = [15000, 25000, 35000, 50000];

export const OnboardingBudgetModal: React.FC<OnboardingBudgetModalProps> = ({
  isOpen,
  settings,
  onComplete,
}) => {
  const [budget, setBudget] = useState<string>('30000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async (selectedBudget?: number) => {
    setIsSubmitting(true);
    try {
      const finalAmount = selectedBudget !== undefined
        ? selectedBudget
        : Math.max(0, Math.round(Number(budget) || 30000));

      await db.settings.put({
        ...settings,
        id: 'default',
        budgetDZD: finalAmount,
        hasSeenOnboarding: true,
        updatedAt: Date.now(),
      });

      try {
        localStorage.setItem('sila_budget_set', 'true');
      } catch {
        // ignore localStorage access issues in private mode
      }

      onComplete();
    } catch (err) {
      console.error('Failed to save initial budget:', err);
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <GlassCard
        variant="elevated"
        className="w-full max-w-md p-6 sm:p-8 rounded-[32px] text-center space-y-5 shadow-2xl border-2 border-white/90 relative overflow-hidden"
        dir="rtl"
      >
        {/* Soft background ambient gradient */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-sila-amber/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* SILA Icon badge */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src="/sila-logo.png"
              alt="شعار SILA"
              className="w-20 h-20 rounded-3xl shadow-glass-hover border-2 border-white object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-sila-amber text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-sila-text font-arabic leading-snug">
            مرحباً بك في مكتبتي بالمعرض
          </h2>
          <p className="text-xs sm:text-sm text-sila-muted leading-relaxed max-w-sm mx-auto font-medium">
            دفترك الشخصي لتوثيق الكتب ومتابعة أروقة وأجنحة صالون الجزائر الدولي للكتاب.
          </p>
        </div>

        {/* Question & Input Box */}
        <div className="bg-white/80 border border-[#E4D8C8] rounded-2xl p-4 text-right space-y-3">
          <label className="block text-xs font-bold text-sila-text flex items-center gap-2">
            <Wallet className="w-4 h-4 text-sila-amber" />
            <span>كم هي ميزانيتك المخصصة لشراء الكتب؟</span>
          </label>

          <div className="relative flex items-center">
            <input
              type="number"
              inputMode="numeric"
              step="500"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="30000"
              className="w-full bg-[#FAF6F0] border border-[#D8C7B4] focus:border-sila-amber focus:ring-2 focus:ring-sila-amber/20 rounded-xl px-4 py-3 text-lg font-bold text-sila-text outline-none text-left tracking-wide"
            />
            <span className="absolute right-4 text-xs font-bold text-sila-muted pointer-events-none">
              دج (DZD)
            </span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_BUDGETS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setBudget(String(amount))}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  Number(budget) === amount
                    ? 'bg-sila-amber text-white shadow-sm'
                    : 'bg-black/[0.04] text-sila-muted hover:text-sila-text hover:bg-black/[0.08]'
                }`}
              >
                {formatNumber(amount)} دج
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => handleConfirm()}
            disabled={isSubmitting}
            className="w-full min-h-[48px] bg-gradient-to-r from-sila-amber to-sila-amberLight hover:from-sila-amberHover hover:to-sila-amber text-white py-3 px-6 rounded-2xl font-bold text-sm shadow-md active:scale-[0.98] transition-transform duration-150 ease-out flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>تأكيد وبدء الاستخدام</span>
          </button>

          <button
            type="button"
            onClick={() => handleConfirm(30000)}
            className="w-full py-2 text-xs font-semibold text-sila-muted hover:text-sila-text transition-colors flex items-center justify-center gap-1"
          >
            <span>تحديد لاحقاً (افتراضي: 30,000 دج)</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
