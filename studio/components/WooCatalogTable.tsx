import Link from 'next/link'
import type { WooCatalogRow } from '@/lib/inventory/stock-overview'
import type { WooCatalogProduct } from '@/lib/wc/product-catalog'

// Read-only live view of the WooCommerce catalog with the Studio link per product.
// Reuses the inventory-table classes so it inherits the desktop density and the
// mobile card collapse for free. No actions here beyond navigation: this screen
// never writes to Woo.

const STATUS_BADGES: Record<WooCatalogProduct['status'], { label: string; tone: string }> = {
  publish: { label: 'Publicado', tone: 'badge-green' },
  draft: { label: 'Borrador', tone: 'badge-blue' },
  pending: { label: 'Pendiente', tone: 'badge-yellow' },
  private: { label: 'Privado', tone: 'badge-purple' },
  trash: { label: 'Papelera', tone: 'badge-red' },
}

function stockBadge(p: WooCatalogProduct): { label: string; tone: string } {
  if (p.stockStatus === 'instock') {
    return {
      label: p.manageStock && p.stockQuantity != null ? `En stock (${p.stockQuantity})` : 'En stock',
      tone: 'badge-green',
    }
  }
  if (p.stockStatus === 'outofstock') return { label: 'Agotado', tone: 'badge-red' }
  if (p.stockStatus === 'onbackorder') return { label: 'Reserva', tone: 'badge-yellow' }
  return { label: '—', tone: 'badge-gray' }
}

export function WooCatalogTable({
  rows,
  wpSiteBase,
}: {
  rows: WooCatalogRow[]
  wpSiteBase: string | null
}) {
  return (
    <div className="table-wrapper">
      <table className="inventory-table woo-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Estado web</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Studio</th>
            <th>Alta</th>
            <th>Enlaces</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ product, studio }) => {
            const badge = STATUS_BADGES[product.status]
            const stock = stockBadge(product)
            const adminUrl = wpSiteBase
              ? `${wpSiteBase}/wp-admin/post.php?post=${product.id}&action=edit`
              : null

            return (
              <tr key={product.id}>
                <td data-label="Producto" className="cell-referencia">
                  <span className="woo-product-cell">
                    {product.imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageSrc}
                        alt=""
                        className="woo-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <span className="woo-thumb woo-thumb--empty" aria-hidden="true" />
                    )}
                    <span className="woo-product-name">{product.name}</span>
                  </span>
                </td>
                <td data-label="Estado web">
                  <span className={`status-badge ${badge.tone}`}>{badge.label}</span>
                </td>
                <td data-label="Stock">
                  <span className={`status-badge ${stock.tone}`}>{stock.label}</span>
                </td>
                <td data-label="Precio" className="num">
                  {product.price != null ? `€${product.price.toFixed(2)}` : '—'}
                </td>
                <td data-label="Studio">
                  {studio ? (
                    <Link href={`/inventory/${studio.id}`} className="item-link">
                      {studio.referencia}
                    </Link>
                  ) : (
                    <span className="status-badge badge-orange">Sin vincular</span>
                  )}
                </td>
                <td data-label="Alta" className="date">
                  {product.dateCreated
                    ? new Date(product.dateCreated).toLocaleDateString('es-ES')
                    : '—'}
                </td>
                <td data-label="Enlaces" className="cell-actions">
                  <div className="row-actions">
                    {product.permalink && product.status === 'publish' && (
                      <a
                        href={product.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="row-action-link"
                        title="Ver producto en la web"
                      >
                        Web ↗
                      </a>
                    )}
                    {adminUrl && (
                      <a
                        href={adminUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="row-action-link"
                        title="Abrir producto en WP Admin"
                      >
                        WP ↗
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
