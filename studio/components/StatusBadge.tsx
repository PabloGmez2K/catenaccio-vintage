import type { ItemStatus, PhotoStatus, WcSyncStatus } from '@/lib/types'

type BadgeType = 'item' | 'wc' | 'photo'
type BadgeValue = ItemStatus | WcSyncStatus | PhotoStatus

interface Props {
  type: BadgeType
  value: BadgeValue
}

const ITEM_COLORS: Record<ItemStatus, string> = {
  comprada: 'badge-gray',
  pendiente_fotos: 'badge-yellow',
  fotos_hechas: 'badge-yellow',
  pendiente_descripcion: 'badge-yellow',
  borrador_web: 'badge-blue',
  pendiente_web: 'badge-blue',
  publicada_web: 'badge-green',
  pendiente_vinted: 'badge-purple',
  publicada_vinted: 'badge-purple',
  reservada: 'badge-orange',
  vendida: 'badge-green',
  archivada: 'badge-gray',
}

const WC_COLORS: Record<WcSyncStatus, string> = {
  no_sincronizado: 'badge-gray',
  borrador_creado: 'badge-blue',
  publicado: 'badge-green',
  error_sync: 'badge-red',
  archivado_wc: 'badge-gray',
}

const PHOTO_COLORS: Record<PhotoStatus, string> = {
  sin_hacer: 'badge-gray',
  hechas_local: 'badge-yellow',
  subidas_studio: 'badge-blue',
  asignadas_wc: 'badge-green',
}

export function StatusBadge({ type, value }: Props) {
  let colorClass = 'badge-gray'
  if (type === 'item') colorClass = ITEM_COLORS[value as ItemStatus] ?? 'badge-gray'
  if (type === 'wc') colorClass = WC_COLORS[value as WcSyncStatus] ?? 'badge-gray'
  if (type === 'photo') colorClass = PHOTO_COLORS[value as PhotoStatus] ?? 'badge-gray'

  return (
    <span className={`status-badge ${colorClass}`}>
      {value.replace(/_/g, ' ')}
    </span>
  )
}
