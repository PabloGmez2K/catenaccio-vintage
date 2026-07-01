// S025 backoffice — pure derivations for the inventory work queue.
// No I/O, no Supabase, no Woo. Turns the raw fields Studio already stores into the
// operational signals Pablo scans: web channel, "requires action", and a filter bucket.
//
// IMPORTANT: this reads ONLY the local bridge fields (wc_status / wc_product_id).
// It does NOT know the live Woo state — "Drift" detection needs a live GET (S030) and
// is intentionally out of scope here, so it is never faked.

import type { ItemStatus, WcSyncStatus } from '@/lib/types'

export interface OperationalInput {
  status: ItemStatus
  wcProductId: number | null
  wcStatus: WcSyncStatus
  precioPublicadoWeb: number | null
}

export type Tone = 'gray' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange' | 'red'

// Where the item stands on the web channel (catenacciovintage.com), derived purely
// from the Woo bridge fields — no live Woo read.
export interface WebChannel {
  label: string
  tone: Tone
}

export function deriveWebChannel(i: OperationalInput): WebChannel {
  if (i.wcStatus === 'error_sync') return { label: 'Error', tone: 'red' }
  if (i.wcProductId == null) return { label: 'Sin Woo', tone: 'gray' }
  if (i.wcStatus === 'publicado') return { label: 'Publicado', tone: 'green' }
  if (i.wcStatus === 'archivado_wc') return { label: 'Archivado Woo', tone: 'gray' }
  // Has a Woo product but not published yet → it's a draft in WP Admin.
  return { label: 'Borrador', tone: 'blue' }
}

// High-signal "needs attention" flag for the 5-second scan. Deliberately narrow so it
// stays meaningful: a hard sync error, or an active item with no way to reach the web yet.
export function requiresAction(i: OperationalInput): { flag: boolean; reason: string | null } {
  if (i.wcStatus === 'error_sync') {
    return { flag: true, reason: 'Error de sincronización con Woo' }
  }
  const terminal =
    i.status === 'archivada' || i.status === 'vendida' || i.status === 'reservada'
  if (
    !terminal &&
    i.wcProductId == null &&
    (i.precioPublicadoWeb == null || i.precioPublicadoWeb <= 0)
  ) {
    return { flag: true, reason: 'Sin precio web y sin borrador Woo' }
  }
  return { flag: false, reason: null }
}

// Mutually-exclusive bucket for the filter tabs. Priority order matters:
// archived → sold → action → web → draft → noweb.
export type OperationalBucket = 'action' | 'noweb' | 'draft' | 'web' | 'sold' | 'archived'

export function operationalBucket(i: OperationalInput): OperationalBucket {
  if (i.status === 'archivada') return 'archived'
  if (i.status === 'vendida' || i.status === 'reservada') return 'sold'
  if (requiresAction(i).flag) return 'action'
  if (i.wcStatus === 'publicado') return 'web'
  if (i.wcProductId != null) return 'draft'
  return 'noweb'
}
