import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { ErrorState } from '@/components/ErrorState'
import { StatusBadge } from '@/components/StatusBadge'
import { notFound } from 'next/navigation'
import type { ItemStatus, PhotoStatus, WcSyncStatus } from '@/lib/types'

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, football_shirt_details(*)')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116' || (!data && !error)) {
    notFound()
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error.message} />
      </AppShell>
    )
  }

  const shirt = data.football_shirt_details

  return (
    <AppShell>
      <div className="item-detail">
        <Link href="/inventory" className="back-link">
          ← Volver al inventario
        </Link>
        <h2>{data.referencia}</h2>

        <section className="detail-section">
          <h3>Estado</h3>
          <div className="field-row">
            <span className="field-label">Pipeline</span>
            <StatusBadge type="item" value={data.status as ItemStatus} />
          </div>
          <div className="field-row">
            <span className="field-label">WooCommerce</span>
            <StatusBadge type="wc" value={data.wc_status as WcSyncStatus} />
          </div>
          <div className="field-row">
            <span className="field-label">Fotos</span>
            <StatusBadge type="photo" value={data.photo_status as PhotoStatus} />
          </div>
        </section>

        <section className="detail-section">
          <h3>Precios</h3>
          <div className="field-row">
            <span className="field-label">Coste</span>
            <span className="field-value">€{Number(data.coste).toFixed(2)}</span>
          </div>
          {data.precio_publicado_web != null && (
            <div className="field-row">
              <span className="field-label">Precio web</span>
              <span className="field-value">
                €{Number(data.precio_publicado_web).toFixed(2)}
              </span>
            </div>
          )}
          {data.precio_publicado_web != null && (
            <div className="field-row">
              <span className="field-label">Margen</span>
              <span className="field-value">
                €{(Number(data.precio_publicado_web) - Number(data.coste)).toFixed(2)}
              </span>
            </div>
          )}
        </section>

        {shirt && (
          <section className="detail-section">
            <h3>Camiseta</h3>
            <div className="field-row">
              <span className="field-label">Equipo</span>
              <span className="field-value">
                {shirt.equipo_display ?? shirt.equipo}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Temporada</span>
              <span className="field-value">
                {shirt.temporada_display ?? shirt.temporada}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Talla</span>
              <span className="field-value">{shirt.talla}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Condición</span>
              <span className="field-value">{shirt.condicion}</span>
            </div>
            {shirt.liga_display && (
              <div className="field-row">
                <span className="field-label">Liga</span>
                <span className="field-value">{shirt.liga_display}</span>
              </div>
            )}
            {shirt.marca_display && (
              <div className="field-row">
                <span className="field-label">Marca</span>
                <span className="field-value">{shirt.marca_display}</span>
              </div>
            )}
          </section>
        )}

        <p className="read-only-notice">
          Vista de solo lectura — S022 añadirá edición y publicación.
        </p>
      </div>
    </AppShell>
  )
}
