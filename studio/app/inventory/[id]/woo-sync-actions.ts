'use server'

// WOO_WRITE_SYNC foundation — controlled Woo sync actions for a linked item.
//
// Every action here follows the same contract (house rules):
//   1. One action = one product (the item's wc_product_id). No bulk.
//   2. Fresh GET immediately before any write — never write against stale state.
//   3. The UI has already shown a preview and asked for explicit confirmation;
//      where it matters, the action re-verifies the previewed value against the
//      live one and aborts on conflict instead of writing blind.
//   4. Every write (and every failure) is logged to item_lifecycle_events.
//   5. Errors are shown, never swallowed. No automatic retry.
//   6. `status` is never sent: these actions cannot publish or unpublish.
//      Trash is a separate DELETE force=false with its own guards.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { fetchWooProductDetail } from '@/lib/wc/product-catalog'
import {
  formatWooPrice,
  trashWooProduct,
  updateWooProduct,
  TRASH_VETOED_PRODUCT_IDS,
} from '@/lib/wc/write-client'
import { mapWooStatusToMirror, normalizeDescription } from '@/lib/inventory/woo-diff'

export type WooSyncResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

type LoadedItem = {
  id: string
  workspace_id: string
  referencia: string
  status: string
  wc_product_id: number
  wc_status: string
  precio_publicado_web: number | null
}

type Loaded =
  | { ok: true; item: LoadedItem; userId: string; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; error: string }

async function loadLinkedItem(itemId: string): Promise<Loaded> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  const { data: item, error: loadError } = await supabase
    .from('inventory_items')
    .select('id, workspace_id, referencia, status, wc_product_id, wc_status, precio_publicado_web')
    .eq('id', itemId)
    .eq('owner_id', user.id)
    .single()
  if (loadError || !item) return { ok: false, error: 'Item no encontrado o sin acceso.' }
  if (item.wc_product_id == null) {
    return { ok: false, error: 'Esta camiseta no está vinculada a ningún producto de la web.' }
  }

  return { ok: true, item: item as LoadedItem, userId: user.id, supabase }
}

// Audit trail for sync operations. Returns whether the log entry was written:
// a Woo write must never be reported as an error just because logging failed,
// but the caller DOES tell the user when the history entry could not be saved.
async function logWooEvent(
  ctx: { supabase: Awaited<ReturnType<typeof createClient>>; item: LoadedItem; userId: string },
  eventType: string,
  notes: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  const { error } = await ctx.supabase.from('item_lifecycle_events').insert({
    item_id: ctx.item.id,
    workspace_id: ctx.item.workspace_id,
    owner_id: ctx.userId,
    event_type: eventType,
    triggered_by: 'pablo',
    payload,
    notes,
  })
  if (error) {
    console.warn(`[woo-sync] event ${eventType} failed for item ${ctx.item.id}: ${error.message}`)
    return false
  }
  return true
}

const LOG_FAILED_SUFFIX =
  ' Aviso: el cambio se aplicó pero no se pudo guardar en el registro de la ficha.'

// flipMirror: true only when a WRITE against Woo failed (real sync error).
// A failed pre-write READ (network blip) records the message and the event but
// does not flip wc_status to error_sync — nothing was actually out of sync.
async function markSyncError(
  ctx: { supabase: Awaited<ReturnType<typeof createClient>>; item: LoadedItem; userId: string },
  operation: string,
  message: string,
  flipMirror: boolean
) {
  if (flipMirror) {
    await ctx.supabase
      .from('inventory_items')
      .update({
        wc_status: 'error_sync',
        wc_error: message.slice(0, 500),
        wc_last_sync_at: new Date().toISOString(),
      })
      .eq('id', ctx.item.id)
      .eq('owner_id', ctx.userId)
  }
  await logWooEvent(ctx, 'wc_sync_error', `Fallo en ${operation}.`, {
    operation,
    wc_product_id: ctx.item.wc_product_id,
    error_message: message.slice(0, 300),
    write_attempted: flipMirror,
  })
}

async function updateMirror(
  ctx: { supabase: Awaited<ReturnType<typeof createClient>>; item: LoadedItem; userId: string },
  liveStatus: Parameters<typeof mapWooStatusToMirror>[0]
) {
  await ctx.supabase
    .from('inventory_items')
    .update({
      wc_status: mapWooStatusToMirror(liveStatus),
      wc_error: null,
      wc_last_sync_at: new Date().toISOString(),
    })
    .eq('id', ctx.item.id)
    .eq('owner_id', ctx.userId)
}

function revalidateItem(itemId: string) {
  revalidatePath('/inventory')
  revalidatePath(`/inventory/${itemId}`)
  revalidatePath('/inventory/woo')
}

// ── 1. Precio: Studio → Woo (PUT regular_price) ───────────────────────────────
// The confirmation showed "€old → €new". BOTH sides are re-verified here:
// expectedWooRegularPrice against the live Woo price, and expectedNewPrice
// against the current Studio price. If either moved since the preview (another
// tab, an edit, a stale ficha), abort — never write a value the user never saw.

export async function syncWooPrice(
  itemId: string,
  expectedWooRegularPrice: number | null,
  expectedNewPrice: number
): Promise<WooSyncResult> {
  const loaded = await loadLinkedItem(itemId)
  if (!loaded.ok) return { ok: false, error: loaded.error }
  const ctx = loaded

  const studioPrice =
    ctx.item.precio_publicado_web != null ? Number(ctx.item.precio_publicado_web) : null
  const newPriceStr = studioPrice != null ? formatWooPrice(studioPrice) : null
  if (studioPrice == null || !newPriceStr) {
    return { ok: false, error: 'El precio web de Studio está vacío o no es válido. Edita la camiseta primero.' }
  }
  if (
    !Number.isFinite(expectedNewPrice) ||
    Math.round(studioPrice * 100) !== Math.round(expectedNewPrice * 100)
  ) {
    return {
      ok: false,
      error: `El precio web de Studio cambió desde la vista previa (ahora €${studioPrice.toFixed(2)}). Recarga la ficha y revisa antes de confirmar.`,
    }
  }

  const liveResult = await fetchWooProductDetail(ctx.item.wc_product_id)
  if (!liveResult.ok) {
    await markSyncError(ctx, 'actualizar precio', liveResult.message, false)
    revalidateItem(itemId)
    return { ok: false, error: `No se pudo leer el producto antes de escribir: ${liveResult.message}` }
  }
  const live = liveResult.product

  if (live.status === 'trash') {
    return { ok: false, error: 'El producto está en la papelera de la web; no se actualiza el precio.' }
  }

  const liveCents = live.regularPrice != null ? Math.round(live.regularPrice * 100) : null
  const expectedCents =
    expectedWooRegularPrice != null ? Math.round(expectedWooRegularPrice * 100) : null
  if (liveCents !== expectedCents) {
    return {
      ok: false,
      error: `El precio en la web cambió desde la vista previa (ahora ${live.regularPrice != null ? `€${live.regularPrice.toFixed(2)}` : 'vacío'}). Recarga la ficha y revisa antes de confirmar.`,
    }
  }

  const writeResult = await updateWooProduct(ctx.item.wc_product_id, {
    regular_price: newPriceStr,
  })
  if (!writeResult.ok) {
    await markSyncError(ctx, 'actualizar precio', writeResult.message, true)
    revalidateItem(itemId)
    return { ok: false, error: `La web rechazó el cambio de precio: ${writeResult.message}` }
  }

  await updateMirror(ctx, writeResult.product.status)
  const logged = await logWooEvent(
    ctx,
    'wc_price_synced',
    `Precio actualizado en la web: ${live.regularPrice != null ? `€${live.regularPrice.toFixed(2)}` : 'vacío'} → €${Number(newPriceStr).toFixed(2)}.`,
    {
      operation: 'actualizar precio',
      wc_product_id: ctx.item.wc_product_id,
      endpoint: `PUT /wc/v3/products/${ctx.item.wc_product_id}`,
      precio_anterior: live.regularPrice,
      precio_nuevo: Number(newPriceStr),
    }
  )
  revalidateItem(itemId)
  return {
    ok: true,
    message:
      `Precio actualizado en la web: €${Number(newPriceStr).toFixed(2)}.` +
      (logged ? '' : LOG_FAILED_SUFFIX),
  }
}

// ── 2. Venta → Woo agotado (PUT stock) ────────────────────────────────────────
// Only offered for sold/reserved items so an active listing can't be zeroed by
// accident. Never touches `status`: the product stays published showing Agotado.

export async function syncWooStockOut(itemId: string): Promise<WooSyncResult> {
  const loaded = await loadLinkedItem(itemId)
  if (!loaded.ok) return { ok: false, error: loaded.error }
  const ctx = loaded

  if (ctx.item.status !== 'vendida' && ctx.item.status !== 'reservada') {
    return {
      ok: false,
      error: 'Solo se deja agotada la web para camisetas vendidas o reservadas. Registra la venta primero.',
    }
  }

  const liveResult = await fetchWooProductDetail(ctx.item.wc_product_id)
  if (!liveResult.ok) {
    await markSyncError(ctx, 'dejar agotado', liveResult.message, false)
    revalidateItem(itemId)
    return { ok: false, error: `No se pudo leer el producto antes de escribir: ${liveResult.message}` }
  }
  const live = liveResult.product

  if (live.status === 'trash') {
    return { ok: false, error: 'El producto está en la papelera de la web; no hay stock que actualizar.' }
  }

  if (live.stockStatus === 'outofstock') {
    await updateMirror(ctx, live.status)
    revalidateItem(itemId)
    return { ok: true, message: 'La web ya estaba agotada — no ha hecho falta ningún cambio.' }
  }

  const writeResult = await updateWooProduct(ctx.item.wc_product_id, {
    stock_status: 'outofstock',
    ...(live.manageStock ? { stock_quantity: 0 } : {}),
  })
  if (!writeResult.ok) {
    await markSyncError(ctx, 'dejar agotado', writeResult.message, true)
    revalidateItem(itemId)
    return { ok: false, error: `La web rechazó el cambio de stock: ${writeResult.message}` }
  }

  await updateMirror(ctx, writeResult.product.status)
  const logged = await logWooEvent(ctx, 'wc_stock_synced', 'Producto dejado agotado en la web tras la venta.', {
    operation: 'dejar agotado',
    wc_product_id: ctx.item.wc_product_id,
    endpoint: `PUT /wc/v3/products/${ctx.item.wc_product_id}`,
    stock_anterior: live.stockStatus,
    stock_nuevo: 'outofstock',
    stock_quantity_enviado: live.manageStock ? 0 : null,
  })
  revalidateItem(itemId)
  return {
    ok: true,
    message:
      'La web queda agotada. El producto sigue visible como «Agotado» — no se ha despublicado.' +
      (logged ? '' : LOG_FAILED_SUFFIX),
  }
}

// ── 3. Descripción: contenido aprobado → Woo (PUT description) ────────────────
// Both sides of the preview are re-verified before writing, like the price:
// expectedSuggestionId = the approved Studio version the panel showed (a newer
// approval aborts), expectedWebDescription = the web content the panel showed
// as "what gets replaced" (an edit in WP Admin since the preview aborts).

export async function syncWooDescription(
  itemId: string,
  expectedSuggestionId: string,
  expectedWebDescription: string
): Promise<WooSyncResult> {
  const loaded = await loadLinkedItem(itemId)
  if (!loaded.ok) return { ok: false, error: loaded.error }
  const ctx = loaded

  const { data: suggestions } = await ctx.supabase
    .from('ai_suggestions')
    .select('id, descripcion_larga, status, version')
    .eq('item_id', itemId)
    .in('status', ['aprobado', 'editado_aprobado'])
    .order('version', { ascending: false })
    .limit(1)
  const current = suggestions?.[0] ?? null
  const approved = current?.descripcion_larga?.trim() || null
  if (!current || !approved || approved.length < 20) {
    return { ok: false, error: 'No hay contenido aprobado en Studio para enviar a la web.' }
  }
  if (current.id !== expectedSuggestionId) {
    return {
      ok: false,
      error:
        'El contenido aprobado cambió desde la vista previa (hay una versión más reciente). Recarga la ficha y revisa antes de confirmar.',
    }
  }

  const liveResult = await fetchWooProductDetail(ctx.item.wc_product_id)
  if (!liveResult.ok) {
    await markSyncError(ctx, 'actualizar descripción', liveResult.message, false)
    revalidateItem(itemId)
    return { ok: false, error: `No se pudo leer el producto antes de escribir: ${liveResult.message}` }
  }
  const live = liveResult.product

  if (live.status === 'trash') {
    return { ok: false, error: 'El producto está en la papelera de la web; no se actualiza la descripción.' }
  }

  if (normalizeDescription(live.description) !== normalizeDescription(expectedWebDescription)) {
    return {
      ok: false,
      error:
        'La descripción de la web cambió desde la vista previa (¿editada en WP Admin?). Recarga la ficha y revisa antes de confirmar.',
    }
  }

  if (normalizeDescription(approved) === normalizeDescription(live.description)) {
    revalidateItem(itemId)
    return { ok: true, message: 'La descripción de la web ya coincide con el contenido aprobado.' }
  }

  const writeResult = await updateWooProduct(ctx.item.wc_product_id, { description: approved })
  if (!writeResult.ok) {
    await markSyncError(ctx, 'actualizar descripción', writeResult.message, true)
    revalidateItem(itemId)
    return { ok: false, error: `La web rechazó el cambio de descripción: ${writeResult.message}` }
  }

  await updateMirror(ctx, writeResult.product.status)
  const logged = await logWooEvent(ctx, 'wc_description_synced', 'Descripción actualizada en la web desde el contenido aprobado.', {
    operation: 'actualizar descripción',
    wc_product_id: ctx.item.wc_product_id,
    endpoint: `PUT /wc/v3/products/${ctx.item.wc_product_id}`,
    longitud_anterior: live.description.length,
    longitud_nueva: approved.length,
  })
  revalidateItem(itemId)
  return {
    ok: true,
    message: 'Descripción actualizada en la web.' + (logged ? '' : LOG_FAILED_SUFFIX),
  }
}

// ── 4. Borrador → papelera reversible (DELETE force=false) ────────────────────

export async function trashWooDraftForItem(itemId: string): Promise<WooSyncResult> {
  const loaded = await loadLinkedItem(itemId)
  if (!loaded.ok) return { ok: false, error: loaded.error }
  const ctx = loaded

  if (TRASH_VETOED_PRODUCT_IDS.includes(ctx.item.wc_product_id)) {
    return { ok: false, error: 'Este producto está protegido y no puede enviarse a papelera desde Studio.' }
  }

  // trashWooProduct re-reads the product and refuses anything that is not a
  // draft/pending — a published product can never end up here.
  const result = await trashWooProduct(ctx.item.wc_product_id)
  if (!result.ok) {
    // Guard refusals (veto, live check, not-a-draft) happen BEFORE the DELETE
    // goes out: nothing was written, so the mirror must not flip to error_sync.
    const preWriteCodes = [
      'invalid_product_id',
      'vetoed_product',
      'live_check_failed',
      'not_a_draft',
      'missing_credentials',
    ]
    await markSyncError(ctx, 'enviar a papelera', result.message, !preWriteCodes.includes(result.code))
    revalidateItem(itemId)
    return { ok: false, error: result.message }
  }

  await ctx.supabase
    .from('inventory_items')
    .update({
      wc_status: 'archivado_wc',
      wc_error: null,
      wc_last_sync_at: new Date().toISOString(),
    })
    .eq('id', ctx.item.id)
    .eq('owner_id', ctx.userId)

  const logged = await logWooEvent(ctx, 'wc_trashed', 'Borrador enviado a la papelera de la web (reversible desde WP Admin).', {
    operation: 'enviar a papelera',
    wc_product_id: ctx.item.wc_product_id,
    endpoint: `DELETE /wc/v3/products/${ctx.item.wc_product_id}?force=false`,
    force: false,
    estado_final: result.product.status,
  })
  revalidateItem(itemId)
  return {
    ok: true,
    message:
      'Borrador enviado a la papelera de la web. Es reversible: WP Admin → Productos → Papelera → Restaurar.' +
      (logged ? '' : LOG_FAILED_SUFFIX),
  }
}

// ── 5. Actualizar el estado local (solo Supabase — no toca la web) ────────────

export async function refreshLocalWooMirror(itemId: string): Promise<WooSyncResult> {
  const loaded = await loadLinkedItem(itemId)
  if (!loaded.ok) return { ok: false, error: loaded.error }
  const ctx = loaded

  const liveResult = await fetchWooProductDetail(ctx.item.wc_product_id)
  if (!liveResult.ok) {
    return { ok: false, error: `No se pudo leer el producto: ${liveResult.message}` }
  }

  const expected = mapWooStatusToMirror(liveResult.product.status)
  if (ctx.item.wc_status === expected) {
    await ctx.supabase
      .from('inventory_items')
      .update({ wc_last_sync_at: new Date().toISOString() })
      .eq('id', ctx.item.id)
      .eq('owner_id', ctx.userId)
    revalidateItem(itemId)
    return { ok: true, message: 'El estado local ya estaba al día.' }
  }

  await updateMirror(ctx, liveResult.product.status)
  await logWooEvent(ctx, 'wc_state_refreshed', 'Estado local actualizado desde la web (sin cambios en la web).', {
    operation: 'actualizar estado local',
    de: ctx.item.wc_status,
    a: expected,
    estado_web: liveResult.product.status,
  })
  revalidateItem(itemId)
  return { ok: true, message: 'Estado local actualizado desde la web.' }
}
