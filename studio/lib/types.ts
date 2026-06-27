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

export interface InventoryItem {
  id: string
  referencia: string
  status: ItemStatus
  coste: number
  precio_publicado_web: number | null
  wc_status: WcSyncStatus
  photo_status: PhotoStatus
  created_at: string
}
