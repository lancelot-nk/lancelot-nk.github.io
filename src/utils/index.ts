/**
 * Converts a display label (e.g., "Pub & Grants") 
 * into a URL-friendly slug (e.g., "/pub-grants")
 */
export function createPageUrl(pageName: string): string {
  return '/' + pageName
    .toLowerCase()
    .replace(/&/g, '')           // Remove ampersands
    .replace(/[^\w\s-]/g, '')    // Remove special characters
    .trim()                      // Remove leading/trailing spaces
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/-+/g, '-');        // Replace multiple hyphens with a single one
}