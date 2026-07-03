'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markItemSold, undoItemSale } from '@/app/inventory/sales-actions'
import type { ItemStatus, SaleChannel } from '@/lib/types'

// Local sale panel for the item detail page (STOCK_MANAGER foundation).
// Registers the sale in Studio only: channel, final price, date and optional note.
// It never touches the web — if the item is live in Woo, the operator updates
// WP Admin manually (reminder shown after marking as sold).

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
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

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
          {hasWcProduct && (
            <p className="sale-reminder">
              La web no se toca desde aquí: si el producto sigue visible, actualízalo en WP
              Admin (stock o estado).
            </p>
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
