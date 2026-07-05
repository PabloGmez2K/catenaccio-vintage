'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { saveManualSeoContent } from '@/app/inventory/[id]/manual-seo-actions'
import type { AiSuggestion } from '@/lib/types'

export function ManualSeoPanel({
  itemId,
  promptText,
  approvedSuggestion,
  precioPubWeb,
  wooDescription,
  wooTitle,
}: {
  itemId: string
  promptText: string
  approvedSuggestion: AiSuggestion | null
  precioPubWeb: number | null
  wooDescription?: string | null
  wooTitle?: string | null
}) {
  const router = useRouter()
  const wooDescriptionText = htmlToPlainText(wooDescription ?? '')
  const promptWithWooBase = wooDescriptionText
    ? `${promptText}\n\n[DESCRIPCION ACTUAL EN WOO - USAR COMO BASE]\n${wooDescriptionText}`
    : promptText

  const [copied, setCopied] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [notas, setNotas] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(promptWithWooBase)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setShowPrompt(true)
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await saveManualSeoContent(itemId, {
        titulo_seo: titulo.trim(),
        descripcion_larga: descripcion.trim(),
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

  function useWooDescriptionAsBase() {
    if (!titulo.trim() && wooTitle?.trim()) setTitulo(wooTitle.trim())
    setDescripcion(wooDescriptionText)
    setShowForm(true)
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
                Sin precio web — se fija en{' '}
                <Link href={`/inventory/${itemId}/edit`} className="row-action-link">
                  Editar → Precio y coste
                </Link>
                , no aquí.
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

      {wooDescriptionText && (
        <div className="manual-seo-woo-base">
          <div className="manual-seo-field">
            <span className="manual-seo-label">Descripcion actual de Woo</span>
            <p className="manual-seo-value manual-seo-value--body">{wooDescriptionText}</p>
          </div>
          {!approvedSuggestion && (
            <p className="manual-seo-field-hint">
              Descripcion importada desde Woo como base. Puedes mejorarla con el prompt SEO antes de sincronizar.
            </p>
          )}
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={useWooDescriptionAsBase}
          >
            Usar descripcion Woo como base
          </button>
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
          value={promptWithWooBase}
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

          <p className="manual-seo-field-hint">
            El precio web no se guarda desde aquí: si el resultado trae un precio sugerido,
            fíjalo en{' '}
            <Link href={`/inventory/${itemId}/edit`} className="row-action-link">
              Editar → Precio y coste
            </Link>
            .
          </p>

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

function htmlToPlainText(html: string): string {
  // &amp; decodes LAST so double-escaped entities (&amp;lt;) resolve to their
  // literal text instead of double-decoding into markup.
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
