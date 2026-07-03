'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateVintedTracking } from '@/app/inventory/sales-actions'
import type { VintedStatus } from '@/lib/types'

// Manual Vinted tracking panel (STOCK_MANAGER foundation). Vinted has no public
// API, so everything here is hand-maintained state: status, listing URL, price,
// publish date and notes. Saving writes to Studio only.

const VINTED_LABELS: Record<VintedStatus, string> = {
  no_aplica: 'No aplica',
  pendiente: 'Pendiente de subir',
  publicada: 'Publicada',
  vendida_vinted: 'Vendida en Vinted',
  retirada: 'Retirada',
}

export function VintedPanel({
  itemId,
  vintedStatus,
  vintedUrl,
  vintedPrice,
  vintedPublishedAt,
  vintedNotes,
}: {
  itemId: string
  vintedStatus: VintedStatus
  vintedUrl: string | null
  vintedPrice: number | null
  vintedPublishedAt: string | null
  vintedNotes: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [status, setStatus] = useState<VintedStatus>(vintedStatus)
  const [url, setUrl] = useState(vintedUrl ?? '')
  const [price, setPrice] = useState(vintedPrice != null ? String(vintedPrice) : '')
  const [publishedAt, setPublishedAt] = useState(
    vintedPublishedAt ? vintedPublishedAt.slice(0, 10) : ''
  )
  const [notes, setNotes] = useState(vintedNotes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const priceNum = price.trim() ? Number(price) : null
    if (priceNum != null && (!Number.isFinite(priceNum) || priceNum < 0)) {
      setError('El precio de Vinted no es válido.')
      return
    }
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await updateVintedTracking(itemId, {
        status,
        url: url.trim() || null,
        price: priceNum,
        publishedAt: publishedAt || null,
        notes: notes.trim() || null,
      })
      if (res.ok) {
        setSaved(true)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <section className="detail-section vinted-section" id="vinted">
      <h3>Vinted</h3>
      <p className="sale-hint">
        Seguimiento manual del canal Vinted. Studio no se conecta a Vinted: publica y
        gestiona allí como siempre y registra aquí el estado.
      </p>

      <form className="sale-form" onSubmit={handleSubmit}>
        <div className="sale-form-row">
          <label className="sale-form-field">
            <span className="sale-form-label">Estado</span>
            <select
              value={status}
              onChange={(e) => {
                const next = e.target.value as VintedStatus
                setStatus(next)
                // Publicar implica una fecha; precargar hoy si aún no hay ninguna.
                if (next === 'publicada' && !publishedAt) {
                  setPublishedAt(new Date().toISOString().slice(0, 10))
                }
              }}
              disabled={isPending}
            >
              {(Object.keys(VINTED_LABELS) as VintedStatus[]).map((key) => (
                <option key={key} value={key}>
                  {VINTED_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="sale-form-field">
            <span className="sale-form-label">Precio en Vinted (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isPending}
            />
          </label>
          <label className="sale-form-field">
            <span className="sale-form-label">Fecha publicación</span>
            <input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              disabled={isPending}
            />
          </label>
        </div>
        <label className="sale-form-field">
          <span className="sale-form-label">URL del anuncio</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.vinted.es/…"
            disabled={isPending}
          />
        </label>
        <label className="sale-form-field">
          <span className="sale-form-label">Notas (opcional)</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ofertas recibidas, rebajas, dudas del comprador…"
            disabled={isPending}
          />
        </label>
        <div className="sale-actions">
          <button type="submit" className="btn-secondary btn-sm" disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar Vinted'}
          </button>
          {vintedUrl && (
            <a
              href={vintedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="row-action-link"
            >
              Ver anuncio ↗
            </a>
          )}
          {saved && !isPending && <span className="sale-saved">Guardado ✓</span>}
        </div>
      </form>

      {error && <p className="sale-error">{error}</p>}
    </section>
  )
}
