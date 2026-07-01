// Shared upload constraints between the client uploader (ItemImagesPanel, which
// uploads directly to Supabase Storage from the browser) and the
// registerUploadedItemImage Server Action (which only writes DB metadata).
// Must stay in sync with the studio-product-images bucket config Pablo set up
// manually (MIME allow-list, 12 MB max).

export const IMAGE_STORAGE_BUCKET = 'studio-product-images'
export const IMAGE_MAX_SIZE_BYTES = 12 * 1024 * 1024
export const IMAGE_ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
