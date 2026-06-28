import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { InventoryTable } from '@/components/InventoryTable'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import type { InventoryItem } from '@/lib/types'

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory_items')
    .select(
      'id, referencia, status, coste, precio_objetivo, precio_publicado_web, wc_status, photo_status, created_at'
    )
    .order('created_at', { ascending: false })

  return (
    <AppShell>
      <div className="inventory-header">
        <h2>Inventario</h2>
        <span className="item-count">
          {data ? `${data.length} item${data.length !== 1 ? 's' : ''}` : ''}
        </span>
        <Link href="/inventory/new" className="btn-primary btn-sm">
          + Nueva camiseta
        </Link>
      </div>
      {error ? (
        <ErrorState message={error.message} />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <InventoryTable items={data as InventoryItem[]} />
      )}
    </AppShell>
  )
}
