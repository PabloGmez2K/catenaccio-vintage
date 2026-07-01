import Link from 'next/link'
import type { InventoryItem } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { InventoryRowActions } from './InventoryRowActions'
import { deriveWebChannel, requiresAction } from '@/lib/inventory/operational-view'

interface Props {
  items: InventoryItem[]
  wpSiteBase: string | null
}

// Backoffice work queue (S025). Columns are decision-oriented, not a Woo data dump:
// Studio operational state + a derived web-channel signal + margin + row actions.
// No Woo title/price is fetched, so nothing here duplicates Woo Admin.
export function InventoryTable({ items, wpSiteBase }: Props) {
  return (
    <div className="table-wrapper">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Referencia</th>
            <th>Estado</th>
            <th>Canal web</th>
            <th>Coste</th>
            <th>Precio web</th>
            <th>Margen</th>
            <th>Fotos</th>
            <th>Alta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const precioWeb =
              item.precio_publicado_web != null ? Number(item.precio_publicado_web) : null
            const web = deriveWebChannel({
              status: item.status,
              wcProductId: item.wc_product_id,
              wcStatus: item.wc_status,
              precioPublicadoWeb: precioWeb,
            })
            const action = requiresAction({
              status: item.status,
              wcProductId: item.wc_product_id,
              wcStatus: item.wc_status,
              precioPublicadoWeb: precioWeb,
            })
            const margen = precioWeb != null ? (precioWeb - Number(item.coste)).toFixed(2) : null
            const archived = item.status === 'archivada'

            return (
              <tr key={item.id} className={action.flag ? 'row-attention' : undefined}>
                <td>
                  {action.flag && (
                    <span className="attention-dot" title={action.reason ?? 'Requiere acción'}>
                      ●
                    </span>
                  )}
                  <Link href={`/inventory/${item.id}`} className="item-link">
                    {item.referencia}
                  </Link>
                </td>
                <td>
                  <StatusBadge type="item" value={item.status} />
                </td>
                <td>
                  <span className={`status-badge badge-${web.tone}`}>{web.label}</span>
                </td>
                <td className="num">€{Number(item.coste).toFixed(2)}</td>
                <td className="num">{precioWeb != null ? `€${precioWeb.toFixed(2)}` : '—'}</td>
                <td className="num">{margen != null ? `€${margen}` : '—'}</td>
                <td>
                  <StatusBadge type="photo" value={item.photo_status} />
                </td>
                <td className="date">
                  {new Date(item.created_at).toLocaleDateString('es-ES')}
                </td>
                <td>
                  <InventoryRowActions
                    itemId={item.id}
                    referencia={item.referencia}
                    wcProductId={item.wc_product_id}
                    wpSiteBase={wpSiteBase}
                    archived={archived}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
