// WooCommerce REST API client — server-side only.
// Never import from client components. Credentials are read from env vars at call time.

export type WcProductPayload = {
  name: string
  type: 'simple'
  status: 'draft' // DRAFT_ONLY — hardcoded, immutable
  regular_price: string
  description: string
  short_description: ''
  stock_status: 'instock'
  manage_stock: boolean
  stock_quantity?: number | null
  categories?: Array<{ id: number }>
  attributes?: Array<{ id: number; name?: string; options: string[]; visible: boolean; variation: boolean }>
  // S026B — sideload from public URLs (Supabase Storage). Gated by STUDIO_WC_ATTACH_IMAGES_ENABLED.
  images?: Array<{ src: string; position?: number; name?: string }>
  // value is string for most fields; string[] for ACF multi-value fields (e.g. ano_temporada)
  meta_data: Array<{ key: string; value: string | string[] }>
}

export type WcProductResponse = {
  id: number
  name: string
  status: string
  permalink: string
  images?: Array<{ id: number; src?: string; position?: number }>
}

export type WcApiResult =
  | { ok: true; product: WcProductResponse }
  | { ok: false; httpStatus: number; errorCode: string; message: string }

export async function createWcDraftProduct(payload: WcProductPayload): Promise<WcApiResult> {
  const siteUrl = process.env.WP_SITE_URL
  const appUser = process.env.WP_APP_USER
  const appPassword = process.env.WP_APP_PASSWORD

  if (!siteUrl || !appUser || !appPassword) {
    return {
      ok: false,
      httpStatus: 0,
      errorCode: 'missing_credentials',
      message: 'WP_SITE_URL, WP_APP_USER o WP_APP_PASSWORD no están configurados en el servidor.',
    }
  }

  // DRAFT_ONLY absolute guard — reject any payload that isn't draft
  if (payload.status !== 'draft') {
    return {
      ok: false,
      httpStatus: 0,
      errorCode: 'invalid_status_attempt',
      message: 'INTERNAL_ERROR: invalid_status_attempt — status must always be draft.',
    }
  }

  const credentials = Buffer.from(`${appUser}:${appPassword}`).toString('base64')
  const endpoint = `${siteUrl.replace(/\/$/, '')}/wp-json/wc/v3/products`

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Network error'
    return {
      ok: false,
      httpStatus: 0,
      errorCode: 'network_error',
      message: sanitizeMessage(raw, appUser, appPassword),
    }
  }

  if (response.ok) {
    let data: WcProductResponse
    try {
      data = (await response.json()) as WcProductResponse
    } catch {
      return {
        ok: false,
        httpStatus: response.status,
        errorCode: 'invalid_response',
        message: 'WooCommerce devolvió una respuesta no parseable.',
      }
    }

    // STOP if WC returned anything other than draft
    if (data.status !== 'draft') {
      return {
        ok: false,
        httpStatus: response.status,
        errorCode: 'unexpected_wc_status',
        message: `STOP: WooCommerce devolvió status="${data.status}" en lugar de "draft". No se guarda el producto.`,
      }
    }

    if (!data.id || data.id <= 0) {
      return {
        ok: false,
        httpStatus: response.status,
        errorCode: 'invalid_product_id',
        message: 'WooCommerce devolvió un ID de producto inválido.',
      }
    }

    return { ok: true, product: data }
  }

  // Parse WC error body
  let errorCode = 'wc_api_error'
  let message = `HTTP ${response.status}`
  try {
    const errData = (await response.json()) as { code?: string; message?: string }
    if (errData.code) errorCode = errData.code
    if (errData.message) message = errData.message
  } catch {
    // ignore parse errors on error body
  }

  return {
    ok: false,
    httpStatus: response.status,
    errorCode,
    message: sanitizeMessage(message, appUser, appPassword),
  }
}

// Strips credential values from error messages before they reach logs or DB.
function sanitizeMessage(msg: string, user: string, password: string): string {
  let s = msg
  if (user) s = s.replaceAll(user, '[REDACTED]')
  if (password) s = s.replaceAll(password, '[REDACTED]')
  return s.slice(0, 500)
}
