import React from 'react';
import { Sparkles, MapPin, Calendar } from 'lucide-react';

export const SilaHeroHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-[#F7F1E8]/80 to-[#ECE0D0]/70 border border-white/80 shadow-glass p-5 md:p-7 mb-5">
      {/* Ambient background light gradients */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-[#C28A45]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-tr from-[#A86D2D]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title and subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sila-amberSoft/90 border border-sila-amber/20 text-sila-amber text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>معرض الجزائر الدولي للكتاب · SILA</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sila-text font-arabic">
            مكتبتي في المعرض
          </h1>

          <p className="text-xs md:text-sm text-sila-muted max-w-xl font-medium leading-relaxed">
            دفترك الشخصي لتوثيق الكتب، أرقام الأجنحة، دور النشر، ومتابعة ميزانية مشترياتك في قصر المعارض (SAFEX).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-sila-muted">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sila-amber" />
              قصر المعارض، الصنوبر البحري
            </span>
            <span className="w-1 h-1 rounded-full bg-stone-300" />
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sila-amber" />
              فلسطين · الكونكورد · قورارة · القصبة
            </span>
          </div>
        </div>

        {/* Official SILA 3D Emblem */}
        <div className="hidden sm:block shrink-0 self-center">
          <img
            src="/sila-logo.png"
            alt="SILA Emblem"
            className="w-20 h-20 rounded-3xl object-cover shadow-glass-hover border-2 border-white/90 transform hover:scale-105 transition-transform duration-200"
          />
        </div>
      </div>
    </div>
  );
};
