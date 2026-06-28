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
          {data.precio_objetivo != null && (
            <div className="field-row">
              <span className="field-label">Precio objetivo</span>
              <span className="field-value">
                €{Number(data.precio_objetivo).toFixed(2)}
              </span>
            </div>
          )}
          {data.precio_objetivo != null && (
            <div className="field-row">
              <span className="field-label">Margen esperado</span>
              <span className="field-value">
                €{(Number(data.precio_objetivo) - Number(data.coste)).toFixed(2)}
              </span>
            </div>
          )}
          {data.precio_publicado_web != null && (
            <div className="field-row">
              <span className="field-label">Precio web</span>
              <span className="field-value">
                €{Number(data.precio_publicado_web).toFixed(2)}
              </span>
            </div>
          )}
        </section>

        {data.proveedor && (
          <section className="detail-section">
            <h3>Adquisición</h3>
            <div className="field-row">
              <span className="field-label">Proveedor</span>
              <span className="field-value">{data.proveedor}</span>
            </div>
            {data.fecha_compra && (
              <div className="field-row">
                <span className="field-label">Fecha compra</span>
                <span className="field-value">
                  {new Date(data.fecha_compra).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </section>
        )}

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
            {shirt.jugador_display && (
              <div className="field-row">
                <span className="field-label">Jugador</span>
                <span className="field-value">{shirt.jugador_display}</span>
              </div>
            )}
            {shirt.numero_dorsal && (
              <div className="field-row">
                <span className="field-label">Dorsal</span>
                <span className="field-value">
                  {shirt.numero_dorsal}
                  {shirt.nombre_dorsal ? ` · ${shirt.nombre_dorsal}` : ''}
                </span>
              </div>
            )}
            {(shirt.es_match_worn ||
              shirt.tiene_parches ||
              shirt.tiene_etiquetas ||
              shirt.es_replica) && (
              <div className="field-row">
                <span className="field-label">Características</span>
                <span className="field-value">
                  {[
                    shirt.es_match_worn && 'Match worn',
                    shirt.tiene_parches && 'Con parches',
                    shirt.tiene_etiquetas && 'Con etiquetas',
                    shirt.es_replica && 'Réplica',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            )}
            {shirt.condicion_notas && (
              <div className="field-row">
                <span className="field-label">Notas condición</span>
                <span className="field-value">{shirt.condicion_notas}</span>
              </div>
            )}
          </section>
        )}

        {data.notas_compra && (
          <section className="detail-section">
            <h3>Notas de compra</h3>
            <p className="detail-notes">{data.notas_compra}</p>
          </section>
        )}

        {data.notas_internas && (
          <section className="detail-section">
            <h3>Notas internas</h3>
            <p className="detail-notes">{data.notas_internas}</p>
          </section>
        )}

        <p className="read-only-notice">
          Vista de solo lectura — S022B añadirá sugerencias Claude · S022C añadirá publicación Woo
        </p>
      </div>
    </AppShell>
  )
}
