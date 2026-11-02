import React, { useState, useEffect, useRef } from 'react';
import { Book, AppSettings } from '../types/book';
import { db, DEFAULT_SETTINGS } from '../db/database';
import { GlassCard } from '../components/GlassCard';
import { formatNumber, formatStorageSize } from '../utils/formatters';
import { exportDatabaseToJSON, exportBooksToCSV, importDatabaseFromJSON } from '../utils/backup';
import {
  Wallet,
  ChevronLeft,
  UploadCloud,
  DownloadCloud,
  FileSpreadsheet,
  FileJson,
  Trash2,
  HardDrive,
  Info,
  ShieldCheck,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

interface SettingsScreenProps {
  books: Book[];
  settings: AppSettings;
  onNavigateToBudget: () => void;
  onDataReset: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  books,
  settings,
  onNavigateToBudget,
  onDataReset,
}) => {
  const [imagesStorageBytes, setImagesStorageBytes] = useState<number>(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute budget stats for the top card
  const budget = settings.budgetDZD || 30000;
  const spent = books
    .filter((b) => b.status === 'purchased')
    .reduce((sum, b) => sum + (b.priceDZD || 0), 0);
  const percentSpent = budget > 0 ? Math.round((spent / budget) * 100) : 0;

  // Calculate stored images size
  useEffect(() => {
    let isMounted = true;
    db.coverImages.toArray().then((imgs) => {
      if (!isMounted) return;
      const totalBytes = imgs.reduce((acc, img) => acc + (img.sizeBytes || img.blob?.size || 0), 0);
      setImagesStorageBytes(totalBytes);
    });
    return () => {
      isMounted = false;
    };
  }, [books]);

  // Handle file import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('جارٍ فحص واستعادة النسخة الاحتياطية...');
      const text = await file.text();
      const result = await importDatabaseFromJSON(text, 'merge');
      setImportStatus(`تم الاستيراد بنجاح! تمت إضافة ${result.added} كتاب وتحديث ${result.updated} كتاب.`);
      setTimeout(() => setImportStatus(null), 5000);
      onDataReset();
    } catch (err: unknown) {
      console.error('Import failed:', err);
      const message = err instanceof Error ? err.message : 'فشل استيراد الملف، تأكد من صحة النسخة.';
      alert(message);
      setImportStatus(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Clear All Data
  const handleClearAll = async () => {
    try {
      await db.books.clear();
      await db.coverImages.clear();
      await db.settings.put(DEFAULT_SETTINGS);
      setShowClearConfirm(false);
      onDataReset();
      alert('تم حذف جميع البيانات بنجاح.');
    } catch (err) {
      console.error('Error clearing data:', err);
      alert('حدث خطأ أثناء حذف البيانات.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="px-1">
        <h1 className="text-xl md:text-2xl font-bold text-sila-text font-arabic">
          الإعدادات والأدوات
        </h1>
        <p className="text-xs text-sila-muted mt-0.5">
          النسخ الاحتياطي، إدارة الذاكرة، وخصوصية بياناتك
        </p>
      </div>

      {/* Top Budget Card matching Screen 4 in Reference Image */}
      <GlassCard
        variant="elevated"
        interactive
        onClick={onNavigateToBudget}
        className="p-5 md:p-6 rounded-3xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sila-amber to-sila-amberLight text-white flex items-center justify-center shadow-md shadow-sila-amber/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-sila-muted block">
              ملخص الميزانية
            </span>
            <div className="text-lg md:text-xl font-bold text-sila-text">
              {formatNumber(spent)} دج
            </div>
            <span className="text-xs text-sila-muted">
              من أصل {formatNumber(budget)} دج
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Circular 62% badge */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-stone-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-sila-amber"
                strokeDasharray={`${Math.min(100, Math.max(0, percentSpent))}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold text-sila-text">
              {percentSpent}%
            </span>
          </div>

          <ChevronLeft className="w-5 h-5 text-sila-muted" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup Section */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-sila-muted px-2 block">
            النسخ الاحتياطي ونقل البيانات
          </span>

          <GlassCard variant="surface" className="divide-y divide-black/5 rounded-2xl overflow-hidden">
            {/* Export Data */}
            <button
              onClick={() => setShowExportModal(true)}
              className="w-full p-4 flex items-center justify-between text-right hover:bg-black/[0.02] active:bg-black/[0.04] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/15 to-orange-500/25 text-sila-amber flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs md:text-sm font-bold text-sila-text block">
                    تصدير البيانات
                  </span>
                  <span className="text-[11px] text-sila-muted">
                    حفظ نسخة كاملة (JSON أو جدول CSV)
                  </span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-sila-muted" />
            </button>

            {/* Import Data */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 flex items-center justify-between text-right hover:bg-black/[0.02] active:bg-black/[0.04] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/15 to-blue-500/25 text-sila-blue flex items-center justify-center">
                  <DownloadCloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs md:text-sm font-bold text-sila-text block">
                    استيراد البيانات
                  </span>
                  <span className="text-[11px] text-sila-muted">
                    استعادة نسخة سابقة من ملف JSON
                  </span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-sila-muted" />
            </button>
          </GlassCard>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          {importStatus && (
            <div className="p-3 bg-sila-greenSoft text-sila-green border border-sila-green/20 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Data Management Section */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-sila-muted px-2 block">
            إدارة التخزين المحلي
          </span>

          <GlassCard variant="surface" className="divide-y divide-black/5 rounded-2xl overflow-hidden">
            {/* Books Count */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/5 text-sila-text flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs md:text-sm font-bold text-sila-text">
                  عدد الكتب المحفوظة
                </span>
              </div>
              <span className="text-xs md:text-sm font-bold text-sila-muted">
                {books.length} كتاب
              </span>
            </div>

            {/* Stored Images Size */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/5 text-sila-text flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <span className="text-xs md:text-sm font-bold text-sila-text">
                  حجم الصور المخزنة
                </span>
              </div>
              <span className="text-xs md:text-sm font-bold text-sila-muted">
                {formatStorageSize(imagesStorageBytes)}
              </span>
            </div>

            {/* Clear All Data */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full p-4 flex items-center justify-between text-right hover:bg-red-50/50 active:bg-red-50 transition-all text-sila-red"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sila-redSoft text-sila-red flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <span className="text-xs md:text-sm font-bold text-sila-red">
                  حذف جميع البيانات
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 text-sila-red/60" />
            </button>
          </GlassCard>
        </div>
      </div>

      {/* App Information Section */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-sila-muted px-2 block">
          معلومات التطبيق والخصوصية
        </span>

        <GlassCard variant="surface" className="divide-y divide-black/5 rounded-2xl overflow-hidden">
          {/* About */}
          <button
            onClick={() => setShowAboutModal(true)}
            className="w-full p-4 flex items-center justify-between text-right hover:bg-black/[0.02] active:bg-black/[0.04] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/5 text-sila-text flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs md:text-sm font-bold text-sila-text block">
                  عن التطبيق
                </span>
                <span className="text-[11px] text-sila-muted">
                  دفتر شخصي لزوار صالون الجزائر الدولي للكتاب
                </span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-sila-muted" />
          </button>

          {/* Privacy */}
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="w-full p-4 flex items-center justify-between text-right hover:bg-black/[0.02] active:bg-black/[0.04] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/15 to-green-500/25 text-sila-green flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs md:text-sm font-bold text-sila-text block">
                  الخصوصية
                </span>
                <span className="text-[11px] text-sila-muted">
                  البيانات محفوظة 100% محلياً على جهازك دون إرسالها لأي خادم
                </span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-sila-muted" />
          </button>

          {/* Installation Guidance */}
          <button
            onClick={() => setShowInstallGuide(true)}
            className="w-full p-4 flex items-center justify-between text-right hover:bg-black/[0.02] active:bg-black/[0.04] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/15 to-orange-500/25 text-sila-amber flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs md:text-sm font-bold text-sila-text block">
                  تثبيت التطبيق على الجهاز
                </span>
                <span className="text-[11px] text-sila-muted">
                  تثبيت كـ PWA للعمل دون اتصال بالإنترنت
                </span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-sila-muted" />
          </button>
        </GlassCard>
      </div>

      {/* App Version Footer */}
      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-sila-muted font-medium">
          مكتبتي في المعرض — الإصدار 1.0.0
        </p>
        <p className="text-[11px] text-sila-muted/70 mt-0.5">
          صالون الجزائر الدولي للكتاب · SILA
        </p>
      </div>

      {/* Export Format Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <GlassCard variant="elevated" className="w-full max-w-sm p-5 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-sila-text font-arabic">
              اختر صيغة التصدير
            </h3>

            <div className="space-y-2">
              <button
                onClick={async () => {
                  setIsExporting(true);
                  try {
                    await exportDatabaseToJSON(true);
                    setShowExportModal(false);
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-sila-amberSoft to-amber-100 hover:from-amber-100 hover:to-amber-200 border border-sila-amber/30 text-right flex items-center justify-between text-xs font-bold text-sila-amber transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileJson className="w-5 h-5" />
                  <div>
                    <span className="block font-bold">نسخة كاملة JSON (مع الصور)</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      للنسخ الاحتياطي واستعادة البيانات لاحقاً
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={async () => {
                  setIsExporting(true);
                  try {
                    await exportBooksToCSV();
                    setShowExportModal(false);
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className="w-full p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-right flex items-center justify-between text-xs font-bold text-stone-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-sila-green" />
                  <div>
                    <span className="block font-bold">جدول بيانات CSV</span>
                    <span className="text-[10px] text-stone-500 font-normal">
                      لفتح القائمة في Excel أو Google Sheets
                    </span>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-sila-muted hover:text-sila-text"
            >
              إلغاء
            </button>
          </GlassCard>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <GlassCard variant="elevated" className="w-full max-w-sm p-6 rounded-3xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sila-redSoft text-sila-red flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-sila-text">
              تأكيد حذف جميع البيانات
            </h3>

            <p className="text-xs text-sila-muted leading-relaxed">
              سيتم مسح جميع الكتب المحفوظة وصور الأغلفة والميزانية نهائياً من هذا الجهاز. لا يمكن التراجع عن هذا الإجراء إلا إذا كنت تملك نسخة احتياطية.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 px-4 rounded-xl bg-sila-red text-white text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                نعم، احذف الكل
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold active:scale-95 transition-all"
              >
                تراجع
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <GlassCard variant="elevated" className="w-full max-w-md p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-sila-text font-arabic">
              عن تطبيق «مكتبتي في المعرض»
            </h3>
            <p className="text-xs md:text-sm text-sila-muted leading-relaxed">
              تطبيق شخصي مصمم خصيصاً لزوار صالون الجزائر الدولي للكتاب (SILA) في قصر المعارض الصنوبر البحري (SAFEX). يساعدك على تدوين العناوين، أسماء دور النشر، وأرقام الأجنحة والقاعات أثناء تجوالك بين الأروقة، مع متابعة ميزانية مشترياتك.
            </p>
            <div className="p-3.5 bg-stone-50 rounded-2xl text-xs text-stone-600 space-y-1.5">
              <p>• تصميم هادئ ومريح مستوحى من لغة التصميم الحديثة لـ Apple.</p>
              <p>• يعمل بالكامل دون الحاجة لاتصال بالإنترنت (Offline First).</p>
              <p>• لا توجد حسابات أو خوادم خلفية؛ بياناتك مخزنة في جهازك فقط.</p>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sila-amber to-sila-amberLight text-white text-xs font-bold mt-2"
            >
              إغلاق
            </button>
          </GlassCard>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <GlassCard variant="elevated" className="w-full max-w-sm p-6 rounded-3xl space-y-3.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/15 to-green-500/25 text-sila-green flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-sila-text">
              خصوصية تامة 100%
            </h3>
            <p className="text-xs text-sila-muted leading-relaxed">
              جميع الكتب والملاحظات والميزانية والصور التي تحفظها مخزنة محلياً في ذاكرة متصفحك (IndexedDB) فقط، ولا يتم إرسال أي حرف إلى أي خادم خارجي أو طرف ثالث.
            </p>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sila-amber to-sila-amberLight text-white text-xs font-bold"
            >
              فهمت ذلك
            </button>
          </GlassCard>
        </div>
      )}

      {/* Install Guidance Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <GlassCard variant="elevated" className="w-full max-w-md p-6 rounded-3xl space-y-4">
            <h3 className="text-base md:text-lg font-bold text-sila-text font-arabic">
              تثبيت التطبيق على جهازك
            </h3>
            <div className="space-y-2.5 text-xs text-sila-muted">
              <div className="p-3 bg-stone-50 rounded-2xl">
                <span className="font-bold text-sila-text block mb-1">
                  على هواتف iPhone (Safari):
                </span>
                <span>
                  اضغط على زر المشاركة <span className="font-bold">Share</span> بالأسفل، ثم اختر <span className="font-bold">«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</span>.
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl">
                <span className="font-bold text-sila-text block mb-1">
                  على هواتف Android (Chrome):
                </span>
                <span>
                  اضغط على النقاط الثلاث بالأعلى، ثم اختر <span className="font-bold">«تثبيت التطبيق» (Install App)</span>.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sila-amber to-sila-amberLight text-white text-xs font-bold mt-2"
            >
              حسناً
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
