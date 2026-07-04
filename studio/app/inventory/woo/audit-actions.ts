'use server'

// WOO_WRITE_SYNC foundation — audit-page actions. One product per action.
//
// Only ONE action lives here: linkWooProductToStudio, which creates a Studio
// ficha for a web product that has none (Supabase-only write; the web is not
// touched). This is how the whole Woo catalog — including sold-out shirts —
// gets absorbed into the single inventory, one confirmed product at a time.
// No bulk import.
//
// There is deliberately NO Woo write on this page: every Woo write must leave
// a visible log in Studio (house rule), and item_lifecycle_events requires an
// item. Trashing a draft therefore always goes through its ficha — for an
// unlinked draft, link it first and trash from the ficha (two confirmations,
// everything logged).

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { fetchWooProductDetail } from '@/lib/wc/product-catalog'
import { mapWooStatusToMirror } from '@/lib/inventory/woo-diff'

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

  // Already linked? The DB unique constraint on wc_product_id also protects this,
  // but a readable message beats a constraint error.
  const { data: existing } = await supabase
    .from('inventory_items')
    .select('id, referencia')
    .eq('wc_product_id', productId)
    .limit(1)
  if (existing && existing.length > 0) {
    return { ok: false, error: `Este producto ya está vinculado a «${existing[0].referencia}».` }
  }

  const liveResult = await fetchWooProductDetail(productId)
  if (!liveResult.ok) {
    return { ok: false, error: `No se pudo leer el producto: ${liveResult.message}` }
  }
  const live = liveResult.product
  if (live.status === 'trash') {
    return { ok: false, error: 'El producto está en la papelera de la web; restáuralo antes de vincularlo.' }
  }

  const referencia = live.name.trim().slice(0, 200) || `Producto web ${live.id}`
  const now = new Date().toISOString()

  const { data: inserted, error: insertError } = await supabase
    .from('inventory_items')
    .insert({
      workspace_id: workspace.id,
      owner_id: user.id,
      referencia,
      item_type: 'football_shirt',
      status: live.status === 'publish' || live.status === 'private' ? 'publicada_web' : 'borrador_web',
      // Obligatorios del schema sin dato real en la web: se rellenan con
      // placeholders y quedan marcados en notas para que Pablo los complete.
      fecha_compra: now.slice(0, 10),
      coste: 0,
      precio_publicado_web: live.regularPrice ?? live.price,
      photo_status: 'sin_hacer',
      wc_product_id: live.id,
      wc_status: mapWooStatusToMirror(live.status),
      wc_last_sync_at: now,
      notas_internas:
        'Ficha creada desde el catálogo web. Pendiente de completar: coste real, fecha de compra real, talla y detalles de la camiseta.',
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    // The pre-check above can race with another tab; translate the unique
    // constraint on wc_product_id into the same friendly message.
    const friendly = insertError?.message?.includes('duplicate key')
      ? 'Este producto ya está vinculado a otra ficha.'
      : insertError?.message ?? 'error desconocido'
    return { ok: false, error: `No se pudo crear la ficha: ${friendly}` }
  }

  // Every football_shirt item MUST have its 1:1 details row — the edit form
  // updates it and fails (with a partial write) if it is missing. The web has
  // no talla/condición/equipo data, so NOT NULL fields start empty and the
  // form forces Pablo to fill them on first edit.
  const { error: detailsError } = await supabase.from('football_shirt_details').insert({
    item_id: inserted.id,
    workspace_id: workspace.id,
    owner_id: user.id,
    equipo: '',
    temporada: '',
    talla: '',
    condicion: '',
  })
  if (detailsError) {
    // Without its details row the ficha is unusable (edit always fails) —
    // roll the item back instead of leaving a broken record behind.
    await supabase.from('inventory_items').delete().eq('id', inserted.id).eq('owner_id', user.id)
    return { ok: false, error: `No se pudo crear la ficha completa: ${detailsError.message}` }
  }

  const { error: eventError } = await supabase.from('item_lifecycle_events').insert({
    item_id: inserted.id,
    workspace_id: workspace.id,
    owner_id: user.id,
    event_type: 'created_from_woo',
    to_status: live.status === 'publish' || live.status === 'private' ? 'publicada_web' : 'borrador_web',
    triggered_by: 'pablo',
    payload: {
      wc_product_id: live.id,
      estado_web: live.status,
      precio_web: live.regularPrice ?? live.price,
    },
    notes: 'Ficha creada desde el catálogo web (vincular producto existente). La web no se ha modificado.',
  })
  if (eventError) {
    console.warn(`[woo-audit] created_from_woo event failed for item ${inserted.id}: ${eventError.message}`)
  }

  revalidatePath('/inventory')
  revalidatePath('/inventory/woo')
  return {
    ok: true,
    message: `Ficha creada y vinculada: «${referencia}». Completa coste y detalles desde la ficha.`,
    itemId: inserted.id,
  }
}

