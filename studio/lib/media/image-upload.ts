// Shared upload constraints and client-side optimizer between the browser
// uploader (ItemImagesPanel, which uploads directly to Supabase Storage) and
// the registerUploadedItemImage Server Action (which only writes DB metadata).
// Bucket/MIME/size constants must stay in sync with the studio-product-images
// bucket config Pablo set up manually.

export const IMAGE_STORAGE_BUCKET = 'studio-product-images'
export const IMAGE_MAX_SIZE_BYTES = 12 * 1024 * 1024
export const IMAGE_ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// ── Client-side optimization (S026A UX pass) ─────────────────────────────────
// Runs only in the browser (ItemImagesPanel). Converts to WebP + downscales
// before upload so Storage never receives an unnecessarily heavy original.
// Never throws: any decode/encode failure falls back to the original, already
// MIME/size-validated file so the upload flow never breaks.

const MAX_DIMENSION_PX = 2200
const WEBP_QUALITY = 0.86

export interface OptimizedImageResult {
  file: File
  originalSize: number
  optimizedSize: number
  originalMime: string
  finalMime: string
  wasOptimized: boolean
}

export function getImageExtensionFromMime(mime: string): string {
  return IMAGE_ALLOWED_MIME[mime] ?? 'jpg'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Only checks the MIME type of the source file — size is enforced on the
// FINAL (optimized) upload, since the whole point of optimizeImageFile is to
// shrink files that may start out larger than the bucket's max.
export function validateImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!IMAGE_ALLOWED_MIME[file.type]) {
    return { ok: false, error: `Tipo no permitido: ${file.type || file.name}. Solo JPG/PNG/WEBP.` }
  }
  return { ok: true }
}

export async function optimizeImageFile(file: File): Promise<OptimizedImageResult> {
  const originalSize = file.size
  const originalMime = file.type
  const fallback: OptimizedImageResult = {
    file,
    originalSize,
    optimizedSize: originalSize,
    originalMime,
    finalMime: originalMime,
    wasOptimized: false,
  }

  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return fallback
  }

  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    // Never upscale — only shrink images above the max side.
    const scale = Math.min(1, MAX_DIMENSION_PX / Math.max(width, height))
    const targetWidth = Math.max(1, Math.round(width * scale))
    const targetHeight = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close?.()
      return fallback
    }
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', WEBP_QUALITY)
    })

    // Some browsers silently fall back to PNG when they don't support WebP
    // encoding — treat anything that isn't actually image/webp as unsupported.
    if (!blob || blob.type !== 'image/webp') {
      return fallback
    }

    const optimizedFile = new File([blob], file.name, { type: 'image/webp' })

    // Guard against the rare case where "optimizing" makes the file bigger
    // (already-tiny/already-compressed images) — keep the smaller original.
    if (optimizedFile.size >= originalSize) {
      return fallback
    }

    return {
      file: optimizedFile,
      originalSize,
      optimizedSize: optimizedFile.size,
      originalMime,
      finalMime: 'image/webp',
      wasOptimized: true,
    }
  } catch {
    return fallback
  }
}
