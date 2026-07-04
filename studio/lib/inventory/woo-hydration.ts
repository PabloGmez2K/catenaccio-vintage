import { mapWooStatusToMirror } from '@/lib/inventory/woo-diff'
import type { WooProductDetail } from '@/lib/wc/product-catalog'
import type { CachedTaxonomySlug, CachedTermsBySlug } from '@/lib/wc/term-cache'
import type { ItemStatus, WcCategoryCacheRow } from '@/lib/types'

export const WOO_LINK_HYDRATION_VERSION = 'woo_link_hydration_v3'

type ResolvedTerm = {
  id: string | null
  display: string | null
  note: string | null
}

type HydratedDetails = {
  liga: string | null
  liga_display: string | null
  equipo: string
  equipo_display: string | null
  temporada: string
  temporada_display: string | null
  talla: string
  condicion: string
  marca_display: string | null
  categoria: number | null
  categoria_display: string | null
  jugador: string | null
  jugador_display: string | null
  largo_cm: number | null
  ancho_cm: number | null
}

export type WooHydrationResult = {
  referencia: string
  status: ItemStatus
  webPrice: number | null
  inferredSize: string | null
  details: HydratedDetails
  notes: string
  snapshot: Record<string, unknown>
  eventPayload: Record<string, unknown>
}

export function isNumericToken(value: string | null | undefined): boolean {
  return value != null && /^\d+$/.test(value.trim())
}

function metaText(meta: WooProductDetail['metaData'], key: string): string | null {
  const value = meta[key]
  if (typeof value === 'string') return value.trim() || null
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (Array.isArray(value)) {
    const first = value.find((v) => typeof v === 'string' || typeof v === 'number')
    return first != null ? String(first).trim() || null : null
  }
  return null
}

function metaNumber(meta: WooProductDetail['metaData'], key: string): number | null {
  const raw = metaText(meta, key)
  if (!raw) return null
  const normalized = raw.replace(',', '.').replace(/\s*cm\s*$/i, '').trim()
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

function inferSizeFromTitle(title: string): string | null {
  const match = title.match(/\(([A-Z0-9]{1,5}(?:\/[A-Z0-9]{1,5})?)\)\s*$/i)
  return match ? match[1].toUpperCase() : null
}

function comparable(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function attributeOption(live: WooProductDetail, needles: string[]): string | null {
  const normalizedNeedles = needles.map(comparable)
  const attr = live.attributes.find((a) => {
    const slug = comparable(a.slug ?? '')
    const name = comparable(a.name)
    return normalizedNeedles.some(
      (needle) => slug === needle || slug.endsWith(`_${needle}`) || name === needle || name.includes(needle)
    )
  })
  return attr?.options.find((option) => option.trim())?.trim() ?? null
}

function resolveTerm(
  terms: CachedTermsBySlug,
  taxonomySlug: CachedTaxonomySlug,
  rawMetaValue: string | null,
  attributeDisplay: string | null,
  label: string
): ResolvedTerm {
  const cached = terms[taxonomySlug] ?? []
  const meta = rawMetaValue?.trim() || null
  const displayFromAttribute = attributeDisplay?.trim() || null

  if (meta && isNumericToken(meta)) {
    const cachedMatch = cached.find((t) => t.id.toString() === meta)
    if (cachedMatch) {
      return { id: cachedMatch.id.toString(), display: cachedMatch.name, note: null }
    }
    if (displayFromAttribute) {
      const attrMatch = cached.find((t) => t.name.toLowerCase() === displayFromAttribute.toLowerCase())
      return {
        id: attrMatch?.id.toString() ?? null,
        display: displayFromAttribute,
        note: attrMatch ? null : `${label}: Woo trae ID ${meta}; resuelto por atributo, pendiente de cache.`,
      }
    }
    return {
      id: null,
      display: null,
      note: `${label}: Woo trae ID ${meta}, pero no existe en la cache wc_terms. Campo dejado pendiente.`,
    }
  }

  const display = displayFromAttribute ?? meta
  if (!display) return { id: null, display: null, note: null }

  const cachedMatch = cached.find(
    (t) => t.name.toLowerCase() === display.toLowerCase() || t.slug.toLowerCase() === display.toLowerCase()
  )
  return { id: cachedMatch?.id.toString() ?? null, display, note: cachedMatch ? null : null }
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

function buildInternalNotes(live: WooProductDetail, inferredSize: string | null, pendingNotes: string[]): string {
  const price = live.regularPrice ?? live.price
  const lines = [
    `Ficha hidratada desde Woo (${WOO_LINK_HYDRATION_VERSION}).`,
    'Coste pendiente tras importacion desde Woo: el 0 tecnico no es coste real.',
    `Web al hidratar: estado ${live.status}, stock ${stockSummary(live)}${
      price != null ? `, precio EUR ${price.toFixed(2)}` : ''
    }.`,
  ]

  if (live.status === 'publish' && live.stockStatus === 'outofstock') {
    lines.push('Revisar: la web esta publicada pero agotada; Studio no la marca como activa normal.')
  }
  if (live.images.length > 0) {
    lines.push(`Imagenes web disponibles desde Woo: ${live.images.length}. No se han copiado a Fotos Studio automaticamente.`)
  }
  if (inferredSize) {
    lines.push(`Talla inferida del titulo: ${inferredSize}. Revisar antes de publicar cambios.`)
  }
  if (live.categories.length > 0) {
    lines.push(`Categorias Woo: ${live.categories.map((c) => c.name).join(', ')}.`)
  }
  if (live.attributes.length > 0) {
    lines.push(
      `Atributos Woo: ${live.attributes
        .map((a) => `${a.name}${a.options.length > 0 ? `=${a.options.join('/')}` : ''}`)
        .join('; ')}.`
    )
  }
  if (pendingNotes.length > 0) {
    lines.push(...pendingNotes)
  }

  const usefulMetaKeys = ['liga', 'equipo', 'ano_temporada', 'talla', 'condicion', 'marca', 'medida_axila', 'medida_largo', 'jugador'].filter(
    (key) => metaText(live.metaData, key) != null
  )
  if (usefulMetaKeys.length > 0) {
    lines.push(`Meta Woo importable detectada: ${usefulMetaKeys.join(', ')}.`)
  }

  lines.push('Pendiente de completar/revisar: coste real, fecha de compra real y detalles que Woo no aporte con evidencia.')
  return lines.join('\n')
}

export function buildWooHydration(
  live: WooProductDetail,
  terms: CachedTermsBySlug,
  categories: WcCategoryCacheRow[],
  hydratedAt: string = new Date().toISOString()
): WooHydrationResult {
  const referencia = live.name.trim().slice(0, 200) || `Producto web ${live.id}`
  const inferredSize = inferSizeFromTitle(referencia)
  const importedSize = metaText(live.metaData, 'talla') ?? inferredSize ?? ''
  const conditionMeta = metaText(live.metaData, 'condicion')
  const conditionAttribute = attributeOption(live, ['condicion', 'condition'])
  const conditionDisplay =
    conditionAttribute && !isNumericToken(conditionAttribute) ? conditionAttribute : null
  const importedCondition =
    conditionDisplay ?? (conditionMeta && !isNumericToken(conditionMeta) ? conditionMeta : '')
  const brandMeta = metaText(live.metaData, 'marca')
  const brandAttribute = attributeOption(live, ['marca', 'brand', 'fabricante'])
  const brandDisplay = brandAttribute && !isNumericToken(brandAttribute) ? brandAttribute : null
  const importedBrand = brandDisplay ?? (brandMeta && !isNumericToken(brandMeta) ? brandMeta : null)
  const anchoCm = metaNumber(live.metaData, 'medida_axila')
  const largoCm = metaNumber(live.metaData, 'medida_largo')
  const category = live.categories.find((cat) => cat.id > 0) ?? null
  const cachedCategory = category ? categories.find((c) => c.id === category.id) : null

  const league = resolveTerm(terms, 'pa_liga', metaText(live.metaData, 'liga'), attributeOption(live, ['liga']), 'Liga')
  const team = resolveTerm(terms, 'pa_equipo', metaText(live.metaData, 'equipo'), attributeOption(live, ['equipo']), 'Equipo')
  const season = resolveTerm(
    terms,
    'pa_ano',
    metaText(live.metaData, 'ano_temporada'),
    attributeOption(live, ['ano', 'temporada']),
    'Temporada'
  )
  const player = resolveTerm(
    terms,
    'pa_jugador',
    metaText(live.metaData, 'jugador'),
    attributeOption(live, ['jugador']),
    'Jugador'
  )
  const conditionRawId =
    conditionMeta && isNumericToken(conditionMeta)
      ? conditionMeta
      : conditionAttribute && isNumericToken(conditionAttribute)
        ? conditionAttribute
        : null
  const brandRawId =
    brandMeta && isNumericToken(brandMeta)
      ? brandMeta
      : brandAttribute && isNumericToken(brandAttribute)
        ? brandAttribute
        : null
  const conditionNote =
    conditionRawId && !conditionDisplay
      ? `Condicion: Woo trae ID ${conditionRawId}, pero no hay nombre de atributo en el payload. Campo dejado pendiente.`
      : null
  const brandNote =
    brandRawId && !brandDisplay
      ? `Marca: Woo trae ID ${brandRawId}, pero no hay nombre de atributo en el payload. Campo dejado pendiente.`
      : null
  const measureNotes = [
    metaText(live.metaData, 'medida_axila') && anchoCm == null
      ? `Ancho: Woo trae "${metaText(live.metaData, 'medida_axila')}", pero no es numerico. Campo dejado pendiente.`
      : null,
    metaText(live.metaData, 'medida_largo') && largoCm == null
      ? `Largo: Woo trae "${metaText(live.metaData, 'medida_largo')}", pero no es numerico. Campo dejado pendiente.`
      : null,
  ]
  const pendingNotes = [league.note, team.note, season.note, player.note, conditionNote, brandNote, ...measureNotes].filter(
    (note): note is string => Boolean(note)
  )

  const webPrice = live.regularPrice ?? live.price
  const details: HydratedDetails = {
    liga: league.id,
    liga_display: league.display,
    equipo: team.id ?? '',
    equipo_display: team.display,
    temporada: season.id ?? '',
    temporada_display: season.display,
    talla: importedSize,
    condicion: isNumericToken(importedCondition) ? '' : importedCondition,
    marca_display: importedBrand,
    categoria: category?.id ?? null,
    categoria_display: cachedCategory?.name ?? category?.name ?? null,
    jugador: player.id,
    jugador_display: player.display,
    largo_cm: largoCm,
    ancho_cm: anchoCm,
  }

  const snapshot = {
    source: WOO_LINK_HYDRATION_VERSION,
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
      meta_subset: {
        liga: metaText(live.metaData, 'liga'),
        equipo: metaText(live.metaData, 'equipo'),
        ano_temporada: metaText(live.metaData, 'ano_temporada'),
        talla: importedSize || null,
        condicion: importedCondition || null,
        marca: importedBrand,
        medida_axila: metaText(live.metaData, 'medida_axila'),
        medida_largo: metaText(live.metaData, 'medida_largo'),
        jugador: metaText(live.metaData, 'jugador'),
      },
      resolved_terms: {
        liga: { id: details.liga, display: details.liga_display },
        equipo: { id: details.equipo || null, display: details.equipo_display },
        temporada: { id: details.temporada || null, display: details.temporada_display },
        jugador: { id: details.jugador, display: details.jugador_display },
      },
    },
  }

  return {
    referencia,
    status: initialStudioStatus(live),
    webPrice,
    inferredSize,
    details,
    notes: buildInternalNotes(live, inferredSize, pendingNotes),
    snapshot,
    eventPayload: {
      wc_product_id: live.id,
      estado_web: live.status,
      stock_web: live.stockStatus,
      precio_web: webPrice,
      imagen_web_disponible: live.imageSrc != null,
      imagenes_web: live.images.length,
      import_version: WOO_LINK_HYDRATION_VERSION,
      wc_status: mapWooStatusToMirror(live.status),
      pending_term_notes: pendingNotes,
    },
  }
}
