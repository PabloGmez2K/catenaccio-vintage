import type { InventoryListItem } from '@/lib/types'
import { InventoryRow } from './InventoryRow'

interface Props {
  items: InventoryListItem[]
  wpSiteBase: string | null
}

// Backoffice work queue (S025). Columns are decision-oriented, not a Woo data dump:
// Studio operational state + derived channel signals (web + Vinted) + margin + row
// actions. Row rendering (incl. the mobile compact/expand behaviour) lives in
// InventoryRow; this component only owns the table skeleton.
export function InventoryTable({ items, wpSiteBase }: Props) {
  return (
    <div className="table-wrapper">
      <table className="inventory-table inventory-table--compact">
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
          {items.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              thumbUrl={item.media_assets?.[0]?.public_url ?? null}
              wpSiteBase={wpSiteBase}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
