import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { InventoryTable } from '@/components/InventoryTable'
import { InventoryFilters, type InventoryFilter } from '@/components/InventoryFilters'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import {
  operationalBucket,
  requiresAction,
  type OperationalInput,
} from '@/lib/inventory/operational-view'
import type { InventoryItem } from '@/lib/types'

const VALID_FILTERS: InventoryFilter[] = [
  'activos',
  'action',
  'noweb',
  'draft',
  'web',
  'sold',
  'archived',
  'todos',
]

function toOp(item: InventoryItem): OperationalInput {
  return {
    status: item.status,
    wcProductId: item.wc_product_id,
    wcStatus: item.wc_status,
    precioPublicadoWeb:
      item.precio_publicado_web != null ? Number(item.precio_publicado_web) : null,
  }
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter: filterParam } = await searchParams
  const filter: InventoryFilter = VALID_FILTERS.includes(filterParam as InventoryFilter)
    ? (filterParam as InventoryFilter)
    : 'activos'

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory_items')
    .select(
      'id, referencia, status, coste, precio_objetivo, precio_publicado_web, wc_product_id, wc_status, photo_status, created_at'
    )
    .order('created_at', { ascending: false })

  // Server-side base URL for external Woo links (frontend + WP Admin). Not a secret;
  // absent in envs without WooCommerce configured → links are simply hidden.
  const wpSiteBase = process.env.WP_SITE_URL?.replace(/\/$/, '') ?? null

  const all = (data ?? []) as InventoryItem[]
  const tagged = all.map((item) => ({ item, bucket: operationalBucket(toOp(item)) }))

  const counts: Record<InventoryFilter, number> = {
    activos: tagged.filter((t) => t.bucket !== 'archived').length,
    action: tagged.filter((t) => t.bucket === 'action').length,
    noweb: tagged.filter((t) => t.bucket === 'noweb').length,
    draft: tagged.filter((t) => t.bucket === 'draft').length,
    web: tagged.filter((t) => t.bucket === 'web').length,
    sold: tagged.filter((t) => t.bucket === 'sold').length,
    archived: tagged.filter((t) => t.bucket === 'archived').length,
    todos: tagged.length,
  }

  let visible = tagged
  if (filter === 'activos') visible = tagged.filter((t) => t.bucket !== 'archived')
  else if (filter !== 'todos') visible = tagged.filter((t) => t.bucket === filter)

  // Surface items needing attention first (stable within the existing created_at order).
  const items = visible
    .map((t) => t.item)
    .sort((a, b) => Number(requiresAction(toOp(b)).flag) - Number(requiresAction(toOp(a)).flag))

  return (
    <AppShell>
      <div className="inventory-header">
        <h2>Inventario</h2>
        <span className="item-count">
          {`${counts.activos} activo${counts.activos !== 1 ? 's' : ''}`}
          {counts.archived > 0 ? ` · ${counts.archived} archivado${counts.archived !== 1 ? 's' : ''}` : ''}
        </span>
        <Link href="/inventory/new" className="btn-primary btn-sm">
          + Nueva camiseta
        </Link>
      </div>

      {error ? (
        <ErrorState message={error.message} />
      ) : all.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <InventoryFilters active={filter} counts={counts} />
          {items.length === 0 ? (
            <p className="inv-empty-filter">No hay items en este filtro.</p>
          ) : (
            <InventoryTable items={items} wpSiteBase={wpSiteBase} />
          )}
        </>
      )}
    </AppShell>
  )
}
