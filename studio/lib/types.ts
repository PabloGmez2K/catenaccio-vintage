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
  wc_status: WcSyncStatus
  photo_status: PhotoStatus
  created_at: string
}

export interface FootballShirtDetails {
  id: string
  item_id: string
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
  jugador: string | null
  jugador_display: string | null
  numero_dorsal: string | null
  nombre_dorsal: string | null
  tiene_parches: boolean
  parches_descripcion: string | null
  tiene_etiquetas: boolean
  es_match_worn: boolean
  es_replica: boolean
  largo_cm: number | null
  ancho_cm: number | null
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
