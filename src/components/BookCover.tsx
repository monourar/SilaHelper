import React from 'react';
import { useCoverImage } from '../hooks/useCoverImage';
import { Book } from '../types/book';
import { BookOpen, Sparkles, Feather, Bookmark, Landmark, Scroll } from 'lucide-react';

interface BookCoverProps {
  book?: Book;
  coverImageId?: string;
  title?: string;
  author?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  previewUrl?: string | null;
}

const PALETTES = [
  {
    gradient: 'from-[#FAF6EF] via-[#F2E8DA] to-[#E2D2BD]',
    border: '#D8C7B2',
    textColor: '#2E2219',
    accentColor: '#A86D2D',
    Icon: BookOpen,
  },
  {
    gradient: 'from-[#3A5340] via-[#2A4030] to-[#1B2B20]',
    border: '#4D6B55',
    textColor: '#F5F8F5',
    accentColor: '#A0D2AC',
    Icon: Landmark,
  },
  {
    gradient: 'from-[#423028] via-[#2F211A] to-[#1C120C]',
    border: '#694F43',
    textColor: '#FDFBF7',
    accentColor: '#D8A05B',
    Icon: Scroll,
  },
  {
    gradient: 'from-[#2F445D] via-[#1F3145] to-[#131F2E]',
    border: '#4A688B',
    textColor: '#F4F8FC',
    accentColor: '#90C0EA',
    Icon: Feather,
  },
  {
    gradient: 'from-[#4B3245] via-[#362131] to-[#22131F]',
    border: '#6B4A63',
    textColor: '#FCF5FB',
    accentColor: '#D89EC7',
    Icon: Sparkles,
  },
];

export const BookCover: React.FC<BookCoverProps> = ({
  book,
  coverImageId = book?.coverImageId,
  title = book?.title || '',
  author = book?.author || '',
  size = 'md',
  className = '',
  previewUrl,
}) => {
  const { imageUrl } = useCoverImage(previewUrl ? undefined : coverImageId);
  const activeUrl = previewUrl || imageUrl;

  const sizeClasses = {
    sm: 'w-12 h-16 rounded-[8px] text-[9px]',
    md: 'w-16 h-22 rounded-[10px] text-[10px]',
    lg: 'w-24 h-32 rounded-[14px] text-xs',
    xl: 'w-28 h-38 rounded-[16px] text-sm',
  };

  if (activeUrl) {
    return (
      <div
        className={`relative overflow-hidden shrink-0 shadow-sm border border-black/10 bg-sila-parchment ${sizeClasses[size]} ${className}`}
      >
        <img
          src={activeUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Subtle spine shadow on the right in RTL */}
        <div className="absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/25 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Pre-matched custom styled covers for the demo books using pure CSS gradients and real Lucide icons
  if (title.includes('العادات الذرية')) {
    return (
      <div
        className={`relative overflow-hidden shrink-0 shadow-sm border border-[#D5C5B0] bg-gradient-to-b from-[#FFFDF8] via-[#F8F2E6] to-[#EBE0CF] flex flex-col justify-between p-2 select-none ${sizeClasses[size]} ${className}`}
      >
        <div className="absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/15 to-transparent" />
        <div className="text-center font-bold text-[#2A1E17] leading-tight line-clamp-2 mt-0.5">
          العادات<br />الذرية
        </div>
        <div className="my-auto flex justify-center text-[#A86D2D]">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-center text-[8px] text-[#705E50] truncate font-medium">
          جيمس كلير
        </div>
      </div>
    );
  }

  if (title.includes('تاريخ الجزائر')) {
    return (
      <div
        className={`relative overflow-hidden shrink-0 shadow-sm border border-[#44664B] bg-gradient-to-b from-[#2F4F36] via-[#213B27] to-[#142619] flex flex-col justify-between p-2 text-[#F4F9F5] select-none ${sizeClasses[size]} ${className}`}
      >
        <div className="absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/35 to-transparent" />
        <div className="text-center font-bold text-[#F3E2C4] leading-tight line-clamp-2 mt-0.5">
          تاريخ الجزائر<br />المعاصر
        </div>
        <div className="my-auto flex justify-center text-[#A4D4AF]">
          <Landmark className="w-4 h-4" />
        </div>
        <div className="text-center text-[8px] text-stone-300 truncate font-medium">
          أحمد توفيق
        </div>
      </div>
    );
  }

  if (title.includes('الفلسفة')) {
    return (
      <div
        className={`relative overflow-hidden shrink-0 shadow-sm border border-[#583E30] bg-gradient-to-b from-[#3D291F] via-[#2E1E16] to-[#1D120D] flex flex-col justify-between p-2 text-[#FAF3EB] select-none ${sizeClasses[size]} ${className}`}
      >
        <div className="absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/40 to-transparent" />
        <div className="text-center font-bold text-[#ECC28C] leading-tight line-clamp-2 mt-0.5">
          موسوعة<br />الفلسفة
        </div>
        <div className="my-auto flex justify-center text-[#ECC28C]">
          <Scroll className="w-4 h-4" />
        </div>
        <div className="text-center text-[8px] text-stone-300 truncate font-medium">
          موريس بلانشو
        </div>
      </div>
    );
  }

  if (title.includes('الأدب العربي')) {
    return (
      <div
        className={`relative overflow-hidden shrink-0 shadow-sm border border-[#3A506C] bg-gradient-to-b from-[#243B55] via-[#1A2C40] to-[#101C2B] flex flex-col justify-between p-2 text-[#F0F5FA] select-none ${sizeClasses[size]} ${className}`}
      >
        <div className="absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/35 to-transparent" />
        <div className="text-center font-bold text-[#E2EEF8] leading-tight line-clamp-2 mt-0.5">
          الأدب العربي<br />الحديث
        </div>
        <div className="my-auto flex justify-center text-[#9CC8F0]">
          <Feather className="w-4 h-4" />
        </div>
        <div className="text-center text-[8px] text-sky-200/80 truncate font-medium">
          شوقي ضيف
        </div>
      </div>
    );
  }

  if (title.includes('ابن خلدون')) {
    return (
      <div
        className={`relative overflow-hidden shrink-0 shadow-sm border border-[#3E5C47] bg-gradient-to-b from-[#26402E] via-[#1B3022] to-[#101E15] flex flex-col justify-between p-2 text-[#EFF5F0] select-none ${sizeClasses[size]} ${className}`}
      >
        <div className="absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/35 to-transparent" />
        <div className="text-center font-bold text-[#E5D7B7] leading-tight line-clamp-2 mt-0.5">
          سيرة<br />ابن خلدون
        </div>
        <div className="my-auto flex justify-center text-[#A6D8B3]">
          <Bookmark className="w-4 h-4" />
        </div>
        <div className="text-center text-[8px] text-stone-300 truncate font-medium">
          ابن خلدون
        </div>
      </div>
    );
  }

  // Dynamic hash palette with real Lucide icon
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = PALETTES[hash % PALETTES.length];
  const IconComponent = palette.Icon;

  return (
    <div
      className={`relative overflow-hidden shrink-0 shadow-sm border bg-gradient-to-b ${palette.gradient} flex flex-col justify-between p-2 select-none ${sizeClasses[size]} ${className}`}
      style={{ borderColor: palette.border }}
    >
      <div className="absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l from-black/20 to-transparent" />
      <div
        className="font-bold leading-tight line-clamp-2 text-center mt-0.5"
        style={{ color: palette.textColor }}
      >
        {title || 'كتاب بدون عنوان'}
      </div>
      <div className="my-auto flex justify-center" style={{ color: palette.accentColor }}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div
        className="text-center truncate text-[8px] font-medium opacity-80"
        style={{ color: palette.textColor }}
      >
        {author || book?.publisher || 'معرض الجزائر'}
      </div>
    </div>
  );
};
