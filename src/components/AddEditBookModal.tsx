import React, { useState, useEffect, useRef } from 'react';
import { Book, BookStatus, HALL_OPTIONS } from '../types/book';
import { db } from '../db/database';
import { generateThumbnail } from '../utils/image';
import { BookCover } from './BookCover';
import { ImageCropModal } from './ImageCropModal';
import { X, Camera, BookOpen, User, Building2, MapPin, Tag, ShoppingCart, Check, Bookmark, Trash2, ChevronDown, Crop } from 'lucide-react';

interface AddEditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
  onSaved?: () => void;
}

export const AddEditBookModal: React.FC<AddEditBookModalProps> = ({
  isOpen,
  onClose,
  bookToEdit,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [hall, setHall] = useState('القاعة 1 (المركزية)');
  const [stand, setStand] = useState('');
  const [price, setPrice] = useState<string>('');
  const [status, setStatus] = useState<BookStatus>('wanted');
  const [notes, setNotes] = useState('');
  
  // Cover image states
  const [selectedImageBlob, setSelectedImageBlob] = useState<Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [hasRemovedExistingImage, setHasRemovedExistingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Built-in Image Crop states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [pendingCropFile, setPendingCropFile] = useState<File | Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form if editing
  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title || '');
      setAuthor(bookToEdit.author || '');
      setPublisher(bookToEdit.publisher || '');
      setHall(bookToEdit.hall || HALL_OPTIONS[0]);
      setStand(bookToEdit.stand || '');
      setPrice(bookToEdit.priceDZD !== null && bookToEdit.priceDZD !== undefined ? String(bookToEdit.priceDZD) : '');
      setStatus(bookToEdit.status || 'wanted');
      setNotes(bookToEdit.notes || '');
      setSelectedImageBlob(null);
      setImagePreviewUrl(null);
      setHasRemovedExistingImage(false);
    } else {
      // Reset form
      setTitle('');
      setAuthor('');
      setPublisher('');
      setHall(HALL_OPTIONS[0]);
      setStand('');
      setPrice('');
      setStatus('wanted');
      setNotes('');
      setSelectedImageBlob(null);
      setImagePreviewUrl(null);
      setHasRemovedExistingImage(false);
    }
    setErrors({});
  }, [bookToEdit, isOpen]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingCropFile(file);
    setIsCropModalOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setSelectedImageBlob(croppedBlob);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    const newUrl = URL.createObjectURL(croppedBlob);
    setImagePreviewUrl(newUrl);
    setHasRemovedExistingImage(false);
    setPendingCropFile(null);
  };

  const handleOpenCropForCurrent = async () => {
    if (selectedImageBlob) {
      setPendingCropFile(selectedImageBlob);
      setIsCropModalOpen(true);
      return;
    }
    if (bookToEdit?.coverImageId) {
      try {
        const coverRecord = await db.coverImages.get(bookToEdit.coverImageId);
        if (coverRecord?.blob) {
          setPendingCropFile(coverRecord.blob);
          setIsCropModalOpen(true);
        }
      } catch (err) {
        console.error('Failed to load existing image for cropping:', err);
      }
    }
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setSelectedImageBlob(null);
    setHasRemovedExistingImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'اسم الكتاب مطلوب';
    }
    if (!publisher.trim()) {
      errs.publisher = 'دار النشر أو العارض مطلوب';
    }
    if (!stand.trim()) {
      errs.stand = 'رقم الجناح مطلوب';
    }
    if (price && (isNaN(Number(price)) || Number(price) < 0)) {
      errs.price = 'يرجى إدخال سعر صحيح بالدينار';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const now = Date.now();
      const bookId = bookToEdit ? bookToEdit.id : crypto.randomUUID();
      let coverImageId = bookToEdit?.coverImageId;

      if (hasRemovedExistingImage && coverImageId) {
        await db.coverImages.delete(coverImageId);
        coverImageId = undefined;
      }

      if (selectedImageBlob) {
        // Generate new image record
        const newImgId = crypto.randomUUID();
        const thumbnail = await generateThumbnail(selectedImageBlob);
        
        await db.coverImages.put({
          id: newImgId,
          bookId,
          blob: selectedImageBlob,
          thumbnailBlob: thumbnail,
          mimeType: 'image/jpeg',
          sizeBytes: selectedImageBlob.size,
          createdAt: now,
        });

        // Clean up old image if replacing
        if (coverImageId && coverImageId !== newImgId) {
          await db.coverImages.delete(coverImageId);
        }
        coverImageId = newImgId;
      }

      const parsedPrice = price.trim() === '' ? null : Math.max(0, Math.round(Number(price)));

      const bookData: Book = {
        id: bookId,
        title: title.trim(),
        author: author.trim() || undefined,
        publisher: publisher.trim(),
        hall: hall.trim() || undefined,
        stand: stand.trim(),
        priceDZD: parsedPrice,
        status,
        notes: notes.trim() || undefined,
        coverImageId,
        createdAt: bookToEdit ? bookToEdit.createdAt : now,
        updatedAt: now,
      };

      await db.books.put(bookData);

      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Error saving book:', err);
      alert('حدث خطأ أثناء حفظ الكتاب، يرجى المحاولة ثانية.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 ease-out">
      <div
        className="w-full max-w-md bg-[#FAF6F0] rounded-t-[32px] sm:rounded-[32px] shadow-lg border border-white/80 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 ease-out"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-black/5 shrink-0">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-black/5 hover:bg-black/[0.08] flex items-center justify-center text-sila-text active:scale-90 transition-transform duration-100 ease-out"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-bold text-sila-text font-arabic">
            {bookToEdit ? 'تعديل كتاب' : 'إضافة كتاب'}
          </h2>

          {/* Symmetrical spacing */}
          <div className="w-11 h-11" />
        </div>

        {/* Scrollable Form Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Cover Photo Upload Card */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              {imagePreviewUrl || (!hasRemovedExistingImage && bookToEdit?.coverImageId) ? (
                <div className="relative">
                  <BookCover
                    size="lg"
                    title={title || 'غلاف الكتاب'}
                    coverImageId={hasRemovedExistingImage ? undefined : bookToEdit?.coverImageId}
                    previewUrl={imagePreviewUrl}
                    className="rounded-2xl shadow-sm border-2 border-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="حذف الصورة"
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-sila-red text-white flex items-center justify-center shadow-sm active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-32 rounded-2xl border-2 border-dashed border-[#D5C7B7] bg-white/50 hover:bg-white/65 flex flex-col items-center justify-center gap-1.5 text-sila-muted transition-all active:scale-95 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-sila-amberSoft flex items-center justify-center text-sila-amber">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-sila-muted">
                    صورة الغلاف
                  </span>
                </button>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            {(imagePreviewUrl || (!hasRemovedExistingImage && bookToEdit?.coverImageId)) && (
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleOpenCropForCurrent}
                  className="text-xs text-sila-amber font-semibold hover:opacity-85 flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>قص وتعديل</span>
                </button>
                <span className="text-stone-300">•</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-sila-muted font-semibold hover:text-sila-text active:scale-95 transition-all"
                >
                  تغيير الصورة
                </button>
              </div>
            )}
          </div>

          {/* Book Title (Required) */}
          <div>
            <label className="block text-xs font-semibold text-sila-text mb-1">
              اسم الكتاب <span className="text-sila-red">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="مثل: الإنسان يبحث عن المعنى"
                className={`w-full bg-white/75 border ${
                  errors.title ? 'border-sila-red' : 'border-[#E0D5C7]'
                } focus:border-sila-amber focus:ring-2 focus:ring-sila-amber/20 rounded-xl px-3.5 py-2.5 text-sm text-sila-text outline-none transition-all placeholder:text-sila-muted/60`}
              />
              <BookOpen className="w-4 h-4 text-sila-muted/60 absolute left-3 pointer-events-none" />
            </div>
            {errors.title && (
              <p className="text-[11px] text-sila-red mt-1 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Author (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-sila-text mb-1">
              المؤلف
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="فيكتور فرانكل"
                className="w-full bg-white/75 border border-[#E0D5C7] focus:border-sila-amber focus:ring-2 focus:ring-sila-amber/20 rounded-xl px-3.5 py-2.5 text-sm text-sila-text outline-none transition-all placeholder:text-sila-muted/60"
              />
              <User className="w-4 h-4 text-sila-muted/60 absolute left-3 pointer-events-none" />
            </div>
          </div>

          {/* Publisher / Exhibitor (Required) */}
          <div>
            <label className="block text-xs font-semibold text-sila-text mb-1">
              دار النشر / العارض <span className="text-sila-red">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={publisher}
                onChange={(e) => {
                  setPublisher(e.target.value);
                  if (errors.publisher) setErrors((prev) => ({ ...prev, publisher: '' }));
                }}
                placeholder="دار النشر أو اسم العارض"
                className={`w-full bg-white/75 border ${
                  errors.publisher ? 'border-sila-red' : 'border-[#E0D5C7]'
                } focus:border-sila-amber focus:ring-2 focus:ring-sila-amber/20 rounded-xl px-3.5 py-2.5 text-sm text-sila-text outline-none transition-all placeholder:text-sila-muted/60`}
              />
              <Building2 className="w-4 h-4 text-sila-muted/60 absolute left-3 pointer-events-none" />
            </div>
            {errors.publisher && (
              <p className="text-[11px] text-sila-red mt-1 font-medium">{errors.publisher}</p>
            )}
          </div>

          {/* Hall & Stand Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-sila-text mb-1">
                القاعة
              </label>
              <div className="relative flex items-center">
                <select
                  value={hall}
                  onChange={(e) => setHall(e.target.value)}
                  className="w-full appearance-none bg-white/75 border border-[#E0D5C7] focus:border-sila-amber focus:ring-2 focus:ring-sila-amber/20 rounded-xl pr-3.5 pl-9 py-2.5 text-xs text-sila-text outline-none transition-all cursor-pointer"
                >
                  {HALL_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-sila-muted/70 absolute left-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sila-text mb-1">
                الجناح <span className="text-sila-red">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={stand}
                  onChange={(e) => {
                    setStand(e.target.value);
                    if (errors.stand) setErrors((prev) => ({ ...prev, stand: '' }));
                  }}
                  placeholder="B12"
                  className={`w-full bg-white/75 border ${
                    errors.stand ? 'border-sila-red' : 'border-[#E0D5C7]'
                  } focus:border-sila-amber focus:ring-2 focus:ring-sila-amber/20 rounded-xl px-3 py-2.5 text-sm text-sila-text outline-none transition-all placeholder:text-sila-muted/60`}
                />
                <MapPin className="w-4 h-4 text-sila-muted/60 absolute left-3 pointer-events-none" />
              </div>
              {errors.stand && (
                <p className="text-[11px] text-sila-red mt-1 font-medium">{errors.stand}</p>
              )}
            </div>
          </div>

          {/* Price in DZD */}
          <div>
            <label className="block text-xs font-semibold text-sila-text mb-1">
              السعر (دج)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="50"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                }}
                placeholder="1800"
                className={`w-full bg-white/75 border ${
                  errors.price ? 'border-sila-red' : 'border-[#E0D5C7]'
                } focus:border-sila-amber focus:ring-2 focus:ring-sila-amber/20 rounded-xl px-3.5 py-2.5 text-sm text-sila-text outline-none transition-all placeholder:text-sila-muted/60`}
              />
              <Tag className="w-4 h-4 text-sila-muted/60 absolute left-3 pointer-events-none" />
            </div>
            {errors.price && (
              <p className="text-[11px] text-sila-red mt-1 font-medium">{errors.price}</p>
            )}
          </div>

          {/* Book Status Selector (3 Pills) */}
          <div>
            <label className="block text-xs font-semibold text-sila-text mb-1.5">
              حالة الكتاب
            </label>
            <div className="grid grid-cols-3 gap-2 bg-black/[0.04] p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setStatus('wanted')}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold active:scale-95 transition-transform duration-100 ease-out select-none ${
                  status === 'wanted'
                    ? 'bg-gradient-to-r from-sila-amber to-sila-amberLight text-white shadow-sm'
                    : 'text-sila-muted hover:text-sila-text'
                }`}
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                أريد شراءه
              </button>

              <button
                type="button"
                onClick={() => setStatus('purchased')}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold active:scale-95 transition-transform duration-100 ease-out select-none ${
                  status === 'purchased'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-sm'
                    : 'text-sila-muted hover:text-sila-text'
                }`}
              >
                <Check className="w-4 h-4 shrink-0" />
                تم شراؤه
              </button>

              <button
                type="button"
                onClick={() => setStatus('comparing')}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold active:scale-95 transition-transform duration-100 ease-out select-none ${
                  status === 'comparing'
                    ? 'bg-stone-700 text-white shadow-sm'
                    : 'text-sila-muted hover:text-sila-text'
                }`}
              >
                <Bookmark className="w-4 h-4 shrink-0" />
                للمقارنة
              </button>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-sila-text mb-1">
              ملاحظات (اختياري)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="الطبعة، عدد الصفحات، التخفيض، أرقام هواتف العارض..."
              className="w-full bg-white/75 border border-[#E0D5C7] focus:border-sila-amber focus:ring-2 focus:ring-sila-amber/20 rounded-xl px-3.5 py-2 text-xs text-sila-text outline-none transition-all placeholder:text-sila-muted/60 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer Actions (Fixed at bottom) */}
        <div className="p-4 bg-white/90 border-t border-black/5 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 min-h-[48px] bg-gradient-to-r from-sila-amber to-sila-amberLight text-white py-3 px-5 rounded-2xl font-bold text-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'جارٍ الحفظ...' : 'حفظ الكتاب'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-6 py-3 rounded-2xl text-xs font-bold text-sila-muted hover:text-sila-text hover:bg-black/[0.02] active:scale-[0.98] transition-transform duration-100 ease-out"
          >
            إلغاء
          </button>
        </div>
      </div>

      {/* Built-in Image Crop & Edit Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageFile={pendingCropFile}
        onClose={() => {
          setIsCropModalOpen(false);
          setPendingCropFile(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
