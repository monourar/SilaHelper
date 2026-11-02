/**
 * Normalizes Arabic text for flexible, accent-insensitive and spelling-variant search.
 */
export function normalizeArabic(text: string | null | undefined): string {
  if (!text) return '';

  return text
    // Remove Arabic diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize Alef variants (أ, إ, آ, ٱ) -> ا
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbuta and Haa: ة -> ه
    .replace(/ة/g, 'ه')
    // Normalize Yaa variants: ى -> ي
    .replace(/ى/g, 'ي')
    // Normalize Persian/Urdu Kaf and Yeh if entered
    .replace(/ك/g, 'ك')
    .replace(/ي/g, 'ي')
    // Trim extra spaces and lower-case Latin characters if mixed
    .trim()
    .toLowerCase();
}

/**
 * Checks if search query matches target text using Arabic normalization
 */
export function matchesArabic(target: string | null | undefined, query: string): boolean {
  if (!target || !query) return false;
  const normalizedTarget = normalizeArabic(target);
  const normalizedQuery = normalizeArabic(query);
  return normalizedTarget.includes(normalizedQuery);
}
