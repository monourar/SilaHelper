import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GlassCard } from './GlassCard';
import { compressImage } from '../utils/image';
import { RotateCw, ZoomIn, ZoomOut, Check, X, Crop, RefreshCcw } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageFile: File | Blob | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number; // width / height, default 3/4 for book cover
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageFile,
  onClose,
  onCropComplete,
  aspectRatio = 3 / 4, // standard book portrait
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  // Crop frame size in UI
  const CROP_WIDTH = 260;
  const CROP_HEIGHT = Math.round(CROP_WIDTH / aspectRatio); // ~346px

  // Load image when file changes
  useEffect(() => {
    if (!imageFile) {
      setImageSrc(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageSrc(url);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // Compute effective dimensions based on rotation
  const isRotatedSideways = rotation === 90 || rotation === 270;
  const effectiveWidth = isRotatedSideways ? naturalSize.height : naturalSize.width;
  const effectiveHeight = isRotatedSideways ? naturalSize.width : naturalSize.height;

  // Minimum scale so the crop box is completely covered
  const minScale = naturalSize.width > 0 && naturalSize.height > 0
    ? Math.max(CROP_WIDTH / effectiveWidth, CROP_HEIGHT / effectiveHeight)
    : 1;

  const currentScale = minScale * zoom;

  // Clamp pan offsets so image stays inside crop box
  const clampPan = useCallback((x: number, y: number, z: number, rot: number) => {
    const sideways = rot === 90 || rot === 270;
    const ew = sideways ? naturalSize.height : naturalSize.width;
    const eh = sideways ? naturalSize.width : naturalSize.height;
    if (ew === 0 || eh === 0) return { x: 0, y: 0 };

    const scale = Math.max(CROP_WIDTH / ew, CROP_HEIGHT / eh) * z;
    const maxPanX = Math.max(0, (ew * scale - CROP_WIDTH) / 2);
    const maxPanY = Math.max(0, (eh * scale - CROP_HEIGHT) / 2);

    return {
      x: Math.min(maxPanX, Math.max(-maxPanX, x)),
      y: Math.min(maxPanY, Math.max(-maxPanY, y)),
    };
  }, [CROP_WIDTH, CROP_HEIGHT, naturalSize.width, naturalSize.height]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newX = dragStartRef.current.panX + dx;
    const newY = dragStartRef.current.panY + dy;
    setPan(clampPan(newX, newY, zoom, rotation));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Touch Pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      initialTouchDistanceRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = dist / initialTouchDistanceRef.current;
      const newZoom = Math.min(3, Math.max(1, initialZoomRef.current * ratio));
      setZoom(newZoom);
      setPan((prev) => clampPan(prev.x, prev.y, newZoom, rotation));
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistanceRef.current = null;
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    setPan(clampPan(pan.x, pan.y, zoom, nextRot));
  };

  // Reset
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Execute crop onto high-res canvas, then compress
  const handleCropAndSave = async () => {
    if (!imageSrc || naturalSize.width === 0 || naturalSize.height === 0) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageSrc;
      });

      // Target canvas dimensions (standard high-res portrait book cover: 900 x 1200)
      const targetWidth = 900;
      const targetHeight = Math.round(targetWidth / aspectRatio); // 1200

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Scaling factor from UI crop box to target high-res canvas
      const scaleToTarget = targetWidth / CROP_WIDTH;

      ctx.save();
      // Move to target center
      ctx.translate(targetWidth / 2, targetHeight / 2);
      // Apply user pan scaled to target
      ctx.translate(pan.x * scaleToTarget, pan.y * scaleToTarget);
      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);
      // Apply scale (currentScale * scaleToTarget)
      const renderScale = currentScale * scaleToTarget;
      ctx.scale(renderScale, renderScale);
      // Draw centered image
      ctx.drawImage(img, -naturalSize.width / 2, -naturalSize.height / 2, naturalSize.width, naturalSize.height);
      ctx.restore();

      // Convert canvas to blob
      const rawBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to generate cropped image'));
          },
          'image/jpeg',
          0.92
        );
      });

      // Compress to optimal storage size (~150-250KB)
      const optimizedBlob = await compressImage(rawBlob, 900, 1200, 0.82);

      onCropComplete(optimizedBlob);
      onClose();
    } catch (err) {
      console.error('Cropping error:', err);
      alert('حدث خطأ أثناء قص الصورة، يرجى إعادة المحاولة.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageFile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <GlassCard
        variant="elevated"
        className="w-full max-w-md bg-[#1C1814]/95 text-stone-100 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-sila-amber" />
            <h3 className="font-bold text-sm text-stone-100 font-arabic">
              قص وتعديل غلاف الكتاب
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 active:scale-95 transition-all"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Workspace */}
        <div className="relative flex-1 flex items-center justify-center bg-black/60 p-4 overflow-hidden min-h-[360px]">
          {/* Crop Boundary Container */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ width: `${CROP_WIDTH}px`, height: `${CROP_HEIGHT}px` }}
            className="relative overflow-hidden rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing border-2 border-amber-400/90 ring-4 ring-black/60 touch-none shrink-0"
          >
            {/* The Image undergoing transform */}
            {imageSrc && (
              <img
                src={imageSrc}
                alt="معاينة القص"
                draggable={false}
                style={{
                  width: `${naturalSize.width}px`,
                  height: `${naturalSize.height}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transform: `translate(calc(-50% + ${CROP_WIDTH / 2 + pan.x}px), calc(-50% + ${CROP_HEIGHT / 2 + pan.y}px)) rotate(${rotation}deg) scale(${currentScale})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
                className="absolute top-0 left-0 will-change-transform"
              />
            )}

            {/* Rule-of-thirds grid overlay */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            {/* Corner guidelines */}
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
          </div>

          {/* Hint Overlay */}
          <div className="absolute bottom-2 inset-x-0 mx-auto text-center pointer-events-none">
            <span className="text-[11px] font-medium bg-black/70 backdrop-blur-md text-stone-300 px-3 py-1 rounded-full border border-white/10">
              اسحب لتحريك الغلاف · قرّب بأصبعين أو استخدم الشريط بالأسفل
            </span>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 bg-[#231F1B] border-t border-white/10 space-y-3 shrink-0">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newZ = Math.max(1, zoom - 0.2);
                setZoom(newZ);
                setPan(clampPan(pan.x, pan.y, newZ, rotation));
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-stone-300 active:scale-95"
              title="تصغير"
              aria-label="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => {
                const newZ = parseFloat(e.target.value);
                setZoom(newZ);
                setPan(clampPan(pan.x, pan.y, newZ, rotation));
              }}
              className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg appearance-none"
              aria-label="مستوى التقريب"
            />

            <button
              onClick={() => {
                const newZ = Math.min(3, zoom + 0.2);
                setZoom(newZ);
                setPan(clampPan(pan.x, pan.y, newZ, rotation));
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-stone-300 active:scale-95"
              title="تكبير"
              aria-label="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Action Tools Row */}
          <div className="flex items-center justify-between pt-1 gap-2">
            <div className="flex items-center gap-1.5">
              {/* Rotate 90deg */}
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
                title="تدوير 90 درجة"
              >
                <RotateCw className="w-3.5 h-3.5 text-sila-amber" />
                <span>تدوير 90°</span>
              </button>

              {/* Reset button */}
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
                title="إعادة تعيين"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            </div>

            {/* Confirm & Cancel */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-stone-200 transition-colors"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleCropAndSave}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sila-amber to-sila-amberLight text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 hover:opacity-95 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isProcessing ? 'جارٍ القص والضغط...' : 'تأكيد وقص الغلاف'}</span>
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
