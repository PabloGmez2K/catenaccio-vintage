export type ItemStatus =
  | 'comprada'
  | 'pendiente_fotos'
  | 'fotos_hechas'
  | 'pendiente_descripcion'
  | 'borrador_web'
  | 'pendiente_web'
  | 'publicada_web'
  | 'pendiente_vinted'
  | 'publicada_vinted'
  | 'reservada'
  | 'vendida'
  | 'archivada'

export type PhotoStatus =
  | 'sin_hacer'
  | 'hechas_local'
  | 'subidas_studio'
  | 'asignadas_wc'

export type WcSyncStatus =
  | 'no_sincronizado'
  | 'borrador_creado'
  | 'publicado'
  | 'error_sync'
  | 'archivado_wc'

export type VintedStatus =
  | 'no_aplica'
  | 'pendiente'
  | 'publicada'
  | 'vendida_vinted'
  | 'retirada'

export interface InventoryItem {
  id: string
  referencia: string
  status: ItemStatus
  coste: number
  precio_objetivo: number | null
  precio_publicado_web: number | null
  wc_product_id: number | null
  wc_status: WcSyncStatus
  wc_error: string | null
  photo_status: PhotoStatus
  created_at: string
}

export interface FootballShirtDetails {
  id: string
  item_id: string
  // S022A.2A canonical fields — NOT NULL with defaults
  product_type: string
  shirt_version: string
  authenticity_type: string
  sleeve_length: string
  sponsor: string | null
  // Catalogue taxonomy
  liga: string | null
  liga_display: string | null
  equipo: string
  equipo_display: string | null
  temporada: string
  temporada_display: string | null
  talla: string
  marca: string | null
  marca_display: string | null
  condicion: string
  // WooCommerce product category (S023E) — explicit override selected from the
  // wc_categories cache. null = follow the liga-based heuristic in the bridge.
  categoria: number | null
  categoria_display: string | null
  // Player / personalisation
  jugador: string | null
  jugador_display: string | null
  numero_dorsal: string | null
  nombre_dorsal: string | null
  tiene_parches: boolean
  parches_descripcion: string | null
  tiene_etiquetas: boolean
  es_match_worn: boolean
  es_replica: boolean
  // Measurements
  largo_cm: number | null
  ancho_cm: number | null
  // Notes
  condicion_notas: string | null
  autenticidad: string | null
}

export interface InventoryItemWithDetails extends InventoryItem {
  proveedor: string | null
  notas_compra: string | null
  notas_internas: string | null
  fecha_compra: string
  football_shirt_details: FootballShirtDetails | null
}

// ── AI Suggestions (shadow mode — NEVER modifies inventory_items or Woo) ──────

export type AiSuggestionStatus =
  | 'generando'
  | 'generado'
  | 'aprobado'
  | 'rechazado'
  | 'editado_aprobado'

export type AiConfidence = 'alta' | 'media' | 'baja'

export interface AiSuggestion {
  id: string
  item_id: string
  workspace_id: string
  owner_id: string
  version: number
  status: AiSuggestionStatus
  titulo_seo: string | null
  descripcion_larga: string | null
  precio_sugerido: number | null
  notas_tasacion: string | null
  model_used: string
  prompt_version: string | null
  input_context: Record<string, unknown> | null
  model_confidence: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
}

export interface WcTaxonomyCacheRow {
  id: number
  slug: 'pa_equipo' | 'pa_liga' | 'pa_jugador' | 'pa_ano'
  name: string
  label_studio: string | null
  source: 'wc_sync' | 'studio_created'
  synced_at: string
}

export interface WcTermCacheRow {
  id: number
  taxonomy_id: number
  taxonomy_slug: WcTaxonomyCacheRow['slug']
  name: string
  slug: string
  count: number
  source: 'wc_sync' | 'studio_created'
  synced_at: string
}

export interface WcCategoryCacheRow {
  id: number
  name: string
  slug: string
  parent: number | null
  count: number
  is_curatorial: boolean
  source: 'wc_sync' | 'studio_created'
  synced_at: string
}
