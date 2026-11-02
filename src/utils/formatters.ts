/**
 * Formats Algerian Dinars (DZD) nicely with localized thousands separators.
 */
export function formatDZD(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'غير محدد';
  }
  return `${new Intl.NumberFormat('fr-DZ').format(amount)} دج`;
}

/**
 * Formats a plain number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-DZ').format(value);
}

/**
 * Formats bytes into human-readable size (e.g. 1.2 MB)
 */
export function formatStorageSize(bytes: number): string {
  if (bytes <= 0) return '0 كيلوبايت';
  const units = ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0);
  return `${size} ${units[i] || 'بايت'}`;
}

/**
 * Formats a timestamp into an Arabic friendly relative or standard date
 */
export function formatDateArabic(timestamp: number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;

  return date.toLocaleDateString('ar-DZ', {
    month: 'short',
    day: 'numeric'
  });
}
