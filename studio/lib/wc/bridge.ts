// S022C — Studio → WooCommerce draft bridge.
// Server-side only. Never import from client components.
// DRAFT_ONLY: status=draft is hardcoded and cannot be overridden.
// Idempotent: stops immediately if wc_product_id is already set.

import { createClient } from '@/lib/supabase/server'
import { createWcDraftProduct } from './client'
import type { WcProductPayload } from './client'

const BRIDGE_VERSION = 'v1.0'

export type BridgeResult =
  | { ok: true; wcProductId: number }
  | { ok: false; error: string; code: string }

// ── Helpers ────────────────────────────────────────────────────────────────────

// Formats precio_publicado_web as a WC-compatible price string.
// Integer values → "45"; fractional values → "44.99".
// Returns null if value is null, NaN, or <= 0.
function formatWcRegularPrice(value: unknown): string | null {
  if (value == null) return null
  const num = Number(value)
  if (isNaN(num) || num <= 0) return null
  // Round to nearest cent to avoid floating-point drift
  const rounded = Math.round(num * 100) / 100
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2)
}

// Required term ID: must be a non-empty numeric string (e.g. "129").
function isValidRequiredTermId(value: string | null | undefined): boolean {
  if (!value || !value.trim()) return false
  return /^\d+$/.test(value.trim())
}

// Optional term ID: empty string / null are allowed; if non-empty, must be numeric.
function isValidOptionalTermId(value: string | null | undefined): boolean {
  if (value == null || value.trim() === '') return true
  return /^\d+$/.test(value.trim())
}

// ── Main bridge function ────────────────────────────────────────────────────────

export async function createWcDraftForItem(itemId: string): Promise<BridgeResult> {
  const supabase = await createClient()

  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, code: 'auth_required', error: 'No autenticado.' }
  }

  // ── 2. Load item (RLS enforces owner_id) ──────────────────────────────────
  const { data: item, error: itemError } = await supabase
    .from('inventory_items')
    .select('*, football_shirt_details(*)')
    .eq('id', itemId)
    .eq('owner_id', user.id)
    .single()

  if (itemError || !item) {
    return {
      ok: false,
      code: 'item_not_found',
      error: 'Item no encontrado o sin acceso.',
    }
  }

  // ── 3. Idempotency check ───────────────────────────────────────────────────
  if (item.wc_product_id != null) {
    return {
      ok: false,
      code: 'IDEMPOTENCY_STOP',
      error: `draft_already_exists: ya existe un borrador WC (ID ${item.wc_product_id}). No se crea un duplicado.`,
    }
  }

  // ── 4. Basic preconditions ─────────────────────────────────────────────────
  if (!item.referencia?.trim()) {
    return { ok: false, code: 'VALIDATION_ERROR', error: 'name_required: la referencia del item está vacía.' }
  }

  const precioStr = formatWcRegularPrice(item.precio_publicado_web)
  if (!precioStr) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      error: 'price_invalid: precio_publicado_web está vacío, es cero o inválido. Edita el item para añadir el precio web antes de crear el borrador.',
    }
  }

  const shirt = item.football_shirt_details
  if (!shirt) {
    return { ok: false, code: 'VALIDATION_ERROR', error: 'shirt_details_missing: el item no tiene detalles de camiseta.' }
  }

  if (!shirt.talla?.trim()) {
    return { ok: false, code: 'VALIDATION_ERROR', error: 'talla_required: la talla está vacía.' }
  }

  if (!shirt.condicion?.trim()) {
    return { ok: false, code: 'VALIDATION_ERROR', error: 'condicion_required: la condición está vacía.' }
  }

  // ── 5. Term ID validation ─────────────────────────────────────────────────
  // equipo and temporada are required numeric term IDs.
  // liga and jugador are optional: "" is valid; non-empty must be numeric.
  if (!isValidRequiredTermId(shirt.equipo)) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      error: 'equipo_term_id_required: el equipo no tiene term ID numérico resuelto. Completa el campo equipo con un valor reconocido.',
    }
  }

  if (!isValidRequiredTermId(shirt.temporada)) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      error: 'temporada_term_id_required: la temporada no tiene term ID numérico resuelto. Completa el campo temporada con un valor reconocido.',
    }
  }

  const ligaValue = shirt.liga?.trim() ?? ''
  if (!isValidOptionalTermId(ligaValue)) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      error: `liga_term_id_invalid: el valor de liga "${ligaValue}" no es un term ID numérico válido ni vacío.`,
    }
  }

  const jugadorValue = shirt.jugador?.trim() ?? ''
  if (!isValidOptionalTermId(jugadorValue)) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      error: `jugador_term_id_invalid: el valor de jugador "${jugadorValue}" no es un term ID numérico válido ni vacío.`,
    }
  }

  // ── 6. Load latest approved ai_suggestion ─────────────────────────────────
  const { data: suggestions } = await supabase
    .from('ai_suggestions')
    .select('titulo_seo, descripcion_larga, status')
    .eq('item_id', itemId)
    .in('status', ['aprobado', 'editado_aprobado'])
    .order('version', { ascending: false })
    .limit(1)

  const suggestion = suggestions?.[0] ?? null

  if (!suggestion) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      error: 'name_required: no hay contenido SEO aprobado. Aprueba el contenido SEO antes de crear el borrador.',
    }
  }

  if (!suggestion.titulo_seo?.trim() || suggestion.titulo_seo.trim().length < 5) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      error: 'name_required: el título SEO está vacío o es demasiado corto.',
    }
  }

  if (!suggestion.descripcion_larga?.trim() || suggestion.descripcion_larga.trim().length < 20) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      error: 'description_required: la descripción larga está vacía o es demasiado corta.',
    }
  }

  // ── 7. Load workspace ─────────────────────────────────────────────────────
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (wsError || !workspace) {
    return { ok: false, code: 'workspace_not_found', error: 'Workspace no encontrado.' }
  }

  // ── 8. Build WC payload ───────────────────────────────────────────────────
  const payload: WcProductPayload = {
    name: suggestion.titulo_seo.trim(),
    type: 'simple',
    status: 'draft', // HARDCODED — immutable
    regular_price: precioStr,
    description: suggestion.descripcion_larga.trim(),
    short_description: '',
    stock_status: 'instock',
    manage_stock: false,
    meta_data: [
      { key: 'liga', value: ligaValue },
      { key: 'equipo', value: shirt.equipo.trim() },
      { key: 'ano_temporada', value: shirt.temporada.trim() },
      { key: 'talla', value: shirt.talla.trim() },
      { key: 'condicion', value: shirt.condicion.trim() },
      { key: 'jugador', value: jugadorValue },
      { key: 'descripcion_del_producto', value: suggestion.descripcion_larga.trim() },
    ],
  }

  // Snapshot saved to Supabase — no credentials, no sensitive data
  const payloadSnapshot = {
    endpoint: 'POST /wc/v3/products',
    sent_at: new Date().toISOString(),
    payload: {
      name: payload.name,
      type: payload.type,
      status: payload.status,
      regular_price: payload.regular_price,
      description: payload.description,
      meta_data: payload.meta_data,
    },
    bridge_version: BRIDGE_VERSION,
  }

  const fromStatus = item.status as string

  // ── 9. Call WooCommerce API ───────────────────────────────────────────────
  const wcResult = await createWcDraftProduct(payload)

  // ── 10. Success path — persist to Supabase ────────────────────────────────
  if (wcResult.ok) {
    const wcProduct = wcResult.product

    // Critical: persist wc_product_id before returning success.
    // If this update fails, the product exists in WC but not in Studio — do not hide this.
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        wc_product_id: wcProduct.id,
        wc_status: 'borrador_creado',
        wc_draft_created_at: new Date().toISOString(),
        wc_last_sync_at: new Date().toISOString(),
        wc_error: null,
        wc_payload_snapshot: {
          ...payloadSnapshot,
          response_id: wcProduct.id,
          response_status: wcProduct.status,
          http_status: 201,
        },
        status: 'borrador_web',
      })
      .eq('id', itemId)

    if (updateError) {
      // STOP_DO_NOT_RETRY: the draft was created in WooCommerce (ID is known)
      // but Studio failed to record it. Pablo must manually set wc_product_id in Supabase.
      // Do NOT retry this action — it would create a duplicate product in WC.
      return {
        ok: false,
        code: 'WC_CREATED_SUPABASE_UPDATE_FAILED',
        error: [
          `STOP_DO_NOT_RETRY: el borrador fue creado en WooCommerce (ID ${wcProduct.id})`,
          `pero Studio no pudo guardar el resultado en Supabase: ${updateError.message}`,
          `Acción manual requerida: establecer wc_product_id=${wcProduct.id} en Supabase`,
          `para el item ${itemId}. NO pulsar el botón de nuevo (crearía un duplicado en WC).`,
        ].join(' — '),
      }
    }

    // Lifecycle event: best-effort. If it fails, log but don't block — inventory is already saved.
    const { error: lifecycleError } = await supabase.from('item_lifecycle_events').insert({
      item_id: itemId,
      workspace_id: workspace.id,
      owner_id: user.id,
      event_type: 'wc_sync_ok',
      from_status: fromStatus,
      to_status: 'borrador_web',
      triggered_by: 'agente',
      payload: {
        wc_product_id: wcProduct.id,
        endpoint: 'POST /wc/v3/products',
        http_status: 201,
        bridge_version: BRIDGE_VERSION,
      },
      notes: 'Borrador creado correctamente en WooCommerce.',
    })

    // Non-critical failure: inventory already saved; return success with warning context.
    if (lifecycleError) {
      console.warn(
        `[bridge] wc_sync_ok lifecycle event failed for item ${itemId}: ${lifecycleError.message}`
      )
    }

    return { ok: true, wcProductId: wcProduct.id }
  }

  // ── 11. Error path ────────────────────────────────────────────────────────
  const sanitizedError = `[HTTP ${wcResult.httpStatus}] ${wcResult.errorCode}: ${wcResult.message}`

  // Best-effort updates — failures here are non-critical (WC was not modified)
  await supabase
    .from('inventory_items')
    .update({
      wc_status: 'error_sync',
      wc_error: sanitizedError.slice(0, 500),
      wc_last_sync_at: new Date().toISOString(),
      wc_payload_snapshot: {
        ...payloadSnapshot,
        http_status: wcResult.httpStatus,
        wc_error_code: wcResult.errorCode,
      },
      // status does NOT change on error
    })
    .eq('id', itemId)

  await supabase.from('item_lifecycle_events').insert({
    item_id: itemId,
    workspace_id: workspace.id,
    owner_id: user.id,
    event_type: 'wc_sync_error',
    from_status: fromStatus,
    to_status: fromStatus,
    triggered_by: 'agente',
    payload: {
      endpoint: 'POST /wc/v3/products',
      http_status: wcResult.httpStatus,
      wc_error_code: wcResult.errorCode,
      error_message: wcResult.message,
      bridge_version: BRIDGE_VERSION,
    },
    notes: 'Fallo al crear borrador. Ver wc_error para detalle.',
  })

  return {
    ok: false,
    code: wcResult.errorCode,
    error: sanitizedError,
  }
}
