'use server'

import { revalidatePath } from 'next/cache'
import { createWcDraftForItem } from '@/lib/wc/bridge'

export type WcDraftResult =
  | { ok: true; wcProductId: number; imagesAttached?: { attached: number; total: number } }
  | { ok: false; error: string; code: string }

// Creates a WooCommerce draft product for the given item.
// DRAFT_ONLY — status=draft is hardcoded in the bridge; this action never accepts a status param.
// Idempotent — bridge stops immediately if wc_product_id is already set.
export async function createWcDraft(itemId: string): Promise<WcDraftResult> {
  const result = await createWcDraftForItem(itemId)

  if (result.ok) {
    revalidatePath(`/inventory/${itemId}`)
  }

  return result
}
