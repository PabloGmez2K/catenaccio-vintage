import Link from 'next/link'
import type { InventoryItem } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

interface Props {
  items: InventoryItem[]
}

export function InventoryTable({ items }: Props) {
  return (
    <div className="table-wrapper">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Referencia</th>
            <th>Estado</th>
            <th>Coste</th>
            <th>Precio web</th>
            <th>Margen</th>
            <th>WC</th>
            <th>Fotos</th>
            <th>Alta</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const margen =
              item.precio_publicado_web != null
                ? (item.precio_publicado_web - item.coste).toFixed(2)
                : null

            return (
              <tr key={item.id}>
                <td>
                  <Link href={`/inventory/${item.id}`} className="item-link">
                    {item.referencia}
                  </Link>
                </td>
                <td>
                  <StatusBadge type="item" value={item.status} />
                </td>
                <td className="num">€{Number(item.coste).toFixed(2)}</td>
                <td className="num">
                  {item.precio_publicado_web != null
                    ? `€${Number(item.precio_publicado_web).toFixed(2)}`
                    : '—'}
                </td>
                <td className="num">{margen != null ? `€${margen}` : '—'}</td>
                <td>
                  <StatusBadge type="wc" value={item.wc_status} />
                </td>
                <td>
                  <StatusBadge type="photo" value={item.photo_status} />
                </td>
                <td className="date">
                  {new Date(item.created_at).toLocaleDateString('es-ES')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
