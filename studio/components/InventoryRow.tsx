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
import { isPendingImportedCost } from '@/lib/inventory/cost'

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
  const costPending = isPendingImportedCost(Number(item.coste), item.notas_internas)
  const precioVendido = item.precio_vendido != null ? Number(item.precio_vendido) : null
  const margenBase = sold && precioVendido != null ? precioVendido : precioWeb
  const margen = margenBase != null && !costPending ? (margenBase - Number(item.coste)).toFixed(2) : null
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
        <span className="row-desktop-ref">
          {action.flag && (
            <span className="attention-dot" title={action.reason ?? 'Requiere accion'}>
              !
            </span>
          )}
          <Link href={`/inventory/${item.id}`} className="item-link">
            {item.referencia}
          </Link>
        </span>

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
              {action.flag && <span className="attention-dot">!</span>}
              {item.referencia}
            </span>
            <span className="row-mobile-badges">
              <StatusBadge type="item" value={item.status} />
              <span className={`status-badge badge-${web.tone}`}>{web.label}</span>
            </span>
          </span>
          <span className="row-mobile-side">
            <span className="row-mobile-price">
              {compactPrice != null ? `EUR ${compactPrice.toFixed(0)}` : '-'}
            </span>
            <span
              className={`row-mobile-chevron${expanded ? ' row-mobile-chevron--open' : ''}`}
              aria-hidden="true"
            >
              v
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
          '-'
        )}
      </td>
      <td data-label="Coste" className="num">
        {costPending ? 'Pendiente' : `EUR ${Number(item.coste).toFixed(2)}`}
      </td>
      <td data-label="Precio web" className="num">
        {precioWeb != null ? `EUR ${precioWeb.toFixed(2)}` : '-'}
      </td>
      <td
        data-label="Margen"
        className="num"
        title={
          costPending
            ? 'Margen pendiente: falta coste real'
            : sold && precioVendido != null
              ? 'Margen real (venta)'
              : 'Margen esperado (precio web)'
        }
      >
        {costPending ? 'Pendiente' : margen != null ? `EUR ${margen}` : '-'}
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
