import Link from 'next/link'

export function EmptyState() {
  return (
    <div className="empty-state">
      <p className="empty-title">No hay camisetas todavía.</p>
      <p className="empty-hint" style={{ marginBottom: '16px' }}>
        Añade la primera desde el formulario de alta.
      </p>
      <Link href="/inventory/new" className="btn-primary">
        + Nueva camiseta
      </Link>
    </div>
  )
}
