// STOCK_MANAGER foundation — pure derivations for the web catalog screen
// (/inventory/woo). No I/O: takes the live Woo catalog + the Studio items and
// produces the linking, the operational counts and the "review first" queue.
// Same philosophy as operational-view.ts: signals for decisions, not a data dump.

import type { WooCatalogProduct } from '@/lib/wc/product-catalog'
import type { ItemStatus, WcSyncStatus } from '@/lib/types'

// The minimal Studio fields the linking needs (subset of inventory_items).
export interface StudioLinkItem {
  id: string
  referencia: string
  status: ItemStatus
  wc_product_id: number | null
  wc_status: WcSyncStatus
}

export interface WooCatalogRow {
  product: WooCatalogProduct
  studio: StudioLinkItem | null
}

export type WooCatalogFilter =
  | 'todos'
  | 'publicados'
  | 'borradores'
  | 'agotados'
  | 'sin_studio'
  | 'vinculados'
  | 'papelera'

export interface StockCounts {
  studioTotal: number
  studioActivos: number // not archivada
  woo: number // non-trash products
  publicados: number
  borradores: number
  papelera: number
  agotados: number // non-trash with stock_status = outofstock
  vinculados: number // non-trash Woo products with a Studio item
  sinVincular: number // non-trash Woo products without a Studio item
  huerfanos: number // Studio items pointing to a Woo id missing from the catalog
}

export interface ReviewEntry {
  key: string
  message: string
  count: number
  filter: WooCatalogFilter | null // null → the issue lives outside this screen's filters
}

export interface StockOverview {
  rows: WooCatalogRow[]
  orphans: StudioLinkItem[]
  counts: StockCounts
  reviewFirst: ReviewEntry[]
}

export function buildStockOverview(
  products: WooCatalogProduct[],
  studioItems: StudioLinkItem[]
): StockOverview {
  const studioByWcId = new Map<number, StudioLinkItem>()
  for (const item of studioItems) {
    if (item.wc_product_id != null) studioByWcId.set(item.wc_product_id, item)
  }

  const rows: WooCatalogRow[] = products.map((product) => ({
    product,
    studio: studioByWcId.get(product.id) ?? null,
  }))

  const wooIds = new Set(products.map((p) => p.id))
  const orphans = studioItems.filter(
    (item) => item.wc_product_id != null && !wooIds.has(item.wc_product_id)
  )

  const nonTrash = rows.filter((r) => r.product.status !== 'trash')

  const counts: StockCounts = {
    studioTotal: studioItems.length,
    studioActivos: studioItems.filter((i) => i.status !== 'archivada').length,
    woo: nonTrash.length,
    publicados: nonTrash.filter((r) => r.product.status === 'publish').length,
    borradores: nonTrash.filter(
      (r) => r.product.status === 'draft' || r.product.status === 'pending'
    ).length,
    papelera: rows.length - nonTrash.length,
    agotados: nonTrash.filter((r) => r.product.stockStatus === 'outofstock').length,
    vinculados: nonTrash.filter((r) => r.studio !== null).length,
    sinVincular: nonTrash.filter((r) => r.studio === null).length,
    huerfanos: orphans.length,
  }

  return { rows, orphans, counts, reviewFirst: buildReviewFirst(rows, orphans, studioItems) }
}

export function filterRows(rows: WooCatalogRow[], filter: WooCatalogFilter): WooCatalogRow[] {
  switch (filter) {
    case 'publicados':
      return rows.filter((r) => r.product.status === 'publish')
    case 'borradores':
      return rows.filter(
        (r) => r.product.status === 'draft' || r.product.status === 'pending'
      )
    case 'agotados':
      return rows.filter(
        (r) => r.product.status !== 'trash' && r.product.stockStatus === 'outofstock'
      )
    case 'sin_studio':
      return rows.filter((r) => r.product.status !== 'trash' && r.studio === null)
    case 'vinculados':
      return rows.filter((r) => r.product.status !== 'trash' && r.studio !== null)
    case 'papelera':
      return rows.filter((r) => r.product.status === 'trash')
    case 'todos':
    default:
      return rows.filter((r) => r.product.status !== 'trash')
  }
}

// Ordered attention queue: what Pablo should look at first, most urgent on top.
// Deliberately short — only real signals, no padding.
function buildReviewFirst(
  rows: WooCatalogRow[],
  orphans: StudioLinkItem[],
  studioItems: StudioLinkItem[]
): ReviewEntry[] {
  const entries: ReviewEntry[] = []

  const syncErrors = studioItems.filter((i) => i.wc_status === 'error_sync').length
  if (syncErrors > 0) {
    entries.push({
      key: 'sync_errors',
      message: 'Camisetas de Studio con error de sincronización con la web',
      count: syncErrors,
      filter: null,
    })
  }

  if (orphans.length > 0) {
    entries.push({
      key: 'orphans',
      message: 'Camisetas de Studio que apuntan a un producto que ya no aparece en la web',
      count: orphans.length,
      filter: null,
    })
  }

  const publishedOut = rows.filter(
    (r) => r.product.status === 'publish' && r.product.stockStatus === 'outofstock'
  ).length
  if (publishedOut > 0) {
    entries.push({
      key: 'published_out',
      message: 'Publicados en la web pero agotados — confirmar si están vendidos en Studio',
      count: publishedOut,
      filter: 'agotados',
    })
  }

  const unlinked = rows.filter((r) => r.product.status !== 'trash' && r.studio === null).length
  if (unlinked > 0) {
    entries.push({
      key: 'unlinked',
      message: 'Productos de la web sin ficha en Studio — inventario sin control',
      count: unlinked,
      filter: 'sin_studio',
    })
  }

  const drafts = rows.filter(
    (r) => r.product.status === 'draft' || r.product.status === 'pending'
  ).length
  if (drafts > 0) {
    entries.push({
      key: 'drafts',
      message: 'Borradores pendientes de revisar y publicar en WP Admin',
      count: drafts,
      filter: 'borradores',
    })
  }

  return entries
}
