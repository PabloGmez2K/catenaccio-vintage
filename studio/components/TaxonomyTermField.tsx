'use client'

import type { ReactNode } from 'react'
import { TermCreateButton } from './TermCreateButton'
import { matchTermOption, type TermFormOption } from '@/lib/wc/term-options'

type ControlledTaxonomySlug = 'pa_liga' | 'pa_equipo' | 'pa_ano' | 'pa_jugador'

// S024A — Standardized taxonomy input for Liga/Equipo/Año/Jugador. One coherent
// behaviour for all four creatable taxonomies: free manual entry, cache-backed
// suggestions, a visible "exists in Woo / new term" status, and a create button
// shown only when the typed term is missing. Static labels are a visual fallback
// only while the wc_terms cache for this taxonomy is empty (pre-sync).

const MIN_CREATE_LENGTH = 2

interface TaxonomyTermFieldProps {
  id: string
  name: string
  label: string
  required?: boolean
  placeholder?: string
  value: string
  onChange: (value: string) => void
  taxonomySlug: ControlledTaxonomySlug
  options: TermFormOption[]
  // Static labels (wc-terms-mvp.ts) used for the datalist only when `options` is empty.
  fallbackLabels?: string[]
  error?: string
  helpTexts?: ReactNode[]
  onTermCreated: (term: TermFormOption) => void
}

export function TaxonomyTermField({
  id,
  name,
  label,
  required = false,
  placeholder,
  value,
  onChange,
  taxonomySlug,
  options,
  fallbackLabels,
  error,
  helpTexts,
  onTermCreated,
}: TaxonomyTermFieldProps) {
  const trimmed = value.trim()
  const matched = matchTermOption(options, value)
  const hasCache = options.length > 0
  const datalistId = `${id}-list`
  // Cache is the source of truth when populated; static labels only fill in pre-sync.
  const datalistValues = hasCache ? options.map((o) => o.name) : (fallbackLabels ?? [])
  const canCreate = trimmed.length >= MIN_CREATE_LENGTH && !matched

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        list={datalistId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <datalist id={datalistId}>
        {datalistValues.map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>

      {trimmed !== '' &&
        (matched ? (
          <p className="term-status term-status-exists">✓ Existe en Woo · ID {matched.id}</p>
        ) : hasCache ? (
          <p className="term-status term-status-missing">
            Nuevo término — aún no existe en Woo. Puedes crearlo abajo.
          </p>
        ) : (
          <p className="term-status term-status-unknown">
            Sin caché de términos sincronizada. Se intentará resolver al guardar.
          </p>
        ))}

      {error && <span className="field-error">{error}</span>}

      {helpTexts?.map((help, i) => (
        <p key={i} className="field-help">
          {help}
        </p>
      ))}

      {canCreate && (
        <TermCreateButton
          taxonomySlug={taxonomySlug}
          label={value}
          onCreated={(t) =>
            onTermCreated({
              id: t.id,
              name: t.name,
              slug: t.slug,
              taxonomySlug,
              source: 'studio_created',
            })
          }
        />
      )}
    </div>
  )
}
