'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markItemSold, undoItemSale } from '@/app/inventory/sales-actions'
import { syncWooStockOut } from '@/app/inventory/[id]/woo-sync-actions'
import type { ItemStatus, SaleChannel } from '@/lib/types'

// Local sale panel for the item detail page (STOCK_MANAGER foundation).
// Registering the sale writes to Studio only. WOO_WRITE_SYNC adds step 2:
// after the sale, if the item is linked and the web still shows stock, the
// panel OFFERS a confirmed action to leave the web product out of stock
// (inline confirmation, never automatic, never unpublishes).

const CHANNEL_LABELS: Record<SaleChannel, string> = {
  web: 'Web',
  vinted: 'Vinted',
  otro: 'Otro',
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function SalePanel({
  itemId,
  referencia,
  status,
  coste,
  canalVenta,
  precioVendido,
  fechaVenta,
  saleNotes,
  hasWcProduct,
  wooStockStatus,
}: {
  itemId: string
  referencia: string
  status: ItemStatus
  coste: number
  canalVenta: SaleChannel | null
  precioVendido: number | null
  fechaVenta: string | null
  saleNotes: string | null
  hasWcProduct: boolean
  // Live web stock ('instock' | 'outofstock' | …) or null if it couldn't be read.
  wooStockStatus: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [stockArmed, setStockArmed] = useState(false)
  const [stockResult, setStockResult] = useState<{ ok: boolean; text: string } | null>(null)

  const [canal, setCanal] = useState<SaleChannel>(canalVenta ?? 'web')
  const [precio, setPrecio] = useState(precioVendido != null ? String(precioVendido) : '')
  const [fecha, setFecha] = useState(fechaVenta ?? today())
  const [notas, setNotas] = useState('')

  const sold = status === 'vendida'
  const archived = status === 'archivada'
  const showForm = !sold || editing

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const precioNum = Number(precio)
    if (!precio.trim() || !Number.isFinite(precioNum) || precioNum < 0) {
      setError('Indica el precio de venta.')
      return
    }
    if (!fecha) {
      setError('Indica la fecha de venta.')
      return
    }
    if (
      !sold &&
      !window.confirm(
        `¿Marcar «${referencia}» como vendida por €${precioNum.toFixed(2)} (${CHANNEL_LABELS[canal]})?\n\nEs un registro local: no cambia nada en la web.`
      )
    ) {
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await markItemSold(itemId, {
        canal,
        precioVendido: precioNum,
        fechaVenta: fecha,
        notas: notas.trim() || null,
      })
      if (res.ok) {
        setEditing(false)
        setNotas('')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  function handleUndo() {
    if (
      !window.confirm(
        `¿Deshacer la venta de «${referencia}»?\n\nSe limpian canal, precio y fecha de venta y la camiseta vuelve a su estado anterior.`
      )
    ) {
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await undoItemSale(itemId)
      if (res.ok) router.refresh()
      else setError(res.error)
    })
  }

  const margen = sold && precioVendido != null ? precioVendido - coste : null

  return (
    <section className="detail-section sale-section" id="venta">
      <h3>Venta</h3>

      {sold && !editing && (
        <>
          <div className="field-row">
            <span className="field-label">Canal</span>
            <span className="field-value">
              {canalVenta ? CHANNEL_LABELS[canalVenta] : '—'}
            </span>
          </div>
          <div className="field-row">
            <span className="field-label">Precio vendido</span>
            <span className="field-value">
              {precioVendido != null ? `€${precioVendido.toFixed(2)}` : '—'}
            </span>
          </div>
          <div className="field-row">
            <span className="field-label">Fecha de venta</span>
            <span className="field-value">
              {fechaVenta ? new Date(fechaVenta).toLocaleDateString('es-ES') : '—'}
            </span>
          </div>
          {margen != null && (
            <div className="field-row">
              <span className="field-label">Margen real</span>
              <span className={`field-value ${margen >= 0 ? 'sale-margin-ok' : 'sale-margin-neg'}`}>
                €{margen.toFixed(2)}
              </span>
            </div>
          )}
          {saleNotes && (
            <div className="field-row">
              <span className="field-label">Notas de venta</span>
              <span className="field-value">{saleNotes}</span>
            </div>
          )}
          {/* Paso 2 del flujo de venta: dejar la web agotada, con confirmación. */}
          {hasWcProduct && wooStockStatus !== 'outofstock' && (
            <div className="sale-woo-followup">
              <p className="sale-reminder">
                {wooStockStatus === null
                  ? 'No se pudo leer el stock actual de la web. Puedes intentar dejarla agotada igualmente: se verifica en el momento.'
                  : 'La web sigue mostrando esta camiseta con stock. Déjala agotada para evitar una doble venta.'}
              </p>
              {!stockArmed ? (
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={() => {
                    setStockResult(null)
                    setStockArmed(true)
                  }}
                  disabled={isPending}
                >
                  Dejar agotada en la web
                </button>
              ) : (
                <div className="woo-confirm">
                  <p className="woo-confirm-text">
                    El producto quedará <strong>agotado</strong> en la web. Si está publicado,
                    seguirá visible como «Agotado» — <strong>no se despublica</strong>.
                  </p>
                  <div className="woo-confirm-actions">
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      disabled={isPending}
                      onClick={() => {
                        setStockArmed(false)
                        startTransition(async () => {
                          const res = await syncWooStockOut(itemId)
                          if (res.ok) {
                            setStockResult({ ok: true, text: res.message })
                            router.refresh()
                          } else {
                            setStockResult({ ok: false, text: res.error })
                          }
                        })
                      }}
                    >
                      Confirmar agotado
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setStockArmed(false)}
                      disabled={isPending}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {hasWcProduct && wooStockStatus === 'outofstock' && !stockResult && (
            <p className="sale-hint">La web ya está agotada para esta camiseta.</p>
          )}
          {stockResult && (
            <div className={stockResult.ok ? 'wc-draft-ok' : 'wc-draft-error'}>
              {stockResult.text}
            </div>
          )}
          <div className="sale-actions">
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => {
                setCanal(canalVenta ?? 'web')
                setPrecio(precioVendido != null ? String(precioVendido) : '')
                setFecha(fechaVenta ?? today())
                setEditing(true)
              }}
              disabled={isPending}
            >
              Editar venta
            </button>
            <button
              type="button"
              className="row-action-btn row-action-btn--danger"
              onClick={handleUndo}
              disabled={isPending}
            >
              {isPending ? 'Deshaciendo…' : 'Deshacer venta'}
            </button>
          </div>
        </>
      )}

      {showForm && !archived && (
        <form className="sale-form" onSubmit={handleSubmit}>
          {!sold && (
            <p className="sale-hint">
              Registra la venta en Studio: canal, precio final y fecha. No cambia nada en la
              web ni en Vinted.
            </p>
          )}
          <div className="sale-form-row">
            <label className="sale-form-field">
              <span className="sale-form-label">Canal</span>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value as SaleChannel)}
                disabled={isPending}
              >
                <option value="web">Web</option>
                <option value="vinted">Vinted</option>
                <option value="otro">Otro</option>
              </select>
            </label>
            <label className="sale-form-field">
              <span className="sale-form-label">Precio vendido (€)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                disabled={isPending}
                required
              />
            </label>
            <label className="sale-form-field">
              <span className="sale-form-label">Fecha de venta</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                disabled={isPending}
                required
              />
            </label>
          </div>
          <label className="sale-form-field">
            <span className="sale-form-label">Notas (opcional)</span>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Comprador, descuento aplicado, envío…"
              disabled={isPending}
            />
          </label>
          <div className="sale-actions">
            <button type="submit" className="btn-primary btn-sm" disabled={isPending}>
              {isPending
                ? 'Guardando…'
                : sold
                  ? 'Guardar cambios de venta'
                  : 'Marcar como vendida'}
            </button>
            {editing && (
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setEditing(false)}
                disabled={isPending}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {archived && (
        <p className="sale-hint">
          Esta camiseta está archivada. Restáurala desde el inventario para registrar una
          venta.
        </p>
      )}

      {error && <p className="sale-error">{error}</p>}
    </section>
  )
}
