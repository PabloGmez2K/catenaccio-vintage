// STOCK_MANAGER foundation — live GET-only read of the WooCommerce product catalog.
// Follows the taxonomy-sync.ts fetch pattern: server-side only, Basic auth from env
// vars at call time, paginated GETs, credential-sanitized error messages.
// This module NEVER writes to WooCommerce: no POST, no PUT, no PATCH, no DELETE.

export type WooProductStatus = 'publish' | 'draft' | 'pending' | 'private' | 'trash'

export interface WooCatalogProduct {
  id: number
  name: string
  status: WooProductStatus
  permalink: string | null
  price: number | null
  regularPrice: number | null
  stockStatus: 'instock' | 'outofstock' | 'onbackorder' | 'unknown'
  stockQuantity: number | null
  manageStock: boolean
  dateCreated: string | null
  dateModified: string | null
  imageSrc: string | null
  images: WooProductImage[]
  categories: WooProductCategory[]
  attributes: WooProductAttribute[]
}

export type WooCatalogResult =
  | {
      ok: true
      products: WooCatalogProduct[]
      // status=trash needs its own request; if that request fails we still return
      // the main catalog and flag that trashed products could not be listed.
      trashAccessible: boolean
      fetchedAt: string
    }
  | { ok: false; code: string; message: string }

type WcProductRaw = {
  id?: number
  name?: string
  status?: string
  permalink?: string
  price?: string
  regular_price?: string
  stock_status?: string
  stock_quantity?: number | null
  manage_stock?: boolean
  date_created?: string
  date_modified?: string
  images?: Array<{ id?: number; src?: string; name?: string; alt?: string; position?: number }>
  categories?: Array<{ id?: number; name?: string; slug?: string }>
  attributes?: Array<{ id?: number; name?: string; slug?: string; options?: string[] }>
}

export interface WooProductCategory {
  id: number
  name: string
  slug: string | null
}

export interface WooProductAttribute {
  id: number | null
  name: string
  slug: string | null
  options: string[]
}

export interface WooProductImage {
  id: number | null
  src: string
  name: string | null
  alt: string | null
  position: number
}

// Keep the payload lean: we only read what the stock manager screen shows.
const PRODUCT_FIELDS = [
  'id',
  'name',
  'status',
  'permalink',
  'price',
  'regular_price',
  'stock_status',
  'stock_quantity',
  'manage_stock',
  'date_created',
  'date_modified',
  'images',
  'categories',
  'attributes',
].join(',')

export async function fetchWooCatalog(): Promise<WooCatalogResult> {
  const siteUrl = process.env.WP_SITE_URL
  const appUser = process.env.WP_APP_USER
  const appPassword = process.env.WP_APP_PASSWORD

  if (!siteUrl || !appUser || !appPassword) {
    return {
      ok: false,
      code: 'missing_credentials',
      message: 'La conexión con la tienda no está configurada en el servidor.',
    }
  }

  const ctx: WcFetchContext = {
    siteUrl: siteUrl.replace(/\/$/, ''),
    credentials: Buffer.from(`${appUser}:${appPassword}`).toString('base64'),
    appUser,
    appPassword,
  }

  let main: WcProductRaw[]
  try {
    // status=any covers publish + draft + pending + private, but NOT trash.
    main = await wcGetPaginated<WcProductRaw>(ctx, '/wp-json/wc/v3/products', {
      status: 'any',
      _fields: PRODUCT_FIELDS,
    })
  } catch (err) {
    return {
      ok: false,
      code: 'wc_get_failed',
      message: sanitizeMessage(
        err instanceof Error ? err.message : 'WooCommerce GET failed',
        appUser,
        appPassword
      ),
    }
  }

  // Trash is best-effort: some roles cannot list trashed products. A failure here
  // must not hide the rest of the catalog.
  let trashed: WcProductRaw[] = []
  let trashAccessible = true
  try {
    trashed = await wcGetPaginated<WcProductRaw>(ctx, '/wp-json/wc/v3/products', {
      status: 'trash',
      _fields: PRODUCT_FIELDS,
    })
  } catch {
    trashAccessible = false
  }

  const products = [...main, ...trashed]
    .map(parseProduct)
    .filter((p): p is WooCatalogProduct => p !== null)

  return { ok: true, products, trashAccessible, fetchedAt: new Date().toISOString() }
}

function parseProduct(raw: WcProductRaw): WooCatalogProduct | null {
  if (typeof raw.id !== 'number' || raw.id <= 0) return null

  const status: WooProductStatus =
    raw.status === 'publish' ||
    raw.status === 'draft' ||
    raw.status === 'pending' ||
    raw.status === 'private' ||
    raw.status === 'trash'
      ? raw.status
      : 'draft'

  const stockStatus =
    raw.stock_status === 'instock' ||
    raw.stock_status === 'outofstock' ||
    raw.stock_status === 'onbackorder'
      ? raw.stock_status
      : 'unknown'

  return {
    id: raw.id,
    name: raw.name?.trim() || `Producto ${raw.id}`,
    status,
    permalink: raw.permalink ?? null,
    price: parsePrice(raw.price),
    regularPrice: parsePrice(raw.regular_price),
    stockStatus,
    stockQuantity: typeof raw.stock_quantity === 'number' ? raw.stock_quantity : null,
    manageStock: raw.manage_stock === true,
    dateCreated: raw.date_created ?? null,
    dateModified: raw.date_modified ?? null,
    imageSrc: raw.images?.[0]?.src ?? null,
    images: parseImages(raw.images),
    categories: parseCategories(raw.categories),
    attributes: parseAttributes(raw.attributes),
  }
}

function parseImages(raw: WcProductRaw['images']): WooProductImage[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((image, index) => {
      const src = typeof image.src === 'string' ? image.src.trim() : ''
      if (!src) return null
      return {
        id: typeof image.id === 'number' && image.id > 0 ? image.id : null,
        src,
        name: typeof image.name === 'string' && image.name.trim() ? image.name.trim() : null,
        alt: typeof image.alt === 'string' && image.alt.trim() ? image.alt.trim() : null,
        position: typeof image.position === 'number' ? image.position : index,
      }
    })
    .filter((image): image is WooProductImage => image !== null)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

function parseCategories(raw: WcProductRaw['categories']): WooProductCategory[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((cat) => typeof cat.id === 'number' && cat.id > 0 && typeof cat.name === 'string')
    .map((cat) => ({ id: cat.id!, name: cat.name!.trim(), slug: cat.slug ?? null }))
    .filter((cat) => cat.name.length > 0)
}

function parseAttributes(raw: WcProductRaw['attributes']): WooProductAttribute[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((attr) => typeof attr.name === 'string' && attr.name.trim().length > 0)
    .map((attr) => ({
      id: typeof attr.id === 'number' && attr.id > 0 ? attr.id : null,
      name: attr.name!.trim(),
      slug: attr.slug ?? null,
      options: Array.isArray(attr.options)
        ? attr.options.map((opt) => opt.trim()).filter(Boolean)
        : [],
    }))
}

function parsePrice(value: string | undefined): number | null {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

// ── Single-product live detail (GET) ──────────────────────────────────────────
// Adds description + sale_price on top of the catalog fields. Used by the item
// detail sync panel and by the controlled write layer for fresh pre-write reads.

export interface WooProductDetail extends WooCatalogProduct {
  description: string
  salePrice: number | null
  metaData: Record<string, unknown>
}

export type WooProductDetailResult =
  | { ok: true; product: WooProductDetail; fetchedAt: string }
  | { ok: false; code: string; message: string }

type WcProductDetailRaw = WcProductRaw & {
  description?: string
  sale_price?: string
  meta_data?: Array<{ key?: string; value?: unknown }>
}

const PRODUCT_DETAIL_FIELDS = `${PRODUCT_FIELDS},description,sale_price,meta_data`

export function parseProductDetailRaw(raw: unknown): WooProductDetail | null {
  const base = parseProduct((raw ?? {}) as WcProductRaw)
  if (!base) return null
  const detailRaw = raw as WcProductDetailRaw
  return {
    ...base,
    description: typeof detailRaw.description === 'string' ? detailRaw.description : '',
    salePrice: parsePrice(detailRaw.sale_price),
    metaData: parseMetaData(detailRaw.meta_data),
  }
}

function parseMetaData(raw: WcProductDetailRaw['meta_data']): Record<string, unknown> {
  if (!Array.isArray(raw)) return {}
  const out: Record<string, unknown> = {}
  for (const entry of raw) {
    if (typeof entry.key === 'string' && entry.key.trim()) {
      out[entry.key] = entry.value
    }
  }
  return out
}

export async function fetchWooProductDetail(productId: number): Promise<WooProductDetailResult> {
  const siteUrl = process.env.WP_SITE_URL
  const appUser = process.env.WP_APP_USER
  const appPassword = process.env.WP_APP_PASSWORD

  if (!siteUrl || !appUser || !appPassword) {
    return {
      ok: false,
      code: 'missing_credentials',
      message: 'La conexión con la tienda no está configurada en el servidor.',
    }
  }
  if (!Number.isInteger(productId) || productId <= 0) {
    return { ok: false, code: 'invalid_product_id', message: 'ID de producto no válido.' }
  }

  const base = siteUrl.replace(/\/$/, '')
  const url = new URL(`/wp-json/wc/v3/products/${productId}`, base)
  url.searchParams.set('_fields', PRODUCT_DETAIL_FIELDS)

  let response: Response
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`${appUser}:${appPassword}`).toString('base64')}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error de red'
    return { ok: false, code: 'network_error', message: sanitizeMessage(msg, appUser, appPassword) }
  }

  if (!response.ok) {
    if (response.status === 404) {
      return {
        ok: false,
        code: 'product_not_found',
        message: 'El producto ya no existe en la web (o no es accesible).',
      }
    }
    return {
      ok: false,
      code: 'wc_get_failed',
      message: sanitizeMessage(await parseWcError(response), appUser, appPassword),
    }
  }

  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    return { ok: false, code: 'invalid_response', message: 'Respuesta no parseable de WooCommerce.' }
  }

  const product = parseProductDetailRaw(raw)
  if (!product) {
    return { ok: false, code: 'invalid_response', message: 'Producto sin ID válido en la respuesta.' }
  }
  return { ok: true, product, fetchedAt: new Date().toISOString() }
}

// ── GET plumbing (same shape as taxonomy-sync.ts) ─────────────────────────────

type WcFetchContext = {
  siteUrl: string
  credentials: string
  appUser: string
  appPassword: string
}

async function wcGetPaginated<T>(
  ctx: WcFetchContext,
  path: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const firstPage = await wcGetPage<T>(ctx, path, { ...params, page: '1', per_page: '100' })
  const rows = [...firstPage.data]

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const nextPage = await wcGetPage<T>(ctx, path, {
      ...params,
      page: page.toString(),
      per_page: '100',
    })
    rows.push(...nextPage.data)
  }

  return rows
}

async function wcGetPage<T>(
  ctx: WcFetchContext,
  path: string,
  params: Record<string, string>
): Promise<{ data: T[]; totalPages: number }> {
  const url = new URL(path, ctx.siteUrl)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Basic ${ctx.credentials}`,
      Accept: 'application/json',
    },
    // Always read live state — this screen exists to show the real catalog.
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(await parseWcError(response))
  }

  const data = (await response.json()) as T[]
  const totalPagesHeader = response.headers.get('x-wp-totalpages')
  const totalPages = totalPagesHeader ? Number(totalPagesHeader) : 1

  return {
    data,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  }
}

async function parseWcError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { code?: string; message?: string }
    return `[HTTP ${response.status}] ${body.code ?? 'wc_api_error'}: ${body.message ?? response.statusText}`
  } catch {
    return `[HTTP ${response.status}] ${response.statusText}`
  }
}

function sanitizeMessage(msg: string, user: string, password: string): string {
  let s = msg
  if (user) s = s.replaceAll(user, '[REDACTED]')
  if (password) s = s.replaceAll(password, '[REDACTED]')
  if (user && password) {
    s = s.replaceAll(Buffer.from(`${user}:${password}`).toString('base64'), '[REDACTED]')
  }
  return s.slice(0, 500)
}
