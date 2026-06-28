'use client'

import { useState, useTransition } from 'react'
import {
  generateAiSuggestion,
  approveAiSuggestion,
  rejectAiSuggestion,
  editAndApproveAiSuggestion,
} from '@/app/inventory/[id]/ai-actions'
import type { AiSuggestion, AiSuggestionStatus } from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusLabel(status: AiSuggestionStatus): string {
  switch (status) {
    case 'generando': return 'Generando…'
    case 'generado': return 'Generada · pendiente de revisión'
    case 'aprobado': return 'Aprobada'
    case 'rechazado': return 'Rechazada'
    case 'editado_aprobado': return 'Editada y aprobada'
  }
}

function statusBadgeClass(status: AiSuggestionStatus): string {
  switch (status) {
    case 'generando': return 'badge-gray'
    case 'generado': return 'badge-blue'
    case 'aprobado': return 'badge-green'
    case 'rechazado': return 'badge-red'
    case 'editado_aprobado': return 'badge-purple'
  }
}

function confidenceLabel(c: string | null): string {
  if (c === 'alta') return 'Alta'
  if (c === 'media') return 'Media'
  if (c === 'baja') return 'Baja'
  return '—'
}

// ── Edit form ─────────────────────────────────────────────────────────────────

function EditForm({
  suggestion,
  onDone,
}: {
  suggestion: AiSuggestion
  onDone: () => void
}) {
  const [titulo, setTitulo] = useState(suggestion.titulo_seo ?? '')
  const [descripcion, setDescripcion] = useState(suggestion.descripcion_larga ?? '')
  const [precio, setPrecio] = useState(
    suggestion.precio_sugerido != null ? String(suggestion.precio_sugerido) : ''
  )
  const [notas, setNotas] = useState(suggestion.notas_tasacion ?? '')
  const [reviewNotes, setReviewNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const precioNum = precio.trim() === '' ? null : Number(precio)
    if (precio.trim() !== '' && (isNaN(precioNum!) || precioNum! < 0)) {
      setError('El precio debe ser un número positivo o estar vacío')
      return
    }
    startTransition(async () => {
      const result = await editAndApproveAiSuggestion(suggestion.id, {
        titulo_seo: titulo,
        descripcion_larga: descripcion,
        precio_sugerido: precioNum,
        notas_tasacion: notas,
        review_notes: reviewNotes || undefined,
      })
      if (!result.ok) {
        setError(result.error)
      } else {
        onDone()
      }
    })
  }

  return (
    <form className="ai-edit-form" onSubmit={handleSubmit}>
      <div className="ai-edit-field">
        <label className="ai-edit-label">Título sugerido</label>
        <input
          className="ai-edit-input"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          required
        />
      </div>
      <div className="ai-edit-field">
        <label className="ai-edit-label">Descripción sugerida</label>
        <textarea
          className="ai-edit-textarea"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={8}
          required
        />
      </div>
      <div className="ai-edit-field">
        <label className="ai-edit-label">Precio sugerido (€, opcional)</label>
        <input
          className="ai-edit-input ai-edit-input--short"
          type="number"
          min="0"
          step="0.01"
          value={precio}
          onChange={e => setPrecio(e.target.value)}
          placeholder="ej. 85.00"
        />
      </div>
      <div className="ai-edit-field">
        <label className="ai-edit-label">Notas internas de tasación</label>
        <textarea
          className="ai-edit-textarea"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={3}
        />
      </div>
      <div className="ai-edit-field">
        <label className="ai-edit-label">Notas de revisión (opcional)</label>
        <textarea
          className="ai-edit-textarea"
          value={reviewNotes}
          onChange={e => setReviewNotes(e.target.value)}
          rows={2}
          placeholder="Tus notas al aprobar esta sugerencia editada"
        />
      </div>
      {error && <div className="ai-action-error">{error}</div>}
      <div className="ai-edit-actions">
        <button type="submit" className="btn-primary btn-sm" disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar edición y aprobar'}
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={onDone} disabled={isPending}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ── Single suggestion card ────────────────────────────────────────────────────

function SuggestionCard({ suggestion }: { suggestion: AiSuggestion }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveAiSuggestion(suggestion.id)
      if (!result.ok) setError(result.error)
    })
  }

  function handleReject() {
    setError(null)
    startTransition(async () => {
      const result = await rejectAiSuggestion(suggestion.id)
      if (!result.ok) setError(result.error)
    })
  }

  const isReviewed =
    suggestion.status === 'aprobado' ||
    suggestion.status === 'rechazado' ||
    suggestion.status === 'editado_aprobado'

  return (
    <div className="ai-suggestion-card">
      <div className="ai-suggestion-header">
        <span className="ai-version-label">Versión {suggestion.version}</span>
        <span className={`status-badge ${statusBadgeClass(suggestion.status)}`}>
          {statusLabel(suggestion.status)}
        </span>
      </div>

      {suggestion.titulo_seo && (
        <div className="ai-field-block">
          <span className="ai-field-label">Título sugerido</span>
          <p className="ai-field-value ai-field-value--title">{suggestion.titulo_seo}</p>
        </div>
      )}

      {suggestion.descripcion_larga && (
        <div className="ai-field-block">
          <span className="ai-field-label">Descripción sugerida</span>
          <p className="ai-field-value ai-field-value--body">{suggestion.descripcion_larga}</p>
        </div>
      )}

      <div className="ai-meta-row">
        {suggestion.precio_sugerido != null && (
          <div className="ai-meta-item">
            <span className="ai-meta-label">Precio sugerido</span>
            <span className="ai-meta-value">€{Number(suggestion.precio_sugerido).toFixed(2)}</span>
          </div>
        )}
        <div className="ai-meta-item">
          <span className="ai-meta-label">Confianza</span>
          <span className="ai-meta-value">{confidenceLabel(suggestion.model_confidence)}</span>
        </div>
      </div>

      {suggestion.notas_tasacion && (
        <div className="ai-field-block ai-field-block--internal">
          <span className="ai-field-label">Notas internas de tasación</span>
          <p className="ai-field-value ai-field-value--notes">{suggestion.notas_tasacion}</p>
        </div>
      )}

      {suggestion.review_notes && (
        <div className="ai-field-block ai-field-block--internal">
          <span className="ai-field-label">Notas de revisión</span>
          <p className="ai-field-value ai-field-value--notes">{suggestion.review_notes}</p>
        </div>
      )}

      <div className="ai-card-footer">
        <span className="ai-card-meta">
          {suggestion.model_used} · {suggestion.prompt_version} · {new Date(suggestion.created_at).toLocaleDateString('es-ES')}
        </span>
      </div>

      {error && <div className="ai-action-error">{error}</div>}

      {!isReviewed && !editing && (
        <div className="ai-card-actions">
          <button
            className="btn-primary btn-sm"
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? '…' : 'Aprobar'}
          </button>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setEditing(true)}
            disabled={isPending}
          >
            Editar y aprobar
          </button>
          <button
            className="btn-danger btn-sm"
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? '…' : 'Rechazar'}
          </button>
        </div>
      )}

      {editing && <EditForm suggestion={suggestion} onDone={() => setEditing(false)} />}
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function AiSuggestionsPanel({
  itemId,
  suggestions,
}: {
  itemId: string
  suggestions: AiSuggestion[]
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const result = await generateAiSuggestion(itemId)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <section className="detail-section ai-suggestions-section">
      <div className="ai-section-header">
        <h3>Sugerencias IA</h3>
        <button
          className="btn-primary btn-sm"
          onClick={handleGenerate}
          disabled={isPending}
        >
          {isPending ? 'Generando…' : 'Generar sugerencia con Claude'}
        </button>
      </div>

      {error && (
        <div className="ai-action-error">
          {error}
        </div>
      )}

      {suggestions.length === 0 && !error && (
        <p className="ai-empty-hint">Aún no hay sugerencias generadas para esta camiseta.</p>
      )}

      {suggestions.map(s => (
        <SuggestionCard key={s.id} suggestion={s} />
      ))}
    </section>
  )
}
