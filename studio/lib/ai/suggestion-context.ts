import type { InventoryItemWithDetails } from '@/lib/types'

// Human-readable label for authenticity_type stored values.
// 'Replica' is the internal value for "Original retail / Fan version".
function humanizeAuthenticity(value: string | null): string {
  if (!value) return 'No especificada'
  if (value === 'Replica' || value === 'Original retail / Fan version') {
    return 'Original retail / Fan version'
  }
  return value
}

export type SuggestionContext = {
  referencia: string
  product_type: string
  shirt_version: string
  equipo_display: string | null
  liga_display: string | null
  temporada_display: string | null
  talla: string
  marca_display: string | null
  condicion: string
  authenticity_type: string
  sleeve_length: string
  sponsor: string | null
  jugador_display: string | null
  numero_dorsal: string | null
  nombre_dorsal: string | null
  tiene_parches: boolean
  parches_descripcion: string | null
  tiene_etiquetas: boolean
  largo_cm: number | null
  ancho_cm: number | null
  condicion_notas: string | null
  autenticidad: string | null
  precio_objetivo: number | null
}

// Builds a sanitized context object safe to send to Claude.
// Explicitly excludes: coste, proveedor, notas_compra, ubicacion_fisica,
// carpeta_local, notas_internas, owner_id, workspace_id, auth uid, emails.
export function buildSuggestionContext(item: InventoryItemWithDetails): SuggestionContext {
  const shirt = item.football_shirt_details

  return {
    referencia: item.referencia,
    product_type: shirt?.product_type ?? 'Shirt',
    shirt_version: shirt?.shirt_version ?? '',
    equipo_display: shirt?.equipo_display ?? null,
    liga_display: shirt?.liga_display ?? null,
    temporada_display: shirt?.temporada_display ?? null,
    talla: shirt?.talla ?? '',
    marca_display: shirt?.marca_display ?? null,
    condicion: shirt?.condicion ?? '',
    authenticity_type: humanizeAuthenticity(shirt?.authenticity_type ?? null),
    sleeve_length: shirt?.sleeve_length ?? '',
    sponsor: shirt?.sponsor ?? null,
    jugador_display: shirt?.jugador_display ?? null,
    numero_dorsal: shirt?.numero_dorsal ?? null,
    nombre_dorsal: shirt?.nombre_dorsal ?? null,
    tiene_parches: shirt?.tiene_parches ?? false,
    parches_descripcion: shirt?.parches_descripcion ?? null,
    tiene_etiquetas: shirt?.tiene_etiquetas ?? false,
    largo_cm: shirt?.largo_cm ?? null,
    ancho_cm: shirt?.ancho_cm ?? null,
    condicion_notas: shirt?.condicion_notas ?? null,
    autenticidad: shirt?.autenticidad ?? null,
    precio_objetivo: item.precio_objetivo ?? null,
  }
}
