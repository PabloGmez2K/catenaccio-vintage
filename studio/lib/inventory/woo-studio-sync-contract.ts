// STUDIO_WOO_SYNC_CONTRACT — canonical Woo ↔ Studio field mapper.
//
// Single source of truth for:
//   1. Which WooCommerce taxonomies/meta map to which Studio fields (Woo → Studio).
//   2. How a raw Woo product payload resolves to human Studio values (never raw IDs).
//   3. Which Woo data has NO Studio destination yet (kept visible, never lost).
//   4. Which Studio fields can be written back to Woo today, which can only be
//      diffed, and which need reverse mapping / a product decision first.
//   5. The rehydration policy: what a re-import may fill and what it must never
//      overwrite (manual human values).
//
// Store contract evidence (probe S007, product 1731 audit S022C.5, bridge v2.2):
//   - 7 global attribute taxonomies: pa_talla(1), pa_condicion(2), pa_marca(3),
//     pa_equipo(4), pa_liga(5), pa_jugador(6), pa_ano(7).
//   - Operative values live in ACF meta_data: liga/equipo/jugador = term IDs,
//     ano_temporada = term-ID array, talla/condicion = plain strings,
//     medida_axila/medida_largo = numeric strings, defectos +
//     descripcion_del_producto = free text. '_'-prefixed keys are ACF field refs.
//   - attributes[] carries term names for products created by the Studio bridge
//     (liga/equipo/año/jugador since S022C.8) and possibly for hand-edited ones.
//
// Pure module: no I/O, no Supabase, no fetch. Callers load the term/category
// caches and pass them in.

import type { WooProductDetail } from '@/lib/wc/product-catalog'
import type { CachedTermsBySlug } from '@/lib/wc/term-cache'
import type { WcCategoryCacheRow, WcTermCacheRow } from '@/lib/types'

export const WOO_SYNC_CONTRACT_VERSION = 'woo_studio_sync_contract_v1'

// ── Shared value helpers ───────────────────────────────────────────────────────

export function isNumericToken(value: string | null | undefined): boolean {
  return value != null && /^\d+$/.test(value.trim())
}

// True when the value is real human text (non-empty, not a raw numeric ID).
export function hasHumanText(value: string | null | undefined): boolean {
  return Boolean(value?.trim()) && !isNumericToken(value)
}

function comparable(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// ── Taxonomy contract (the 7 store taxonomies) ────────────────────────────────

export type WooTaxonomyKey =
  | 'liga'
  | 'equipo'
  | 'temporada'
  | 'jugador'
  | 'talla'
  | 'condicion'
  | 'marca'

export type ContractTaxonomySlug = WcTermCacheRow['taxonomy_slug']

export interface WooTaxonomyContractEntry {
  key: WooTaxonomyKey
  label: string
  /** WooCommerce global attribute id (products/attributes). */
  wooAttributeId: number
  taxonomySlug: ContractTaxonomySlug
  /** ACF meta key on the product payload. */
  metaKey: string
  /** How the store encodes the meta value. */
  metaFormat: 'term_id' | 'term_id_array' | 'string'
  /** football_shirt_details column holding the Woo term id ('' allowed). null = Studio stores no id. */
  studioIdField: 'liga' | 'equipo' | 'temporada' | 'jugador' | 'marca' | null
  /** football_shirt_details column holding the human value. */
  studioDisplayField:
    | 'liga_display'
    | 'equipo_display'
    | 'temporada_display'
    | 'jugador_display'
    | 'marca_display'
    | 'talla'
    | 'condicion'
  /** Extra needles for matching the product attribute by name (fallback path). */
  attributeNameNeedles: string[]
}

export const WOO_TAXONOMY_CONTRACT: WooTaxonomyContractEntry[] = [
  {
    key: 'liga',
    label: 'Liga',
    wooAttributeId: 5,
    taxonomySlug: 'pa_liga',
    metaKey: 'liga',
    metaFormat: 'term_id',
    studioIdField: 'liga',
    studioDisplayField: 'liga_display',
    attributeNameNeedles: ['liga', 'league'],
  },
  {
    key: 'equipo',
    label: 'Equipo',
    wooAttributeId: 4,
    taxonomySlug: 'pa_equipo',
    metaKey: 'equipo',
    metaFormat: 'term_id',
    studioIdField: 'equipo',
    studioDisplayField: 'equipo_display',
    attributeNameNeedles: ['equipo', 'team', 'club'],
  },
  {
    key: 'temporada',
    label: 'Temporada',
    wooAttributeId: 7,
    taxonomySlug: 'pa_ano',
    metaKey: 'ano_temporada',
    metaFormat: 'term_id_array',
    studioIdField: 'temporada',
    studioDisplayField: 'temporada_display',
    attributeNameNeedles: ['ano', 'año', 'temporada', 'season', 'year'],
  },
  {
    key: 'jugador',
    label: 'Jugador',
    wooAttributeId: 6,
    taxonomySlug: 'pa_jugador',
    metaKey: 'jugador',
    metaFormat: 'term_id',
    studioIdField: 'jugador',
    studioDisplayField: 'jugador_display',
    attributeNameNeedles: ['jugador', 'player'],
  },
  {
    key: 'talla',
    label: 'Talla',
    wooAttributeId: 1,
    taxonomySlug: 'pa_talla',
    metaKey: 'talla',
    metaFormat: 'string',
    studioIdField: null,
    studioDisplayField: 'talla',
    attributeNameNeedles: ['talla', 'size'],
  },
  {
    key: 'condicion',
    label: 'Condición',
    wooAttributeId: 2,
    taxonomySlug: 'pa_condicion',
    metaKey: 'condicion',
    metaFormat: 'string',
    studioIdField: null,
    studioDisplayField: 'condicion',
    attributeNameNeedles: ['condicion', 'condición', 'condition', 'estado'],
  },
  {
    key: 'marca',
    label: 'Marca',
    wooAttributeId: 3,
    taxonomySlug: 'pa_marca',
    metaKey: 'marca',
    metaFormat: 'string',
    studioIdField: 'marca',
    studioDisplayField: 'marca_display',
    attributeNameNeedles: ['marca', 'brand', 'fabricante'],
  },
]

// ── Meta (ACF) contract beyond the taxonomies ─────────────────────────────────

export interface WooMetaContractEntry {
  metaKey: string
  label: string
  /** Where the value lands in Studio. 'seo_base' = shown as Manual SEO base, never auto-approved. */
  studioTarget: 'ancho_cm' | 'largo_cm' | 'condicion_notas' | 'sponsor' | 'seo_base'
  format: 'number_cm' | 'text' | 'html'
}

export const WOO_META_CONTRACT: WooMetaContractEntry[] = [
  { metaKey: 'medida_axila', label: 'Ancho (axila a axila)', studioTarget: 'ancho_cm', format: 'number_cm' },
  { metaKey: 'medida_largo', label: 'Largo', studioTarget: 'largo_cm', format: 'number_cm' },
  { metaKey: 'defectos', label: 'Defectos', studioTarget: 'condicion_notas', format: 'text' },
  { metaKey: 'patrocinador', label: 'Patrocinador', studioTarget: 'sponsor', format: 'text' },
  { metaKey: 'sponsor', label: 'Sponsor', studioTarget: 'sponsor', format: 'text' },
  // descripcion_del_producto duplicates the root description for the store filter
  // plugin; the root description is the canonical SEO base.
  { metaKey: 'descripcion_del_producto', label: 'Descripción (ACF)', studioTarget: 'seo_base', format: 'html' },
]

// Meta keys Studio understands (mapped above or handled at product-root level).
const KNOWN_META_KEYS = new Set<string>([
  ...WOO_TAXONOMY_CONTRACT.map((e) => e.metaKey),
  ...WOO_META_CONTRACT.map((e) => e.metaKey),
  'rank_math_primary_product_cat', // written by the Studio bridge
])

// ── Studio → Woo readiness (what can be written back, and how) ────────────────

export type SyncCapability =
  | 'sync_now' // controlled action exists today (preview + confirm + log)
  | 'diff_only' // Studio can compare, but no write action exists yet
  | 'needs_reverse_mapping' // requires resolved term IDs / attribute writes before any PUT
  | 'needs_media_sync' // requires the media sync block (not built)
  | 'manual_decision' // no store destination agreed — product decision needed
  | 'blocked_by_design' // Studio will never do this

export const SYNC_CAPABILITY_LABELS: Record<SyncCapability, string> = {
  sync_now: 'Sincronizable ahora',
  diff_only: 'Solo comparación',
  needs_reverse_mapping: 'Requiere mapping inverso',
  needs_media_sync: 'Requiere sync de fotos',
  manual_decision: 'Requiere decisión',
  blocked_by_design: 'Bloqueado por diseño',
}

export interface StudioToWooReadinessRow {
  field: string
  capability: SyncCapability
  detail: string
}

export const STUDIO_TO_WOO_READINESS: StudioToWooReadinessRow[] = [
  {
    field: 'Precio web',
    capability: 'sync_now',
    detail: 'PUT regular_price con doble verificación previa (vista previa vs vivo).',
  },
  {
    field: 'Stock (dejar agotada)',
    capability: 'sync_now',
    detail: 'PUT stock_status=outofstock solo para vendida/reservada. Nunca despublica.',
  },
  {
    field: 'Descripción aprobada',
    capability: 'sync_now',
    detail: 'PUT description desde el contenido SEO aprobado, re-verificando ambos lados.',
  },
  {
    field: 'Borrador → papelera',
    capability: 'sync_now',
    detail: 'DELETE force=false reversible, solo borradores/pendientes, con veto.',
  },
  {
    field: 'Título',
    capability: 'diff_only',
    detail: 'PUT name fuera de la whitelist actual. Ampliar con preview en un bloque futuro.',
  },
  {
    field: 'Talla / Condición / Medidas / Defectos',
    capability: 'diff_only',
    detail: 'Viven en meta_data ACF. El PUT de meta_data no está en la whitelist todavía.',
  },
  {
    field: 'Equipo / Temporada / Liga / Jugador',
    capability: 'needs_reverse_mapping',
    detail:
      'Requieren term ID resuelto + escritura de meta ACF y attributes[]. El término debe existir en Woo (creación controlada disponible).',
  },
  {
    field: 'Marca',
    capability: 'manual_decision',
    detail:
      'La tienda no guarda marca en los productos (pa_marca existe sin uso en meta). Decidir destino antes de escribir.',
  },
  {
    field: 'Categoría',
    capability: 'diff_only',
    detail: 'PUT categories fuera de la whitelist. La categoría se fija hoy al crear el borrador.',
  },
  {
    field: 'Fotos Studio → Woo',
    capability: 'needs_media_sync',
    detail:
      'El attach solo ocurre al crear el borrador (flag S026B). Sync posterior de galería no implementado.',
  },
  {
    field: 'Publicar / despublicar / borrado definitivo',
    capability: 'blocked_by_design',
    detail: 'status nunca se envía por PUT y no existe force=true. Se hace en WP Admin.',
  },
]

// ── Extraction: raw Woo payload → resolved Studio-shaped values ───────────────

export type WooFieldOrigin =
  | 'meta_term_cache' // numeric meta ID resolved against wc_terms
  | 'attribute_option' // human name taken from the product attributes[]
  | 'meta_string' // plain string meta (talla/condicion contract)
  | 'title_inference' // inferred from the product title (talla only)
  | 'unresolved' // Woo has something but no safe human value
  | 'absent' // Woo has nothing for this field

export interface ResolvedWooField {
  key: WooTaxonomyKey
  label: string
  /** Woo term id as string when known (from meta or cache lookup by name). */
  termId: string | null
  /** Human value. NEVER a raw numeric ID. */
  display: string | null
  origin: WooFieldOrigin
  /** Pending-mapping note for internal notes / UI. */
  note: string | null
}

export interface UnmappedAttribute {
  name: string
  options: string[]
}

export interface UnmappedMeta {
  key: string
  preview: string
}

export interface WooExtraction {
  fields: Record<WooTaxonomyKey, ResolvedWooField>
  anchoCm: number | null
  largoCm: number | null
  defectos: string | null
  sponsor: string | null
  categoryId: number | null
  categoryDisplay: string | null
  /** Woo attributes with no contract destination. Visible, never lost. */
  unmappedAttributes: UnmappedAttribute[]
  /** Woo meta keys with no contract destination ('_' ACF refs excluded). */
  unmappedMeta: UnmappedMeta[]
  /** All pending-mapping notes, ready for internal notes. */
  pendingNotes: string[]
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

export function inferSizeFromTitle(title: string): string | null {
  const match = title.match(/\(([A-Z0-9]{1,5}(?:\/[A-Z0-9]{1,5})?)\)\s*$/i)
  return match ? match[1].toUpperCase() : null
}

// Finds the product attribute for a contract entry: id match first, then exact
// slug, then normalized-name match against the entry's needles.
function findContractAttribute(
  live: WooProductDetail,
  entry: WooTaxonomyContractEntry
): WooProductDetail['attributes'][number] | null {
  const byId = live.attributes.find((a) => a.id === entry.wooAttributeId)
  if (byId) return byId
  const bySlug = live.attributes.find((a) => {
    const slug = comparable(a.slug ?? '')
    return slug === entry.taxonomySlug || slug === entry.taxonomySlug.replace(/^pa_/, '')
  })
  if (bySlug) return bySlug
  const needles = entry.attributeNameNeedles.map(comparable)
  return (
    live.attributes.find((a) => {
      const name = comparable(a.name)
      return needles.some((n) => name === n || name.includes(n))
    }) ?? null
  )
}

function cacheById(terms: WcTermCacheRow[] | undefined, id: string): WcTermCacheRow | null {
  if (!terms) return null
  return terms.find((t) => t.id.toString() === id.trim()) ?? null
}

function cacheByName(terms: WcTermCacheRow[] | undefined, name: string): WcTermCacheRow | null {
  if (!terms) return null
  const normalized = comparable(name)
  return (
    terms.find((t) => comparable(t.name) === normalized || comparable(t.slug) === normalized) ??
    null
  )
}

function resolveTaxonomyField(
  live: WooProductDetail,
  entry: WooTaxonomyContractEntry,
  terms: CachedTermsBySlug
): ResolvedWooField {
  const cached = terms[entry.taxonomySlug]
  const attribute = findContractAttribute(live, entry)
  const attributeDisplay =
    attribute?.options.find((o) => hasHumanText(o))?.trim() ?? null
  const attributeNumeric =
    attribute?.options.find((o) => isNumericToken(o))?.trim() ?? null
  const metaRaw = metaText(live.metaData, entry.metaKey)

  // For string-format taxonomies (talla/condicion/marca) a numeric meta value is
  // ambiguous: "38" can be a literal size name or a term ID. Prefer the literal
  // interpretation when a cached term is NAMED exactly that; only then try ID.
  if (entry.metaFormat === 'string' && metaRaw && isNumericToken(metaRaw)) {
    const literal = cacheByName(cached, metaRaw)
    if (literal) {
      return {
        key: entry.key,
        label: entry.label,
        termId: literal.id.toString(),
        display: literal.name,
        origin: 'meta_string',
        note: null,
      }
    }
  }

  // A human meta string is the value (store contract) and beats any numeric
  // attribute residue — a stray "38" option must not outrank meta talla="XL".
  if (metaRaw && hasHumanText(metaRaw)) {
    const byName = cacheByName(cached, metaRaw)
    return {
      key: entry.key,
      label: entry.label,
      termId: byName?.id.toString() ?? null,
      display: metaRaw,
      origin: 'meta_string',
      note: null,
    }
  }

  // Numeric identity (meta term ID, or numeric attribute option as fallback).
  const numericId = metaRaw && isNumericToken(metaRaw) ? metaRaw : attributeNumeric

  if (numericId) {
    const cachedMatch = cacheById(cached, numericId)
    if (cachedMatch) {
      return {
        key: entry.key,
        label: entry.label,
        termId: cachedMatch.id.toString(),
        display: cachedMatch.name,
        origin: 'meta_term_cache',
        note: null,
      }
    }
    if (attributeDisplay) {
      const byName = cacheByName(cached, attributeDisplay)
      return {
        key: entry.key,
        label: entry.label,
        termId: byName?.id.toString() ?? null,
        display: attributeDisplay,
        origin: 'attribute_option',
        note: byName
          ? null
          : `${entry.label}: Woo trae ID ${numericId}; resuelto por atributo, pendiente de caché.`,
      }
    }
    return {
      key: entry.key,
      label: entry.label,
      termId: null,
      display: null,
      origin: 'unresolved',
      note: `${entry.label}: Woo trae ID ${numericId}, pero no existe en la caché wc_terms. Campo dejado pendiente (sincroniza taxonomías y rehidrata).`,
    }
  }

  // No meta at all: fall back to the attribute's human option, if any.
  if (attributeDisplay) {
    const byName = cacheByName(cached, attributeDisplay)
    return {
      key: entry.key,
      label: entry.label,
      termId: byName?.id.toString() ?? null,
      display: attributeDisplay,
      origin: 'attribute_option',
      note: null,
    }
  }

  // Talla only: last-resort inference from the product title, flagged as such.
  if (entry.key === 'talla') {
    const inferred = inferSizeFromTitle(live.name)
    if (inferred) {
      return {
        key: entry.key,
        label: entry.label,
        termId: null,
        display: inferred,
        origin: 'title_inference',
        note: `Talla inferida del título: ${inferred}. Revisar antes de publicar cambios.`,
      }
    }
  }

  return { key: entry.key, label: entry.label, termId: null, display: null, origin: 'absent', note: null }
}

function previewValue(value: unknown): string {
  let s: string
  if (typeof value === 'string') s = value
  else if (typeof value === 'number' || typeof value === 'boolean') s = String(value)
  else {
    try {
      s = JSON.stringify(value) ?? ''
    } catch {
      s = '[valor no representable]'
    }
  }
  s = s.replace(/\s+/g, ' ').trim()
  return s.length > 120 ? `${s.slice(0, 117)}…` : s
}

export function extractWooProduct(
  live: WooProductDetail,
  terms: CachedTermsBySlug,
  categories: WcCategoryCacheRow[]
): WooExtraction {
  const fields = {} as Record<WooTaxonomyKey, ResolvedWooField>
  for (const entry of WOO_TAXONOMY_CONTRACT) {
    fields[entry.key] = resolveTaxonomyField(live, entry, terms)
  }

  // Measures + defectos + sponsor from the meta contract.
  const anchoCm = metaNumber(live.metaData, 'medida_axila')
  const largoCm = metaNumber(live.metaData, 'medida_largo')
  const measureNotes = [
    metaText(live.metaData, 'medida_axila') && anchoCm == null
      ? `Ancho: Woo trae "${metaText(live.metaData, 'medida_axila')}", pero no es numérico. Campo dejado pendiente.`
      : null,
    metaText(live.metaData, 'medida_largo') && largoCm == null
      ? `Largo: Woo trae "${metaText(live.metaData, 'medida_largo')}", pero no es numérico. Campo dejado pendiente.`
      : null,
  ].filter((n): n is string => Boolean(n))

  const defectosRaw = metaText(live.metaData, 'defectos')
  const defectos = defectosRaw && hasHumanText(defectosRaw) ? defectosRaw : null
  const sponsorRaw = metaText(live.metaData, 'patrocinador') ?? metaText(live.metaData, 'sponsor')
  const sponsor = sponsorRaw && hasHumanText(sponsorRaw) ? sponsorRaw : null

  // Category: first Woo category, display resolved against the cache when possible.
  const category = live.categories.find((cat) => cat.id > 0) ?? null
  const cachedCategory = category ? categories.find((c) => c.id === category.id) : null

  // Unmapped attributes: anything in attributes[] not consumed by the contract.
  const consumedAttributes = new Set<WooProductDetail['attributes'][number]>()
  for (const entry of WOO_TAXONOMY_CONTRACT) {
    const attr = findContractAttribute(live, entry)
    if (attr) consumedAttributes.add(attr)
  }
  const unmappedAttributes: UnmappedAttribute[] = live.attributes
    .filter((a) => !consumedAttributes.has(a))
    .map((a) => ({ name: a.name, options: a.options }))

  // Unmapped meta: visible keys the contract does not cover. '_'-prefixed keys
  // are ACF/internal refs (skipped); rank_math_* is grouped into one summary row.
  const unmappedMeta: UnmappedMeta[] = []
  let rankMathKeys = 0
  for (const [key, value] of Object.entries(live.metaData)) {
    if (key.startsWith('_')) continue
    if (KNOWN_META_KEYS.has(key)) continue
    if (key.startsWith('rank_math')) {
      rankMathKeys += 1
      continue
    }
    unmappedMeta.push({ key, preview: previewValue(value) })
  }
  if (rankMathKeys > 0) {
    unmappedMeta.push({
      key: 'rank_math_*',
      preview: `${rankMathKeys} clave(s) del plugin Rank Math (SEO). Studio no las usa.`,
    })
  }

  const pendingNotes = [
    ...WOO_TAXONOMY_CONTRACT.map((e) => fields[e.key].note).filter((n): n is string => Boolean(n)),
    ...measureNotes,
  ]

  return {
    fields,
    anchoCm,
    largoCm,
    defectos,
    sponsor,
    categoryId: category?.id ?? null,
    categoryDisplay: cachedCategory?.name ?? category?.name ?? null,
    unmappedAttributes,
    unmappedMeta,
    pendingNotes,
  }
}

// ── Catalog comparison: Studio ficha vs live Woo, field by field ──────────────

export type CatalogRowState =
  | 'aligned' // both sides have the same human value
  | 'different' // both sides have a value and they differ
  | 'woo_only' // Woo has data Studio lacks → rehydrate can import it
  | 'studio_only' // Studio has data Woo lacks → pending Studio→Woo sync
  | 'pending_mapping' // Woo has something unresolvable (raw ID without cache)
  | 'empty' // neither side has a value

export interface CatalogFieldRow {
  key: string
  label: string
  studioValue: string
  wooValue: string
  state: CatalogRowState
  capability: SyncCapability
  hint?: string
}

/** Narrow Studio-side input for the comparison (detail page already loads this). */
export interface StudioCatalogSnapshot {
  referencia: string | null
  liga_display: string | null
  equipo_display: string | null
  temporada_display: string | null
  jugador_display: string | null
  talla: string | null
  condicion: string | null
  marca_display: string | null
  ancho_cm: number | null
  largo_cm: number | null
  condicion_notas: string | null
  categoria: number | null
  categoria_display: string | null
}

const TAXONOMY_CAPABILITY: Record<WooTaxonomyKey, SyncCapability> = {
  liga: 'needs_reverse_mapping',
  equipo: 'needs_reverse_mapping',
  temporada: 'needs_reverse_mapping',
  jugador: 'needs_reverse_mapping',
  talla: 'diff_only',
  condicion: 'diff_only',
  marca: 'manual_decision',
}

function displayOrDash(value: string | null | undefined): string {
  return hasHumanText(value) ? value!.trim() : '—'
}

function compareRow(
  key: string,
  label: string,
  studioRaw: string | null | undefined,
  woo: ResolvedWooField | { display: string | null; origin: WooFieldOrigin; note?: string | null },
  capability: SyncCapability
): CatalogFieldRow {
  const studio = hasHumanText(studioRaw) ? studioRaw!.trim() : null
  const wooDisplay = woo.display?.trim() || null
  let state: CatalogRowState
  if (woo.origin === 'unresolved') state = 'pending_mapping'
  else if (studio && wooDisplay) {
    state = comparable(studio) === comparable(wooDisplay) ? 'aligned' : 'different'
  } else if (!studio && wooDisplay) state = 'woo_only'
  else if (studio && !wooDisplay) state = 'studio_only'
  else state = 'empty'

  return {
    key,
    label,
    studioValue: displayOrDash(studio),
    wooValue:
      woo.origin === 'unresolved'
        ? 'ID sin resolver'
        : displayOrDash(wooDisplay),
    state,
    capability,
    hint: 'note' in woo ? woo.note ?? undefined : undefined,
  }
}

export function buildCatalogComparison(
  studio: StudioCatalogSnapshot,
  extraction: WooExtraction,
  liveName: string
): CatalogFieldRow[] {
  const rows: CatalogFieldRow[] = []

  rows.push(
    compareRow(
      'titulo',
      'Título',
      studio.referencia,
      { display: liveName?.trim() || null, origin: liveName?.trim() ? 'meta_string' : 'absent' },
      'diff_only'
    )
  )

  const studioBySlug: Record<WooTaxonomyKey, string | null> = {
    liga: studio.liga_display,
    equipo: studio.equipo_display,
    temporada: studio.temporada_display,
    jugador: studio.jugador_display,
    talla: studio.talla,
    condicion: studio.condicion,
    marca: studio.marca_display,
  }
  for (const entry of WOO_TAXONOMY_CONTRACT) {
    rows.push(
      compareRow(
        entry.key,
        entry.label,
        studioBySlug[entry.key],
        extraction.fields[entry.key],
        TAXONOMY_CAPABILITY[entry.key]
      )
    )
  }

  const studioMedidas =
    studio.ancho_cm != null || studio.largo_cm != null
      ? `${studio.ancho_cm ?? '—'}×${studio.largo_cm ?? '—'} cm`
      : null
  const wooMedidas =
    extraction.anchoCm != null || extraction.largoCm != null
      ? `${extraction.anchoCm ?? '—'}×${extraction.largoCm ?? '—'} cm`
      : null
  rows.push(
    compareRow(
      'medidas',
      'Medidas (ancho×largo)',
      studioMedidas,
      { display: wooMedidas, origin: wooMedidas ? 'meta_string' : 'absent' },
      'diff_only'
    )
  )

  rows.push(
    compareRow(
      'defectos',
      'Defectos / notas',
      studio.condicion_notas,
      { display: extraction.defectos, origin: extraction.defectos ? 'meta_string' : 'absent' },
      'diff_only'
    )
  )

  rows.push(
    compareRow(
      'categoria',
      'Categoría',
      studio.categoria_display,
      {
        display: extraction.categoryDisplay,
        origin: extraction.categoryDisplay ? 'meta_string' : 'absent',
      },
      'diff_only'
    )
  )

  return rows
}

// ── Rehydration policy: what a re-import may touch ────────────────────────────
// Fill empty/placeholder/raw-ID fields; NEVER overwrite human values typed by
// the operator. Shared by the link flow (insert = everything) and the rehydrate
// action (patch = only what this policy allows).

export interface RehydrationCurrentDetails {
  liga: string | null
  liga_display: string | null
  equipo: string | null
  equipo_display: string | null
  temporada: string | null
  temporada_display: string | null
  jugador: string | null
  jugador_display: string | null
  talla: string | null
  condicion: string | null
  marca: string | null
  marca_display: string | null
  categoria: number | null
  categoria_display: string | null
  largo_cm: number | null
  ancho_cm: number | null
  condicion_notas: string | null
  sponsor: string | null
}

export interface HydratedDetailValues {
  liga: string | null
  liga_display: string | null
  equipo: string
  equipo_display: string | null
  temporada: string
  temporada_display: string | null
  talla: string
  condicion: string
  marca: string | null
  marca_display: string | null
  categoria: number | null
  categoria_display: string | null
  jugador: string | null
  jugador_display: string | null
  largo_cm: number | null
  ancho_cm: number | null
  condicion_notas: string | null
  sponsor: string | null
}

// A term pair is (re)hydratable only while it has no trustworthy human display.
function shouldHydrateTerm(currentDisplay: string | null): boolean {
  return !hasHumanText(currentDisplay)
}

function applyTermPatch(
  patch: Record<string, unknown>,
  idField: string,
  displayField: string,
  currentId: string | null,
  currentDisplay: string | null,
  nextId: string | null,
  nextDisplay: string | null,
  required: boolean
) {
  if (!shouldHydrateTerm(currentDisplay)) return
  if (nextDisplay) {
    patch[idField] = nextId ?? (required ? '' : null)
    patch[displayField] = nextDisplay
    return
  }
  // No safe replacement: clear raw numeric residue so it never renders as text.
  if (isNumericToken(currentId) || isNumericToken(currentDisplay)) {
    patch[idField] = required ? '' : null
    patch[displayField] = null
  }
}

export function buildRehydrationDetailPatch(
  current: RehydrationCurrentDetails,
  hydrated: HydratedDetailValues
): Record<string, unknown> {
  const patch: Record<string, unknown> = {}

  applyTermPatch(
    patch,
    'liga',
    'liga_display',
    current.liga,
    current.liga_display,
    hydrated.liga,
    hydrated.liga_display,
    false
  )
  applyTermPatch(
    patch,
    'equipo',
    'equipo_display',
    current.equipo,
    current.equipo_display,
    hydrated.equipo || null,
    hydrated.equipo_display,
    true
  )
  applyTermPatch(
    patch,
    'temporada',
    'temporada_display',
    current.temporada,
    current.temporada_display,
    hydrated.temporada || null,
    hydrated.temporada_display,
    true
  )
  applyTermPatch(
    patch,
    'jugador',
    'jugador_display',
    current.jugador,
    current.jugador_display,
    hydrated.jugador,
    hydrated.jugador_display,
    false
  )
  applyTermPatch(
    patch,
    'marca',
    'marca_display',
    current.marca,
    current.marca_display,
    hydrated.marca,
    hydrated.marca_display,
    false
  )

  // Plain-string fields: fill only when empty or raw-numeric.
  if (!hasHumanText(current.talla) && hydrated.talla) patch.talla = hydrated.talla
  if (!hasHumanText(current.condicion) && hydrated.condicion) patch.condicion = hydrated.condicion
  if (current.ancho_cm == null && hydrated.ancho_cm != null) patch.ancho_cm = hydrated.ancho_cm
  if (current.largo_cm == null && hydrated.largo_cm != null) patch.largo_cm = hydrated.largo_cm
  if (!current.condicion_notas?.trim() && hydrated.condicion_notas) {
    patch.condicion_notas = hydrated.condicion_notas
  }
  if (!current.sponsor?.trim() && hydrated.sponsor) {
    patch.sponsor = hydrated.sponsor
  }
  if (current.categoria == null && hydrated.categoria != null) {
    patch.categoria = hydrated.categoria
    patch.categoria_display = hydrated.categoria_display
  }

  return patch
}
