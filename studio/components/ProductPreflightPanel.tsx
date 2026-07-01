'use client'

// S024 — Completeness preflight panel shown on the item detail page.
// Display-only: renders the pure evaluateProductPreflight() result. Collapsible per block;
// blocks with a blocker/warning start expanded, all-pass blocks start collapsed.

import Link from 'next/link'
import { useState } from 'react'
import type {
  CheckStatus,
  PreflightGroup,
  PreflightStatus,
  ProductPreflightResult,
} from '@/lib/preflight/product-preflight'

const STATUS_META: Record<PreflightStatus, { label: string; className: string }> = {
  READY_TO_CREATE_DRAFT: { label: 'Listo para crear borrador', className: 'preflight-banner--ready' },
  WARNING_REVIEW_RECOMMENDED: { label: 'Revisión recomendada', className: 'preflight-banner--warning' },
  BLOCKED_MISSING_REQUIRED_FIELDS: { label: 'Faltan campos obligatorios', className: 'preflight-banner--blocked' },
}

const CHIP_ICON: Record<CheckStatus, string> = { pass: '✓', warning: '!', blocker: '✕' }

export function ProductPreflightPanel({
  result,
  editHref,
}: {
  result: ProductPreflightResult
  editHref: string
}) {
  const meta = STATUS_META[result.status]
  const hasActionable = result.counts.blockers > 0 || result.counts.warnings > 0

  return (
    <section className="detail-section preflight-section">
      <h3>Preflight de completitud</h3>

      <div className={`preflight-banner ${meta.className}`}>
        <span className="preflight-banner-status">{meta.label}</span>
        <span className="preflight-banner-counts">
          {result.counts.blockers} bloqueos · {result.counts.warnings} avisos · {result.counts.passes} correctos
        </span>
      </div>

      {result.alreadyDrafted && (
        <div className="preflight-note">
          Este item ya tiene un borrador WooCommerce (ID {result.wcProductId}). La preflight es
          informativa; crear de nuevo está bloqueado por idempotencia.
        </div>
      )}

      {hasActionable && (
        <div className="preflight-actions">
          <Link href={editHref} className="btn-secondary btn-sm">
            Editar item
          </Link>
        </div>
      )}

      <div className="preflight-groups">
        {result.groups.map((group) => (
          <PreflightGroupCard key={group.id} group={group} />
        ))}
      </div>
    </section>
  )
}

function PreflightGroupCard({ group }: { group: PreflightGroup }) {
  const [open, setOpen] = useState(group.status !== 'pass')

  return (
    <div className={`preflight-group preflight-group--${group.status}`}>
      <button
        type="button"
        className="preflight-group-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={`preflight-chip preflight-chip--${group.status}`}>{CHIP_ICON[group.status]}</span>
        <span className="preflight-group-title">{group.title}</span>
        <span className="preflight-group-toggle" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <ul className="preflight-check-list">
          {group.checks.map((check) => (
            <li key={check.id} className={`preflight-check preflight-check--${check.status}`}>
              <span className={`preflight-chip preflight-chip--${check.status}`}>{CHIP_ICON[check.status]}</span>
              <span className="preflight-check-body">
                <span className="preflight-check-label">{check.label}</span>
                <span className="preflight-check-message">{check.message}</span>
                {check.fixHint && <span className="preflight-check-hint">{check.fixHint}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
