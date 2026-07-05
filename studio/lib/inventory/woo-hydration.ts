// Woo → Studio hydration built on the canonical sync contract
// (lib/inventory/woo-studio-sync-contract.ts). This module turns a resolved
// WooExtraction into the exact Studio writes for linking / rehydrating a ficha:
// referencia, initial status, web price, detail fields, internal notes, the
// wc_payload_snapshot and the lifecycle-event payload. All field mapping and
// term/ID resolution lives in the contract — nothing is resolved here.

import { mapWooStatusToMirror } from '@/lib/inventory/woo-diff'
import {
  extractWooProduct,
  inferSizeFromTitle,
  isNumericToken,
  WOO_SYNC_CONTRACT_VERSION,
  type HydratedDetailValues,
  type WooExtraction,
} from '@/lib/inventory/woo-studio-sync-contract'
import type { WooProductDetail } from '@/lib/wc/product-catalog'
import type { CachedTermsBySlug } from '@/lib/wc/term-cache'
import type { ItemStatus, WcCategoryCacheRow } from '@/lib/types'

export const WOO_LINK_HYDRATION_VERSION = 'woo_link_hydration_v4'

export { isNumericToken }

// 'link' = new ficha created from a Woo product (cost is a technical 0 placeholder).
// 'rehydrate' = existing ficha, possibly manual with a real cost.
export type HydrationPurpose = 'link' | 'rehydrate'

export type WooHydrationResult = {
  referencia: string
  status: ItemStatus
  webPrice: number | null
  inferredSize: string | null
  details: HydratedDetailValues
  extraction: WooExtraction
  notes: string
  snapshot: Record<string, unknown>
  eventPayload: Record<string, unknown>
}

function initialStudioStatus(live: WooProductDetail): ItemStatus {
  if (live.status === 'publish') {
    return live.stockStatus === 'outofstock' ? 'reservada' : 'publicada_web'
  }
  return 'borrador_web'
}

function stockSummary(live: WooProductDetail): string {
  if (live.stockStatus === 'instock') {
    return live.manageStock && live.stockQuantity != null
      ? `en stock (${live.stockQuantity})`
      : 'en stock'
  }
  if (live.stockStatus === 'outofstock') return 'agotado'
  if (live.stockStatus === 'onbackorder') return 'en reserva'
  return 'desconocido'
}

function buildInternalNotes(
  live: WooProductDetail,
  extraction: WooExtraction,
  purpose: HydrationPurpose
): string {
  const price = live.regularPrice ?? live.price
  const lines = [
    `Ficha hidratada desde Woo (${WOO_LINK_HYDRATION_VERSION} / ${WOO_SYNC_CONTRACT_VERSION}).`,
    // Only a fresh link creates the technical cost=0 placeholder; a rehydrated
    // ficha may already carry Pablo's real cost, so the line would be wrong.
    ...(purpose === 'link'
      ? ['Coste pendiente tras importacion desde Woo: el 0 tecnico no es coste real.']
      : []),
    `Web al hidratar: estado ${live.status}, stock ${stockSummary(live)}${
      price != null ? `, precio EUR ${price.toFixed(2)}` : ''
    }.`,
  ]

  if (live.status === 'publish' && live.stockStatus === 'outofstock') {
    lines.push('Revisar: la web esta publicada pero agotada; Studio no la marca como activa normal.')
  }
  if (live.images.length > 0) {
    lines.push(
      `Imagenes web disponibles desde Woo: ${live.images.length}. No se han copiado a Fotos Studio automaticamente.`
    )
  }
  // Talla inferida del título ya llega vía extraction.pendingNotes — no se duplica aquí.
  if (live.categories.length > 0) {
    lines.push(`Categorias Woo: ${live.categories.map((c) => c.name).join(', ')}.`)
  }
  if (extraction.pendingNotes.length > 0) {
    lines.push(...extraction.pendingNotes)
  }
  if (extraction.unmappedAttributes.length > 0) {
    lines.push(
      `Atributos Woo sin mapear (visibles en la ficha, no se pierden): ${extraction.unmappedAttributes
        .map((a) => `${a.name}${a.options.length > 0 ? `=${a.options.join('/')}` : ''}`)
        .join('; ')}.`
    )
  }
  if (extraction.unmappedMeta.length > 0) {
    lines.push(
      `Meta Woo sin destino Studio: ${extraction.unmappedMeta.map((m) => m.key).join(', ')}.`
    )
  }

  lines.push(
    'Pendiente de completar/revisar: coste real, fecha de compra real y detalles que Woo no aporte con evidencia.'
  )
  return lines.join('\n')
}

export function buildWooHydration(
  live: WooProductDetail,
  terms: CachedTermsBySlug,
  categories: WcCategoryCacheRow[],
  hydratedAt: string = new Date().toISOString(),
  purpose: HydrationPurpose = 'link'
): WooHydrationResult {
  const referencia = live.name.trim().slice(0, 200) || `Producto web ${live.id}`
  const extraction = extractWooProduct(live, terms, categories)
  const inferredSize =
    extraction.fields.talla.origin === 'title_inference'
      ? extraction.fields.talla.display
      : inferSizeFromTitle(referencia)

  const f = extraction.fields
  const details: HydratedDetailValues = {
    liga: f.liga.termId,
    liga_display: f.liga.display,
    equipo: f.equipo.termId ?? '',
    equipo_display: f.equipo.display,
    temporada: f.temporada.termId ?? '',
    temporada_display: f.temporada.display,
    talla: f.talla.display ?? '',
    condicion: f.condicion.display ?? '',
    marca: f.marca.termId,
    marca_display: f.marca.display,
    categoria: extraction.categoryId,
    categoria_display: extraction.categoryDisplay,
    jugador: f.jugador.termId,
    jugador_display: f.jugador.display,
    largo_cm: extraction.largoCm,
    ancho_cm: extraction.anchoCm,
    condicion_notas: extraction.defectos,
    sponsor: extraction.sponsor,
  }

  const webPrice = live.regularPrice ?? live.price

  const snapshot = {
    source: WOO_LINK_HYDRATION_VERSION,
    contract_version: WOO_SYNC_CONTRACT_VERSION,
    imported_at: hydratedAt,
    woo: {
      id: live.id,
      status: live.status,
      stock_status: live.stockStatus,
      stock_quantity: live.stockQuantity,
      manage_stock: live.manageStock,
      price: live.price,
      regular_price: live.regularPrice,
      sale_price: live.salePrice,
      permalink: live.permalink,
      image_src: live.imageSrc,
      images: live.images,
      categories: live.categories,
      attributes: live.attributes,
      resolved_fields: Object.fromEntries(
        Object.values(extraction.fields).map((field) => [
          field.key,
          { id: field.termId, display: field.display, origin: field.origin },
        ])
      ),
      measures: { ancho_cm: extraction.anchoCm, largo_cm: extraction.largoCm },
      defectos: extraction.defectos,
      sponsor: extraction.sponsor,
      unmapped_attributes: extraction.unmappedAttributes,
      unmapped_meta: extraction.unmappedMeta,
      pending_notes: extraction.pendingNotes,
    },
  }

  return {
    referencia,
    status: initialStudioStatus(live),
    webPrice,
    inferredSize,
    details,
    extraction,
    notes: buildInternalNotes(live, extraction, purpose),
    snapshot,
    eventPayload: {
      wc_product_id: live.id,
      estado_web: live.status,
      stock_web: live.stockStatus,
      precio_web: webPrice,
      imagen_web_disponible: live.imageSrc != null,
      imagenes_web: live.images.length,
      import_version: WOO_LINK_HYDRATION_VERSION,
      contract_version: WOO_SYNC_CONTRACT_VERSION,
      wc_status: mapWooStatusToMirror(live.status),
      pending_term_notes: extraction.pendingNotes,
      unmapped_attributes: extraction.unmappedAttributes.length,
      unmapped_meta: extraction.unmappedMeta.length,
    },
  }
}
