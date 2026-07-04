// WOO_WRITE_SYNC foundation — controlled WooCommerce writes. Server-side only.
//
// House rules enforced AT THIS LAYER (defense in depth — the server actions that
// call this module re-check everything again):
//   - One call = one product. There is no batch/bulk function here and none may
//     be added. The /products/batch endpoint is forbidden.
//   - PUT only sends WHITELISTED root fields (price/stock/description). `status`
//     is NOT in the whitelist: these writes can never publish, unpublish or
//     trash via update. (Trash has its own function with its own guards.)
//   - DELETE is always force=false (reversible trash). `force=true` does not
//     exist in this module.
//   - Trash refuses published/private products and the vetoed reference product.
//   - Errors are credential-sanitized before leaving this module.

import {
  fetchWooProductDetail,
  parseProductDetailRaw,
  type WooProductDetail,
  type WooProductDetailResult,
} from './product-catalog'

// Products that must never be trashed from Studio. 1731 = "Rivaldo", the
// canonical published reference product used by PRODUCT_REFERENCE_DIFF_GATE.
export const TRASH_VETOED_PRODUCT_IDS: readonly number[] = [1731]

// Root Woo fields Studio is allowed to update. Anything else — status,
// categories, attributes, meta_data, images — is out of scope for this
// foundation and must go through its own future block with its own gates.
export interface WooUpdateChanges {
  regular_price?: string
  stock_quantity?: number
  stock_status?: 'instock' | 'outofstock'
  description?: string
}

const ALLOWED_UPDATE_KEYS: ReadonlyArray<keyof WooUpdateChanges> = [
  'regular_price',
  'stock_quantity',
  'stock_status',
  'description',
]

export type WooWriteResult =
  | { ok: true; product: WooProductDetail }
  | { ok: false; httpStatus: number; code: string; message: string }

// Formats a Studio price for the WC API: integers as "45", fractions as "44.99".
// Same convention as bridge.ts (kept local so the create bridge stays untouched).
export function formatWooPrice(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return null
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2)
}

// ── PUT /wc/v3/products/{id} — whitelisted update ─────────────────────────────

export async function updateWooProduct(
  productId: number,
  changes: WooUpdateChanges
): Promise<WooWriteResult> {
  const ctx = buildContext()
  if (!ctx.ok) return ctx.error

  if (!Number.isInteger(productId) || productId <= 0) {
    return failure(0, 'invalid_product_id', 'ID de producto no válido.')
  }

  // Rebuild the payload from the whitelist — unknown keys are dropped, never sent.
  const payload: Record<string, unknown> = {}
  for (const key of ALLOWED_UPDATE_KEYS) {
    if (changes[key] !== undefined) payload[key] = changes[key]
  }
  if (Object.keys(payload).length === 0) {
    return failure(0, 'empty_update', 'No hay cambios que enviar.')
  }

  let response: Response
  try {
    response = await fetch(`${ctx.siteUrl}/wp-json/wc/v3/products/${productId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${ctx.credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
  } catch (err) {
    return failure(
      0,
      'network_error',
      sanitize(err instanceof Error ? err.message : 'Error de red', ctx)
    )
  }

  return parseWriteResponse(response, ctx)
}

// ── DELETE /wc/v3/products/{id}?force=false — reversible trash ────────────────

export async function trashWooProduct(productId: number): Promise<WooWriteResult> {
  const ctx = buildContext()
  if (!ctx.ok) return ctx.error

  if (!Number.isInteger(productId) || productId <= 0) {
    return failure(0, 'invalid_product_id', 'ID de producto no válido.')
  }

  if (TRASH_VETOED_PRODUCT_IDS.includes(productId)) {
    return failure(
      0,
      'vetoed_product',
      'Este producto está protegido y no puede enviarse a papelera desde Studio.'
    )
  }

  // Fresh read immediately before trashing: only drafts/pending can be trashed,
  // never a published or private product, and never one already in the trash.
  const liveResult = await fetchWooProductDetail(productId)
  if (!liveResult.ok) {
    return failure(
      0,
      'live_check_failed',
      `No se pudo verificar el estado actual del producto antes de la papelera: ${liveResult.message}`
    )
  }
  const live = liveResult.product
  if (live.status !== 'draft' && live.status !== 'pending') {
    return failure(
      0,
      'not_a_draft',
      `Solo se envían a papelera borradores. Este producto está en estado "${live.status}" y no se toca.`
    )
  }

  let response: Response
  try {
    // force=false → WordPress trash (reversible from WP Admin → Papelera).
    // There is deliberately no code path that sets force=true.
    response = await fetch(
      `${ctx.siteUrl}/wp-json/wc/v3/products/${productId}?force=false`,
      {
        method: 'DELETE',
        headers: { Authorization: `Basic ${ctx.credentials}` },
        cache: 'no-store',
      }
    )
  } catch (err) {
    return failure(
      0,
      'network_error',
      sanitize(err instanceof Error ? err.message : 'Error de red', ctx)
    )
  }

  return parseWriteResponse(response, ctx)
}

// ── Shared plumbing ────────────────────────────────────────────────────────────

type WriteContext =
  | { ok: true; siteUrl: string; credentials: string; appUser: string; appPassword: string }
  | { ok: false; error: WooWriteResult & { ok: false } }

function buildContext(): WriteContext {
  const siteUrl = process.env.WP_SITE_URL
  const appUser = process.env.WP_APP_USER
  const appPassword = process.env.WP_APP_PASSWORD

  if (!siteUrl || !appUser || !appPassword) {
    return {
      ok: false,
      error: failure(
        0,
        'missing_credentials',
        'La conexión con la tienda no está configurada en el servidor.'
      ),
    }
  }

  return {
    ok: true,
    siteUrl: siteUrl.replace(/\/$/, ''),
    credentials: Buffer.from(`${appUser}:${appPassword}`).toString('base64'),
    appUser,
    appPassword,
  }
}

async function parseWriteResponse(
  response: Response,
  ctx: { appUser: string; appPassword: string }
): Promise<WooWriteResult> {
  if (!response.ok) {
    let code = 'wc_api_error'
    let message = `HTTP ${response.status}`
    try {
      const body = (await response.json()) as { code?: string; message?: string }
      if (body.code) code = body.code
      if (body.message) message = body.message
    } catch {
      // keep defaults
    }
    return failure(response.status, code, sanitize(message, ctx))
  }

  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    return failure(response.status, 'invalid_response', 'WooCommerce devolvió una respuesta no parseable.')
  }

  const detail = parseDetailFromRaw(raw)
  if (!detail) {
    return failure(response.status, 'invalid_response', 'WooCommerce devolvió un producto sin ID válido.')
  }
  return { ok: true, product: detail }
}

function failure(httpStatus: number, code: string, message: string): WooWriteResult & { ok: false } {
  return { ok: false, httpStatus, code, message: message.slice(0, 500) }
}

function sanitize(msg: string, ctx: { appUser: string; appPassword: string }): string {
  let s = msg
  if (ctx.appUser) s = s.replaceAll(ctx.appUser, '[REDACTED]')
  if (ctx.appPassword) s = s.replaceAll(ctx.appPassword, '[REDACTED]')
  if (ctx.appUser && ctx.appPassword) {
    s = s.replaceAll(
      Buffer.from(`${ctx.appUser}:${ctx.appPassword}`).toString('base64'),
      '[REDACTED]'
    )
  }
  return s.slice(0, 500)
}

// product-catalog owns the raw→detail parser (single source of parsing truth).
function parseDetailFromRaw(raw: unknown): WooProductDetail | null {
  return parseProductDetailRaw(raw)
}

export type { WooProductDetail, WooProductDetailResult }
