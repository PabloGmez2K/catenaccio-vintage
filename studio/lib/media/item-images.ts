// S026B — Studio image lookup for the Woo draft bridge.
// Read-only helper: loads media_assets ordered by sort_order, filtered to rows
// with a usable public_url. The bridge is the only caller; UI panels keep
// using listItemImages (image-actions.ts) for the full ItemImagesPanel view.

import type { createClient } from '@/lib/supabase/server'

export interface BridgeMediaAsset {
  id: string
  publicUrl: string
  filename: string
  sortOrder: number
  wcMediaId: number | null
  uploadStatus: string
}

// SHADOW_FIRST gate — default OFF. Pablo enables locally in .env.local (never
// touched by the agent) to test the real attach flow before it becomes default.
export function isWcImageAttachEnabled(): boolean {
  return process.env.STUDIO_WC_ATTACH_IMAGES_ENABLED === 'true'
}

export async function loadItemImagesForBridge(
  supabase: Awaited<ReturnType<typeof createClient>>,
  itemId: string
): Promise<BridgeMediaAsset[]> {
  const { data } = await supabase
    .from('media_assets')
    .select('id, public_url, filename, sort_order, wc_media_id, upload_status')
    .eq('item_id', itemId)
    .order('sort_order', { ascending: true })

  return (data ?? [])
    .filter((row) => !!row.public_url)
    .map((row) => ({
      id: row.id as string,
      publicUrl: row.public_url as string,
      filename: row.filename as string,
      sortOrder: row.sort_order as number,
      wcMediaId: row.wc_media_id as number | null,
      uploadStatus: row.upload_status as string,
    }))
}
