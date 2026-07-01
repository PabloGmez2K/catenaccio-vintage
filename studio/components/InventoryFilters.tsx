import Link from 'next/link'

// Work-queue filter tabs. Pure Links driven by ?filter= (server-side filtering,
// no client state). 'activos' is the default view and hides archived items.
export type InventoryFilter =
  | 'activos'
  | 'action'
  | 'noweb'
  | 'draft'
  | 'web'
  | 'sold'
  | 'archived'
  | 'todos'

const FILTERS: { key: InventoryFilter; label: string }[] = [
  { key: 'activos', label: 'Activos' },
  { key: 'action', label: 'Requiere acción' },
  { key: 'noweb', label: 'Sin web' },
  { key: 'draft', label: 'Con borrador' },
  { key: 'web', label: 'En web' },
  { key: 'sold', label: 'Vendidas' },
  { key: 'archived', label: 'Archivadas' },
  { key: 'todos', label: 'Todas' },
]

export function InventoryFilters({
  active,
  counts,
}: {
  active: InventoryFilter
  counts: Record<InventoryFilter, number>
}) {
  return (
    <div className="inv-filters">
      {FILTERS.map((f) => (
        <Link
          key={f.key}
          href={f.key === 'activos' ? '/inventory' : `/inventory?filter=${f.key}`}
          className={`inv-filter${active === f.key ? ' inv-filter--active' : ''}${
            f.key === 'action' && counts.action > 0 ? ' inv-filter--attention' : ''
          }`}
        >
          {f.label}
          <span className="inv-filter-count">{counts[f.key]}</span>
        </Link>
      ))}
    </div>
  )
}
