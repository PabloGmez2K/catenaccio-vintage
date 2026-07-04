'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { InventoryItem } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { InventoryRowActions } from './InventoryRowActions'
import {
  deriveVintedChannel,
  deriveWebChannel,
  requiresAction,
} from '@/lib/inventory/operational-view'

// One inventory row. Desktop renders the dense table row unchanged; on mobile
// the row collapses to a COMPACT line (thumb + reference + key badges + price)
// and tapping it expands the remaining fields and actions — Pablo's requested
// mobile pattern, replacing the long always-open cards.
export function InventoryRow({
  item,
  thumbUrl,
  wpSiteBase,
}: {
  item: InventoryItem
  thumbUrl: string | null
  wpSiteBase: string | null
}) {
  const [expanded, setExpanded] = useState(false)

  const precioWeb =
    item.precio_publicado_web != null ? Number(item.precio_publicado_web) : null
  const op = {
    status: item.status,
    wcProductId: item.wc_product_id,
    wcStatus: item.wc_status,
    precioPublicadoWeb: precioWeb,
  }
  const web = deriveWebChannel(op)
  const action = requiresAction(op)
  const sold = item.status === 'vendida'
  const precioVendido = item.precio_vendido != null ? Number(item.precio_vendido) : null
  const margenBase = sold && precioVendido != null ? precioVendido : precioWeb
  const margen = margenBase != null ? (margenBase - Number(item.coste)).toFixed(2) : null
  const vinted = deriveVintedChannel(item.vinted_status)
  const archived = item.status === 'archivada'
  const compactPrice = sold && precioVendido != null ? precioVendido : precioWeb

  const rowClasses = [
    action.flag ? 'row-attention' : '',
    expanded ? 'row-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <tr className={rowClasses || undefined}>
      <td data-label="Referencia" className="cell-referencia">
        {/* Desktop reference cell (hidden on mobile) */}
        <span className="row-desktop-ref">
          {action.flag && (
            <span className="attention-dot" title={action.reason ?? 'Requiere acción'}>
              ●
            </span>
          )}
          <Link href={`/inventory/${item.id}`} className="item-link">
            {item.referencia}
          </Link>
        </span>

        {/* Mobile compact summary (hidden on desktop) — tap to expand */}
        <button
          type="button"
          className="row-mobile-summary"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbUrl} alt="" className="row-mobile-thumb" loading="lazy" />
          ) : (
            <span className="row-mobile-thumb row-mobile-thumb--empty" aria-hidden="true" />
          )}
          <span className="row-mobile-main">
            <span className="row-mobile-ref">
              {action.flag && <span className="attention-dot">●</span>}
              {item.referencia}
            </span>
            <span className="row-mobile-badges">
              <StatusBadge type="item" value={item.status} />
              <span className={`status-badge badge-${web.tone}`}>{web.label}</span>
            </span>
          </span>
          <span className="row-mobile-side">
            <span className="row-mobile-price">
              {compactPrice != null ? `€${compactPrice.toFixed(0)}` : '—'}
            </span>
            <span
              className={`row-mobile-chevron${expanded ? ' row-mobile-chevron--open' : ''}`}
              aria-hidden="true"
            >
              ▾
            </span>
          </span>
        </button>
      </td>
      <td data-label="Estado">
        <StatusBadge type="item" value={item.status} />
      </td>
      <td data-label="Canal web">
        <span className={`status-badge badge-${web.tone}`}>{web.label}</span>
      </td>
      <td data-label="Vinted">
        {vinted ? (
          <span className={`status-badge badge-${vinted.tone}`}>{vinted.label}</span>
        ) : (
          '—'
        )}
      </td>
      <td data-label="Coste" className="num">
        €{Number(item.coste).toFixed(2)}
      </td>
      <td data-label="Precio web" className="num">
        {precioWeb != null ? `€${precioWeb.toFixed(2)}` : '—'}
      </td>
      <td
        data-label="Margen"
        className="num"
        title={sold && precioVendido != null ? 'Margen real (venta)' : 'Margen esperado (precio web)'}
      >
        {margen != null ? `€${margen}` : '—'}
      </td>
      <td data-label="Fotos">
        <StatusBadge type="photo" value={item.photo_status} />
      </td>
      <td data-label="Alta" className="date">
        {new Date(item.created_at).toLocaleDateString('es-ES')}
      </td>
      <td data-label="Acciones" className="cell-actions">
        <InventoryRowActions
          itemId={item.id}
          referencia={item.referencia}
          wcProductId={item.wc_product_id}
          wpSiteBase={wpSiteBase}
          archived={archived}
          sold={sold}
        />
      </td>
    </tr>
  )
}
