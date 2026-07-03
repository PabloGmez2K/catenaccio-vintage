'use server'

// STOCK_MANAGER foundation — local sale + manual Vinted tracking actions.
// Supabase-only writes, owner_id + RLS enforced, immutable audit trail.
// These actions NEVER touch WooCommerce: marking an item as sold does not change
// web stock, status or visibility — that stays manual in WP Admin on purpose.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SaleChannel, VintedStatus } from '@/lib/types'

export type SalesResult = { ok: true } | { ok: false; error: string }

const SALE_CHANNELS: SaleChannel[] = ['web', 'vinted', 'otro']
const VINTED_STATUSES: VintedStatus[] = [
  'no_aplica',
  'pendiente',
  'publicada',
  'vendida_vinted',
  'retirada',
]

export interface MarkSoldInput {
  canal: SaleChannel
  precioVendido: number
  fechaVenta: string // YYYY-MM-DD
  notas?: string | null
}

export async function markItemSold(itemId: string, input: MarkSoldInput): Promise<SalesResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  if (!SALE_CHANNELS.includes(input.canal)) {
    return { ok: false, error: 'Canal de venta no válido.' }
  }
  if (!Number.isFinite(input.precioVendido) || input.precioVendido < 0) {
    return { ok: false, error: 'El precio de venta debe ser un número mayor o igual que 0.' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.fechaVenta)) {
    return { ok: false, error: 'La fecha de venta no es válida.' }
  }

  const { data: item, error: loadError } = await supabase
    .from('inventory_items')
    .select('status, workspace_id, referencia')
    .eq('id', itemId)
    .eq('owner_id', user.id)
    .single()
  if (loadError || !item) return { ok: false, error: 'Item no encontrado o sin acceso.' }
  if (item.status === 'archivada') {
    return { ok: false, error: 'Esta camiseta está archivada. Restáurala antes de venderla.' }
  }

  const alreadySold = item.status === 'vendida'
  const notas = input.notas?.trim() || null

  const update: Record<string, unknown> = {
    status: 'vendida',
    canal_venta: input.canal,
    precio_vendido: input.precioVendido,
    fecha_venta: input.fechaVenta,
  }
  // Venta cerrada por Vinted → el tracking de Vinted pasa a vendida_vinted para que
  // los dos bloques no se contradigan. Solo local; no toca nada externo.
  if (input.canal === 'vinted') {
    update.vinted_status = 'vendida_vinted'
  }

  const { error: updateError } = await supabase
    .from('inventory_items')
    .update(update)
    .eq('id', itemId)
    .eq('owner_id', user.id)
  if (updateError) return { ok: false, error: updateError.message }

  // Las notas de venta viven en el audit trail (no hay columna dedicada y el evento
  // 'sold' es su sitio natural). Best-effort: la venta ya está registrada.
  const { error: eventError } = await supabase.from('item_lifecycle_events').insert({
    item_id: itemId,
    workspace_id: item.workspace_id,
    owner_id: user.id,
    event_type: alreadySold ? 'sale_updated' : 'sold',
    from_status: item.status,
    to_status: 'vendida',
    triggered_by: 'pablo',
    payload: {
      canal: input.canal,
      precio_vendido: input.precioVendido,
      fecha_venta: input.fechaVenta,
    },
    notes: notas,
  })
  if (eventError) {
    console.warn(`[sales] sold event failed for item ${itemId}: ${eventError.message}`)
  }

  revalidatePath('/inventory')
  revalidatePath(`/inventory/${itemId}`)
  return { ok: true }
}

export async function undoItemSale(itemId: string): Promise<SalesResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  const { data: item, error: loadError } = await supabase
    .from('inventory_items')
    .select('status, workspace_id')
    .eq('id', itemId)
    .eq('owner_id', user.id)
    .single()
  if (loadError || !item) return { ok: false, error: 'Item no encontrado o sin acceso.' }
  if (item.status !== 'vendida') return { ok: true } // nothing to undo

  // Same pattern as restoreItem: recover the pre-sale status from the audit trail.
  const { data: events } = await supabase
    .from('item_lifecycle_events')
    .select('from_status')
    .eq('item_id', itemId)
    .eq('event_type', 'sold')
    .eq('to_status', 'vendida')
    .order('created_at', { ascending: false })
    .limit(1)
  const priorStatus = events?.[0]?.from_status ?? 'comprada'

  const { error: updateError } = await supabase
    .from('inventory_items')
    .update({
      status: priorStatus,
      canal_venta: null,
      precio_vendido: null,
      fecha_venta: null,
    })
    .eq('id', itemId)
    .eq('owner_id', user.id)
  if (updateError) return { ok: false, error: updateError.message }

  const { error: eventError } = await supabase.from('item_lifecycle_events').insert({
    item_id: itemId,
    workspace_id: item.workspace_id,
    owner_id: user.id,
    event_type: 'sale_undone',
    from_status: 'vendida',
    to_status: priorStatus,
    triggered_by: 'pablo',
    notes: 'Venta deshecha desde la ficha. Los datos de venta se han limpiado.',
  })
  if (eventError) {
    console.warn(`[sales] sale_undone event failed for item ${itemId}: ${eventError.message}`)
  }

  revalidatePath('/inventory')
  revalidatePath(`/inventory/${itemId}`)
  return { ok: true }
}

export interface VintedTrackingInput {
  status: VintedStatus
  url: string | null
  price: number | null
  publishedAt: string | null // YYYY-MM-DD
  notes: string | null
}

export async function updateVintedTracking(
  itemId: string,
  input: VintedTrackingInput
): Promise<SalesResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  if (!VINTED_STATUSES.includes(input.status)) {
    return { ok: false, error: 'Estado de Vinted no válido.' }
  }
  const url = input.url?.trim() || null
  if (url && !/^https?:\/\//i.test(url)) {
    return { ok: false, error: 'La URL de Vinted debe empezar por http(s)://.' }
  }
  if (input.price != null && (!Number.isFinite(input.price) || input.price < 0)) {
    return { ok: false, error: 'El precio de Vinted debe ser un número mayor o igual que 0.' }
  }
  if (input.publishedAt != null && !/^\d{4}-\d{2}-\d{2}$/.test(input.publishedAt)) {
    return { ok: false, error: 'La fecha de publicación en Vinted no es válida.' }
  }

  const { data: item, error: loadError } = await supabase
    .from('inventory_items')
    .select('workspace_id, vinted_status')
    .eq('id', itemId)
    .eq('owner_id', user.id)
    .single()
  if (loadError || !item) return { ok: false, error: 'Item no encontrado o sin acceso.' }

  const { error: updateError } = await supabase
    .from('inventory_items')
    .update({
      vinted_status: input.status,
      vinted_url: url,
      vinted_price: input.price,
      vinted_published_at: input.publishedAt,
      vinted_notes: input.notes?.trim() || null,
    })
    .eq('id', itemId)
    .eq('owner_id', user.id)
  if (updateError) return { ok: false, error: updateError.message }

  const { error: eventError } = await supabase.from('item_lifecycle_events').insert({
    item_id: itemId,
    workspace_id: item.workspace_id,
    owner_id: user.id,
    event_type: 'vinted_updated',
    triggered_by: 'pablo',
    payload: {
      vinted_status_anterior: item.vinted_status,
      vinted_status: input.status,
      vinted_price: input.price,
      vinted_published_at: input.publishedAt,
    },
    notes: null,
  })
  if (eventError) {
    console.warn(`[sales] vinted event failed for item ${itemId}: ${eventError.message}`)
  }

  revalidatePath('/inventory')
  revalidatePath(`/inventory/${itemId}`)
  return { ok: true }
}
