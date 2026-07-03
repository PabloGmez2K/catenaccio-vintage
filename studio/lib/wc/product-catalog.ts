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
  images?: Array<{ id?: number; src?: string }>
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
  }
}

function parsePrice(value: string | undefined): number | null {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
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
  return s.slice(0, 500)
}
