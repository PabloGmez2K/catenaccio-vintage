// WOO_WRITE_SYNC foundation — pure Studio↔Woo diff for the sync panel.
// No I/O. Takes the Studio fields + the live Woo product and derives, per field:
// what Studio has, what the web has, whether they differ, and whether a
// controlled sync action exists for it. Fields without an action are shown as
// information only — the panel never invents writes that don't exist.

import type { ItemStatus, WcSyncStatus } from '@/lib/types'
import type { WooProductDetail } from '@/lib/wc/product-catalog'

export interface WooDiffRow {
  key: 'precio' | 'stock' | 'estado' | 'descripcion'
  label: string
  studioValue: string
  wooValue: string
  differs: boolean
  syncable: boolean
  note?: string
}

export interface WooDiffInput {
  itemStatus: ItemStatus
  wcStatusMirror: WcSyncStatus
  precioPublicadoWeb: number | null
  approvedDescription: string | null
  live: WooProductDetail
}

export interface WooDiffResult {
  rows: WooDiffRow[]
  canSyncPrice: boolean
  canSyncStockOut: boolean
  canSyncDescription: boolean
  canTrashDraft: boolean
  mirrorOutOfDate: boolean
  hasDifferences: boolean
  reviewMessages: string[]
  expectedMirror: WcSyncStatus
}

const WOO_STATUS_LABELS: Record<string, string> = {
  publish: 'Publicado',
  draft: 'Borrador',
  pending: 'Pendiente',
  private: 'Privado',
  trash: 'Papelera',
}

const MIRROR_LABELS: Record<WcSyncStatus, string> = {
  no_sincronizado: 'Sin sincronizar',
  borrador_creado: 'Borrador creado',
  publicado: 'Publicado',
  error_sync: 'Error de sync',
  archivado_wc: 'Archivado en Woo',
}

// Maps the live Woo status onto Studio's local mirror enum.
export function mapWooStatusToMirror(status: WooProductDetail['status']): WcSyncStatus {
  switch (status) {
    case 'publish':
    case 'private':
      return 'publicado'
    case 'trash':
      return 'archivado_wc'
    case 'draft':
    case 'pending':
    default:
      return 'borrador_creado'
  }
}

function euro(value: number | null): string {
  return value != null ? `€${value.toFixed(2)}` : '—'
}

// Compares description content ignoring markup/whitespace differences: Woo wraps
// plain text in <p> and normalizes entities, so a literal compare always differs.
const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  laquo: '«',
  raquo: '»',
}

export function normalizeDescription(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/g, (match, name: string) => NAMED_ENTITIES[name] ?? match)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function buildWooDiff(input: WooDiffInput): WooDiffResult {
  const { live } = input
  const rows: WooDiffRow[] = []
  const reviewMessages: string[] = []

  // ── Precio ──────────────────────────────────────────────────────────────────
  const studioPrice = input.precioPublicadoWeb
  const wooPrice = live.regularPrice
  const priceDiffers =
    studioPrice != null &&
    wooPrice != null &&
    Math.round(studioPrice * 100) !== Math.round(wooPrice * 100)
  const canSyncPrice =
    live.status !== 'trash' &&
    studioPrice != null &&
    studioPrice > 0 &&
    (wooPrice == null || priceDiffers)
  rows.push({
    key: 'precio',
    label: 'Precio',
    studioValue: euro(studioPrice),
    wooValue:
      live.salePrice != null && wooPrice != null
        ? `${euro(wooPrice)} (rebajado a ${euro(live.salePrice)})`
        : euro(wooPrice),
    differs:
      priceDiffers ||
      (studioPrice != null && wooPrice == null) ||
      (studioPrice == null && wooPrice != null),
    syncable: canSyncPrice,
    note:
      live.salePrice != null
        ? 'La web tiene un precio rebajado activo; Studio solo actualiza el precio normal.'
        : studioPrice == null && wooPrice != null
          ? 'Studio no tiene precio web para esta camiseta. Edita la ficha para fijarlo antes de poder sincronizar.'
          : undefined,
  })

  // ── Stock ───────────────────────────────────────────────────────────────────
  const soldOrReserved = input.itemStatus === 'vendida' || input.itemStatus === 'reservada'
  const wooInStock = live.stockStatus === 'instock' || live.stockStatus === 'onbackorder'
  const stockDiffers = soldOrReserved && wooInStock
  const canSyncStockOut = soldOrReserved && wooInStock && live.status !== 'trash'
  if (!soldOrReserved && live.stockStatus === 'outofstock') {
    reviewMessages.push(
      'Revisar: la web esta agotada pero Studio no esta marcado como vendida o reservada. Decide entre registrar venta, mantener activa y reponer Woo, o revisar manualmente.'
    )
  }
  if (soldOrReserved && wooInStock) {
    reviewMessages.push(
      'Studio esta vendida/reservada y la web aun tiene stock. Deja Woo agotado cuando actives esta accion.'
    )
  }
  rows.push({
    key: 'stock',
    label: 'Stock',
    studioValue: soldOrReserved
      ? input.itemStatus === 'vendida'
        ? 'Vendida (debería estar agotada)'
        : 'Reservada (debería estar agotada)'
      : 'A la venta',
    wooValue:
      live.stockStatus === 'instock'
        ? live.manageStock && live.stockQuantity != null
          ? `En stock (${live.stockQuantity})`
          : 'En stock'
        : live.stockStatus === 'outofstock'
          ? 'Agotado'
          : live.stockStatus === 'onbackorder'
            ? 'Reserva'
            : '—',
    differs: stockDiffers || (!soldOrReserved && live.stockStatus === 'outofstock'),
    syncable: canSyncStockOut,
    note:
      !soldOrReserved && live.stockStatus === 'outofstock'
        ? 'Agotado en la web pero activa en Studio: si se vendió, registra la venta desde el panel Venta; si no, repón el stock desde WP Admin.'
        : undefined,
  })

  // ── Estado (informativo — sin acción de publicar/despublicar) ───────────────
  // error_sync also counts as out-of-date: once the underlying problem is fixed
  // (e.g. in WP Admin), «Actualizar estado local» is how the ficha heals.
  const expectedMirror = mapWooStatusToMirror(live.status)
  const mirrorOutOfDate = input.wcStatusMirror !== expectedMirror
  if (mirrorOutOfDate) {
    reviewMessages.push('El estado local guardado no coincide con el estado real de Woo. Actualiza el estado local si la lectura es correcta.')
  }
  rows.push({
    key: 'estado',
    label: 'Estado web',
    studioValue: MIRROR_LABELS[input.wcStatusMirror] ?? input.wcStatusMirror,
    wooValue: WOO_STATUS_LABELS[live.status] ?? live.status,
    differs: mirrorOutOfDate,
    syncable: false,
    note: mirrorOutOfDate
      ? input.wcStatusMirror === 'error_sync'
        ? 'La ficha quedó marcada con un error de sincronización. Si ya está resuelto, actualiza el estado local (no toca la web).'
        : 'El estado guardado en Studio no coincide con la web. Actualiza el estado local (no toca la web).'
      : undefined,
  })

  // ── Descripción ─────────────────────────────────────────────────────────────
  const approved = input.approvedDescription?.trim() || null
  if (approved) {
    const descDiffers = normalizeDescription(approved) !== normalizeDescription(live.description)
    rows.push({
      key: 'descripcion',
      label: 'Descripción',
      studioValue: `Contenido aprobado (${approved.length} caracteres)`,
      wooValue: live.description.trim()
        ? `Contenido en la web (${live.description.length} caracteres)`
        : 'Vacía',
      differs: descDiffers,
      syncable: descDiffers && live.status !== 'trash',
    })
  }

  const hasDifferences = rows.some((row) => row.differs)

  return {
    rows,
    canSyncPrice,
    canSyncStockOut,
    canSyncDescription: approved
      ? normalizeDescription(approved) !== normalizeDescription(live.description) &&
        live.status !== 'trash'
      : false,
    canTrashDraft: live.status === 'draft' || live.status === 'pending',
    mirrorOutOfDate,
    hasDifferences,
    reviewMessages,
    expectedMirror,
  }
}
