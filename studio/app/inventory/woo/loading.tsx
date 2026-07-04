import { AppShell } from '@/components/AppShell'

// The catalog page waits on a live external GET, so it needs a visible loading
// state (reads can take a few seconds against the real store).
export default function WooCatalogLoading() {
  return (
    <AppShell>
      <div className="inventory-header">
        <h2>Auditoría web</h2>
      </div>
      <div className="woo-loading">
        <span className="wc-draft-spinner" aria-hidden="true" />
        Leyendo el catálogo real de la tienda…
      </div>
    </AppShell>
  )
}
