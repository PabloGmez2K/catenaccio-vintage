import Link from 'next/link'
import type { InventoryItem } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { InventoryRowActions } from './InventoryRowActions'
import { deriveVintedChannel, deriveWebChannel, requiresAction } from '@/lib/inventory/operational-view'

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
            <th>Vinted</th>
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
            const sold = item.status === 'vendida'
            const precioVendido = item.precio_vendido != null ? Number(item.precio_vendido) : null
            // Vendida → margen real sobre el precio de venta; si no, margen esperado
            // sobre el precio web publicado.
            const margenBase = sold && precioVendido != null ? precioVendido : precioWeb
            const margen = margenBase != null ? (margenBase - Number(item.coste)).toFixed(2) : null
            const vinted = deriveVintedChannel(item.vinted_status)
            const archived = item.status === 'archivada'

            return (
              <tr key={item.id} className={action.flag ? 'row-attention' : undefined}>
                <td data-label="Referencia" className="cell-referencia">
                  {action.flag && (
                    <span className="attention-dot" title={action.reason ?? 'Requiere acción'}>
                      ●
                    </span>
                  )}
                  <Link href={`/inventory/${item.id}`} className="item-link">
                    {item.referencia}
                  </Link>
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
                <td data-label="Coste" className="num">€{Number(item.coste).toFixed(2)}</td>
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
          })}
        </tbody>
      </table>
    </div>
  )
}
