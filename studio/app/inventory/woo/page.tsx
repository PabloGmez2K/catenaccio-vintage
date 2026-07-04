import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { WooCatalogTable } from '@/components/WooCatalogTable'
import { fetchWooCatalog } from '@/lib/wc/product-catalog'
import {
  buildStockOverview,
  filterRows,
  type StudioLinkItem,
  type WooCatalogFilter,
} from '@/lib/inventory/stock-overview'

// Web audit — live view of the Woo catalog, demoted to a secondary surface
// (WOO_WRITE_SYNC): /inventory is the single main inventory; this screen exists
// to reconcile the web channel — link web products that have no Studio ficha,
// one confirmed product at a time. The web is never written from here: linked
// products (including drafts to trash) are operated from their ficha, where
// every action leaves a log.

const VALID_FILTERS: WooCatalogFilter[] = [
  'todos',
  'publicados',
  'borradores',
  'agotados',
  'sin_studio',
  'vinculados',
  'papelera',
]

const FILTER_LABELS: Record<WooCatalogFilter, string> = {
  todos: 'Todos',
  publicados: 'Publicados',
  borradores: 'Borradores',
  agotados: 'Agotados',
  sin_studio: 'Sin vincular',
  vinculados: 'Vinculados',
  papelera: 'Papelera',
}

export default async function WooCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter: filterParam } = await searchParams
  const filter: WooCatalogFilter = VALID_FILTERS.includes(filterParam as WooCatalogFilter)
    ? (filterParam as WooCatalogFilter)
    : 'todos'

  const supabase = await createClient()

  // Studio side of the linking (local, fast) + live Woo catalog (external GET).
  const [{ data: studioData, error: studioError }, catalog] = await Promise.all([
    supabase
      .from('inventory_items')
      .select('id, referencia, status, wc_product_id, wc_status')
      .order('created_at', { ascending: false }),
    fetchWooCatalog(),
  ])

  const wpSiteBase = process.env.WP_SITE_URL?.replace(/\/$/, '') ?? null

  if (!catalog.ok) {
    return (
      <AppShell>
        <div className="inventory-header">
          <h2>Auditoría web</h2>
        </div>
        <div className="woo-unavailable">
          <p className="woo-unavailable-title">
            No se pudo leer el catálogo de la web ahora mismo.
          </p>
          <p className="woo-unavailable-hint">
            El inventario de Studio sigue disponible y no se ha perdido nada: esta pantalla
            solo lee. Vuelve a intentarlo en un momento.
          </p>
          <p className="woo-unavailable-detail">{catalog.message}</p>
          <div className="sale-actions">
            <Link href="/inventory/woo" className="btn-secondary btn-sm">
              Reintentar
            </Link>
            <Link href="/inventory" className="row-action-link">
              Volver al inventario
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  const studioItems = (studioData ?? []) as StudioLinkItem[]
  const overview = buildStockOverview(catalog.products, studioItems)
  const visible = filterRows(overview.rows, filter)
  const { counts } = overview

  const summaryTiles: { label: string; value: number; href?: string }[] = [
    { label: 'Camisetas en Studio', value: counts.studioActivos, href: '/inventory' },
    { label: 'Productos en la web', value: counts.woo },
    { label: 'Publicados', value: counts.publicados, href: '/inventory/woo?filter=publicados' },
    { label: 'Borradores', value: counts.borradores, href: '/inventory/woo?filter=borradores' },
    { label: 'Agotados', value: counts.agotados, href: '/inventory/woo?filter=agotados' },
    { label: 'Sin vincular', value: counts.sinVincular, href: '/inventory/woo?filter=sin_studio' },
  ]

  const filterCounts: Record<WooCatalogFilter, number> = {
    todos: counts.woo,
    publicados: counts.publicados,
    borradores: counts.borradores,
    agotados: counts.agotados,
    sin_studio: counts.sinVincular,
    vinculados: counts.vinculados,
    papelera: counts.papelera,
  }

  return (
    <AppShell>
      <div className="inventory-header">
        <h2>Auditoría web</h2>
        <span className="item-count">
          Estado real de la tienda · vincula productos a fichas de Studio
        </span>
      </div>

      <div className="stock-summary">
        {summaryTiles.map((tile) =>
          tile.href ? (
            <Link key={tile.label} href={tile.href} className="stock-tile stock-tile--link">
              <span className="stock-tile-value">{tile.value}</span>
              <span className="stock-tile-label">{tile.label}</span>
            </Link>
          ) : (
            <div key={tile.label} className="stock-tile">
              <span className="stock-tile-value">{tile.value}</span>
              <span className="stock-tile-label">{tile.label}</span>
            </div>
          )
        )}
      </div>

      {overview.reviewFirst.length > 0 && (
        <div className="review-first">
          <span className="review-first-title">Revisar primero</span>
          <ul className="review-first-list">
            {overview.reviewFirst.map((entry) => (
              <li key={entry.key} className="review-first-item">
                <span className="review-first-count">{entry.count}</span>
                {entry.filter ? (
                  <Link href={`/inventory/woo?filter=${entry.filter}`} className="review-first-link">
                    {entry.message}
                  </Link>
                ) : (
                  <span>{entry.message}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {studioError && (
        <p className="woo-partial-warning">
          No se pudo leer el inventario de Studio, así que la columna Studio puede estar
          incompleta. El catálogo web de abajo sí es el real.
        </p>
      )}

      {!catalog.trashAccessible && (
        <p className="woo-partial-warning">
          La papelera de la web no se pudo consultar: los productos en papelera no aparecen
          en esta lista.
        </p>
      )}

      <div className="inv-filters">
        {VALID_FILTERS.map((key) =>
          // Sin acceso a la papelera no hay nada que enseñar en ese filtro.
          key === 'papelera' && !catalog.trashAccessible ? null : (
            <Link
              key={key}
              href={key === 'todos' ? '/inventory/woo' : `/inventory/woo?filter=${key}`}
              className={`inv-filter${filter === key ? ' inv-filter--active' : ''}`}
            >
              {FILTER_LABELS[key]}
              <span className="inv-filter-count">{filterCounts[key]}</span>
            </Link>
          )
        )}
      </div>

      {visible.length === 0 ? (
        <p className="inv-empty-filter">No hay productos en este filtro.</p>
      ) : (
        <WooCatalogTable rows={visible} wpSiteBase={wpSiteBase} />
      )}

      {overview.orphans.length > 0 && (
        <section className="orphans-section">
          <h3>Camisetas de Studio sin producto en la web</h3>
          <p className="sale-hint">
            Estas fichas apuntan a un producto que ya no aparece en el catálogo (borrado,
            en papelera inaccesible o de otro entorno). Revísalas y decide si re-crear el
            borrador o archivar la ficha.
          </p>
          <ul className="orphans-list">
            {overview.orphans.map((item) => (
              <li key={item.id} className="orphans-item">
                <Link href={`/inventory/${item.id}`} className="item-link">
                  {item.referencia}
                </Link>
                <span className="orphans-meta">
                  producto web #{item.wc_product_id} no encontrado
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  )
}
