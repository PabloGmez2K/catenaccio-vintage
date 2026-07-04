'use server'

// WOO_WRITE_SYNC foundation - audit-page actions. One product per action.
//
// Only ONE action lives here: linkWooProductToStudio, which creates a Studio
// ficha for a web product that has none (Supabase-only write; the web is not
// touched). This is how the Woo catalog gets absorbed into the single inventory,
// one confirmed product at a time. No bulk import.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { buildWooHydration } from '@/lib/inventory/woo-hydration'
import { fetchWooProductDetail } from '@/lib/wc/product-catalog'
import { mapWooStatusToMirror } from '@/lib/inventory/woo-diff'
import { loadCachedTerms } from '@/lib/wc/term-cache'
import { loadCachedCategories } from '@/lib/wc/category-cache'

export type WooAuditResult =
  | { ok: true; message: string; itemId?: string }
  | { ok: false; error: string }

export async function linkWooProductToStudio(productId: number): Promise<WooAuditResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()
  if (wsError || !workspace) return { ok: false, error: 'Workspace no encontrado.' }

  const { data: existing } = await supabase
    .from('inventory_items')
    .select('id, referencia')
    .eq('wc_product_id', productId)
    .limit(1)
  if (existing && existing.length > 0) {
    return { ok: false, error: `Este producto ya esta vinculado a "${existing[0].referencia}".` }
  }

  const liveResult = await fetchWooProductDetail(productId)
  if (!liveResult.ok) {
    return { ok: false, error: `No se pudo leer el producto: ${liveResult.message}` }
  }
  const live = liveResult.product
  if (live.status === 'trash') {
    return { ok: false, error: 'El producto esta en la papelera de la web; restauralo antes de vincularlo.' }
  }

  const now = new Date().toISOString()
  const [terms, categories] = await Promise.all([
    loadCachedTerms(supabase, ['pa_liga', 'pa_equipo', 'pa_ano', 'pa_jugador']),
    loadCachedCategories(supabase),
  ])
  const hydrated = buildWooHydration(live, terms, categories, now)

  const { data: inserted, error: insertError } = await supabase
    .from('inventory_items')
    .insert({
      workspace_id: workspace.id,
      owner_id: user.id,
      referencia: hydrated.referencia,
      item_type: 'football_shirt',
      status: hydrated.status,
      // The schema requires cost/date. They are technical placeholders on Woo import;
      // UI copy treats this cost as pending, not as real margin input.
      fecha_compra: now.slice(0, 10),
      coste: 0,
      precio_publicado_web: hydrated.webPrice,
      photo_status: 'sin_hacer',
      wc_product_id: live.id,
      wc_status: mapWooStatusToMirror(live.status),
      wc_last_sync_at: now,
      wc_payload_snapshot: hydrated.snapshot,
      notas_internas: hydrated.notes,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    const friendly = insertError?.message?.includes('duplicate key')
      ? 'Este producto ya esta vinculado a otra ficha.'
      : insertError?.message ?? 'error desconocido'
    return { ok: false, error: `No se pudo crear la ficha: ${friendly}` }
  }

  const { error: detailsError } = await supabase.from('football_shirt_details').insert({
    item_id: inserted.id,
    workspace_id: workspace.id,
    owner_id: user.id,
    ...hydrated.details,
  })
  if (detailsError) {
    await supabase.from('inventory_items').delete().eq('id', inserted.id).eq('owner_id', user.id)
    return { ok: false, error: `No se pudo crear la ficha completa: ${detailsError.message}` }
  }

  const { error: eventError } = await supabase.from('item_lifecycle_events').insert({
    item_id: inserted.id,
    workspace_id: workspace.id,
    owner_id: user.id,
    event_type: 'created_from_woo',
    to_status: hydrated.status,
    triggered_by: 'pablo',
    payload: hydrated.eventPayload,
    notes: 'Ficha creada desde el catalogo web (vincular producto existente). La web no se ha modificado.',
  })
  if (eventError) {
    console.warn(`[woo-audit] created_from_woo event failed for item ${inserted.id}: ${eventError.message}`)
  }

  revalidatePath('/inventory')
  revalidatePath('/inventory/woo')
  return {
    ok: true,
    message:
      live.status === 'publish' && live.stockStatus === 'outofstock'
        ? `Ficha creada y vinculada: "${hydrated.referencia}". La web esta agotada; revisa si debe quedar vendida o reponerse.`
        : `Ficha creada y vinculada: "${hydrated.referencia}". Completa coste y revisa los datos importados.`,
    itemId: inserted.id,
  }
}
