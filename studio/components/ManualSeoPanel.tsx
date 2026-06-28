'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveManualSeoContent } from '@/app/inventory/[id]/manual-seo-actions'
import type { AiSuggestion } from '@/lib/types'

export function ManualSeoPanel({
  itemId,
  promptText,
  approvedSuggestion,
  precioPubWeb,
}: {
  itemId: string
  promptText: string
  approvedSuggestion: AiSuggestion | null
  precioPubWeb: number | null
}) {
  const router = useRouter()

  const [copied, setCopied] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [notas, setNotas] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(promptText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setShowPrompt(true)
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const precioNum = precio.trim() === '' ? null : Number(precio)
    if (precio.trim() !== '' && (isNaN(precioNum!) || precioNum! < 0)) {
      setError('El precio debe ser un número positivo o quedar en blanco')
      return
    }

    startTransition(async () => {
      const result = await saveManualSeoContent(itemId, {
        titulo_seo: titulo.trim(),
        descripcion_larga: descripcion.trim(),
        precio_sugerido: precioNum,
        notas_tasacion: notas.trim() || undefined,
      })

      if (!result.ok) {
        setError(result.error)
      } else {
        setShowForm(false)
        router.refresh()
      }
    })
  }

  return (
    <section className="detail-section manual-seo-section">
      <h3>Contenido SEO manual</h3>

      {/* ── Approved content display ───────────────────────────── */}
      {approvedSuggestion && (
        <div className="manual-seo-approved">
          <span className="manual-seo-ready-badge">Contenido SEO listo para borrador</span>

          <div className="manual-seo-field">
            <span className="manual-seo-label">Título Woo / SEO</span>
            <p className="manual-seo-value manual-seo-value--title">
              {approvedSuggestion.titulo_seo}
            </p>
          </div>

          {approvedSuggestion.descripcion_larga && (
            <div className="manual-seo-field">
              <span className="manual-seo-label">Descripción larga</span>
              <p className="manual-seo-value manual-seo-value--body">
                {approvedSuggestion.descripcion_larga}
              </p>
            </div>
          )}

          <div className="manual-seo-field">
            <span className="manual-seo-label">Precio web / WooCommerce</span>
            {precioPubWeb != null ? (
              <p className="manual-seo-value manual-seo-value--price">
                €{Number(precioPubWeb).toFixed(2)}
              </p>
            ) : (
              <p className="manual-seo-value manual-seo-value--missing">
                Sin precio — introduce el precio al guardar el contenido SEO
              </p>
            )}
          </div>

          {approvedSuggestion.notas_tasacion && (
            <div className="manual-seo-field">
              <span className="manual-seo-label">Notas internas</span>
              <p className="manual-seo-value manual-seo-value--notes">
                {approvedSuggestion.notas_tasacion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Prompt copy section (always visible) ──────────────── */}
      <div className="manual-seo-actions-row">
        <button
          className="btn-primary btn-sm"
          onClick={handleCopy}
          disabled={copied}
          type="button"
        >
          {copied ? 'Copiado ✓' : 'Copiar prompt SEO'}
        </button>
        <button
          className="btn-secondary btn-sm"
          onClick={() => setShowPrompt(v => !v)}
          type="button"
        >
          {showPrompt ? 'Ocultar prompt' : 'Ver prompt'}
        </button>
        {!showForm && (
          <button
            className="btn-secondary btn-sm"
            onClick={() => setShowForm(true)}
            type="button"
          >
            {approvedSuggestion ? 'Actualizar contenido SEO' : 'Pegar resultado'}
          </button>
        )}
      </div>

      {/* ── Fallback textarea ─────────────────────────────────── */}
      {showPrompt && (
        <textarea
          className="manual-seo-prompt-textarea"
          readOnly
          value={promptText}
          rows={14}
          onClick={e => (e.target as HTMLTextAreaElement).select()}
        />
      )}

      <p className="manual-seo-hint">
        Copia el prompt, pégalo en ChatGPT o Claude.ai, y pega el resultado en el formulario.
      </p>

      {/* ── Result form ───────────────────────────────────────── */}
      {showForm && (
        <form className="manual-seo-form" onSubmit={handleSave}>
          <div className="manual-seo-form-field">
            <label className="manual-seo-form-label">
              Título Woo / SEO <span className="required-mark">*</span>
            </label>
            <input
              className="manual-seo-input"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              required
              placeholder="ej. 2014-15 France Away Shirt (M)"
            />
          </div>

          <div className="manual-seo-form-field">
            <label className="manual-seo-form-label">
              Descripción larga <span className="required-mark">*</span>
            </label>
            <textarea
              className="manual-seo-textarea"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              required
              rows={9}
              placeholder="Descripción completa para la ficha de producto en WooCommerce..."
            />
          </div>

          <div className="manual-seo-form-field">
            <label className="manual-seo-form-label">Precio web / WooCommerce (€)</label>
            <input
              className="manual-seo-input manual-seo-input--short"
              type="number"
              min="0"
              step="0.01"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              placeholder="ej. 85.00"
            />
            <p className="manual-seo-field-hint">
              Usa el precio recomendado por ChatGPT o ajusta el precio final. Se guardará como precio del borrador WooCommerce.
            </p>
          </div>

          <div className="manual-seo-form-field">
            <label className="manual-seo-form-label">Notas internas (opcional)</label>
            <textarea
              className="manual-seo-textarea"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              placeholder="Notas de tasación o revisión para uso interno..."
            />
          </div>

          {error && <div className="manual-seo-error">{error}</div>}

          <div className="manual-seo-submit-row">
            <button type="submit" className="btn-primary btn-sm" disabled={isPending}>
              {isPending ? 'Guardando…' : 'Guardar contenido SEO'}
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setShowForm(false)}
              disabled={isPending}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
