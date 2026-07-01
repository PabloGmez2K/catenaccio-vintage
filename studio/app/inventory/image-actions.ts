'use server'

// S026A — image pipeline: local upload -> Supabase Storage + media_assets metadata.
// Supabase only (Storage + DB). NO WordPress, NO WooCommerce, NO Woo media, NO publish.
// Reuses the media_assets table (S019 design, applied S020D) — see
// docs/studio/STUDIO_IMAGE_PIPELINE_SCHEMA.sql for the additive columns this needs.
//
// S026A_FIX: the actual file upload happens client-side, directly against Supabase
// Storage (see ItemImagesPanel.tsx) — Server Actions have a 1 MB request body limit
// by default and are the wrong transport for image files. This module only ever
// receives small JSON metadata after the browser has already uploaded the object.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { MediaAsset } from '@/lib/types'
import { IMAGE_STORAGE_BUCKET, IMAGE_MAX_SIZE_BYTES, IMAGE_ALLOWED_MIME } from '@/lib/media/image-upload'

export type ImageActionResult = { ok: true } | { ok: false; error: string }

async function requireOwnedItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  itemId: string,
  userId: string
): Promise<{ ok: true; workspaceId: string } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('workspace_id')
    .eq('id', itemId)
    .eq('owner_id', userId)
    .single()
  if (error || !data) return { ok: false, error: 'Item no encontrado o sin acceso.' }
  return { ok: true, workspaceId: data.workspace_id as string }
}

// ── registerUploadedItemImage ─────────────────────────────────────────────────
// Called once per file AFTER the browser has already uploaded the object directly
// to Supabase Storage (client owns the transport; this only persists metadata).

export type UploadedImageMetadata = {
  storagePath: string
  publicUrl: string
  filename: string
  mimeType: string
  sizeBytes: number
}

export async function registerUploadedItemImage(
  itemId: string,
  metadata: UploadedImageMetadata
): Promise<ImageActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  const owned = await requireOwnedItem(supabase, itemId, user.id)
  if (!owned.ok) return owned

  // Defense in depth: the path must live under this user's own item folder,
  // matching the Storage "own folder" RLS policy Pablo configured on the bucket.
  const expectedPrefix = `${user.id}/${itemId}/`
  if (!metadata.storagePath.startsWith(expectedPrefix)) {
    return { ok: false, error: 'Ruta de almacenamiento no válida para este item.' }
  }
  if (!IMAGE_ALLOWED_MIME[metadata.mimeType]) {
    return { ok: false, error: `Tipo no permitido: ${metadata.mimeType}. Solo JPG/PNG/WEBP.` }
  }
  if (metadata.sizeBytes > IMAGE_MAX_SIZE_BYTES) {
    return { ok: false, error: 'El archivo supera el tamaño máximo (12 MB).' }
  }

  const { data: existing } = await supabase
    .from('media_assets')
    .select('sort_order')
    .eq('item_id', itemId)
    .order('sort_order', { ascending: false })
    .limit(1)
  const nextSortOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { count: primaryCount } = await supabase
    .from('media_assets')
    .select('id', { count: 'exact', head: true })
    .eq('item_id', itemId)
    .eq('is_primary', true)
  const hasPrimary = (primaryCount ?? 0) > 0

  const { error: insertError } = await supabase.from('media_assets').insert({
    item_id: itemId,
    workspace_id: owned.workspaceId,
    owner_id: user.id,
    filename: metadata.filename,
    storage_bucket: IMAGE_STORAGE_BUCKET,
    storage_path: metadata.storagePath,
    public_url: metadata.publicUrl,
    mime_type: metadata.mimeType,
    size_bytes: metadata.sizeBytes,
    sort_order: nextSortOrder,
    is_primary: !hasPrimary,
    upload_status: 'uploaded_storage',
  })
  if (insertError) return { ok: false, error: insertError.message }

  revalidatePath(`/inventory/${itemId}`)
  return { ok: true }
}

// ── reorderItemImages ─────────────────────────────────────────────────────────
// Single source of truth for ordering: the image at index 0 is ALWAYS the
// primary photo (position-derived, no separate "mark as primary" action).
// Used both by drag-and-drop reordering and the ↑/↓ fallback buttons.

export async function reorderItemImages(
  itemId: string,
  orderedImageIds: string[]
): Promise<ImageActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  const owned = await requireOwnedItem(supabase, itemId, user.id)
  if (!owned.ok) return owned

  if (orderedImageIds.length === 0) return { ok: true }

  const { data: images, error: loadError } = await supabase
    .from('media_assets')
    .select('id')
    .eq('item_id', itemId)
    .eq('owner_id', user.id)
  if (loadError || !images) return { ok: false, error: loadError?.message ?? 'No se pudieron cargar las imágenes.' }

  // Defense in depth: the submitted order must be exactly the set of images
  // that actually belong to this item/owner — never trust the client's list blindly.
  const existingIds = images.map((img) => img.id as string)
  const sameSet =
    existingIds.length === orderedImageIds.length &&
    existingIds.every((id) => orderedImageIds.includes(id))
  if (!sameSet) {
    return { ok: false, error: 'El orden recibido no coincide con las imágenes del item.' }
  }

  for (let index = 0; index < orderedImageIds.length; index++) {
    const { error: updateError } = await supabase
      .from('media_assets')
      .update({ sort_order: index, is_primary: index === 0 })
      .eq('id', orderedImageIds[index])
      .eq('item_id', itemId)
      .eq('owner_id', user.id)
    if (updateError) return { ok: false, error: updateError.message }
  }

  revalidatePath(`/inventory/${itemId}`)
  return { ok: true }
}

// ── deleteItemImage ───────────────────────────────────────────────────────────

export async function deleteItemImage(itemId: string, imageId: string): Promise<ImageActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  const owned = await requireOwnedItem(supabase, itemId, user.id)
  if (!owned.ok) return owned

  const { data: image, error: loadError } = await supabase
    .from('media_assets')
    .select('storage_bucket, storage_path, is_primary')
    .eq('id', imageId)
    .eq('item_id', itemId)
    .eq('owner_id', user.id)
    .single()
  if (loadError || !image) return { ok: false, error: 'Imagen no encontrada.' }

  if (image.storage_bucket && image.storage_path) {
    const { error: removeError } = await supabase.storage
      .from(image.storage_bucket)
      .remove([image.storage_path])
    if (removeError) {
      console.warn(`[image-actions] storage removal failed for ${image.storage_path}: ${removeError.message}`)
    }
  }

  const { error: deleteError } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', imageId)
    .eq('item_id', itemId)
    .eq('owner_id', user.id)
  if (deleteError) return { ok: false, error: deleteError.message }

  // Promote the next image (lowest sort_order) to primary if the deleted one was primary.
  if (image.is_primary) {
    const { data: next } = await supabase
      .from('media_assets')
      .select('id')
      .eq('item_id', itemId)
      .eq('owner_id', user.id)
      .order('sort_order', { ascending: true })
      .limit(1)
    if (next && next.length > 0) {
      await supabase.from('media_assets').update({ is_primary: true }).eq('id', next[0].id)
    }
  }

  revalidatePath(`/inventory/${itemId}`)
  return { ok: true }
}

// ── listItemImages (server-side read helper for the detail page) ────────────

export async function listItemImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  itemId: string
): Promise<MediaAsset[]> {
  const { data } = await supabase
    .from('media_assets')
    .select('*')
    .eq('item_id', itemId)
    .order('sort_order', { ascending: true })
  return (data ?? []) as MediaAsset[]
}
