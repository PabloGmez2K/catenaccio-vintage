// S024 — Product completeness preflight for the Studio → WooCommerce draft flow.
// Pure, dependency-free evaluation: NO Supabase, NO WooCommerce, NO network, NO writes.
// Mirrors the blocking rules enforced by studio/lib/wc/bridge.ts (createWcDraftForItem)
// so the checklist is a faithful predictor of whether a draft can be created, and adds
// review-recommended warnings for listing completeness gaps (see
// docs/studio/STUDIO_WC_DRAFT_PUBLISHABILITY_GAP_AUDIT.md). Advisory only — the bridge
// remains the hard gate; this never calls Woo and never creates anything.

export type PreflightStatus =
  | 'READY_TO_CREATE_DRAFT'
  | 'BLOCKED_MISSING_REQUIRED_FIELDS'
  | 'WARNING_REVIEW_RECOMMENDED'

export type CheckStatus = 'pass' | 'warning' | 'blocker'

export type PreflightGroupId =
  | 'identificacion'
  | 'taxonomias'
  | 'categoria'
  | 'seo_precio'
  | 'estado_fisico'
  | 'publicabilidad'

export interface PreflightCheck {
  id: string
  label: string
  status: CheckStatus
  message: string
  /** Short, human-facing next action (only set for blockers/warnings). */
  fixHint?: string
}

export interface PreflightGroup {
  id: PreflightGroupId
  title: string
  /** Worst severity found in the group's checks. */
  status: CheckStatus
  checks: PreflightCheck[]
}

export interface ProductPreflightResult {
  status: PreflightStatus
  /** True when there are zero blockers (bridge would not reject on preflight grounds). */
  canCreateDraft: boolean
  /** True when the item already has a WC draft (creating again is stopped by idempotency). */
  alreadyDrafted: boolean
  wcProductId: number | null
  counts: { blockers: number; warnings: number; passes: number }
  groups: PreflightGroup[]
}

export interface PreflightShirtInput {
  product_type: string | null
  talla: string | null
  condicion: string | null
  condicion_notas: string | null
  liga: string | null
  liga_display: string | null
  equipo: string | null
  equipo_display: string | null
  temporada: string | null
  temporada_display: string | null
  jugador: string | null
  jugador_display: string | null
  marca_display: string | null
  categoria: number | null
  categoria_display: string | null
  ancho_cm: number | null
  largo_cm: number | null
}

export interface PreflightSeoInput {
  titulo_seo: string | null
  descripcion_larga: string | null
}

export interface PreflightInput {
  referencia: string | null
  wcProductId: number | null
  precioPublicadoWeb: number | null
  shirt: PreflightShirtInput | null
  approvedSeo: PreflightSeoInput | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// Mirrors bridge.ts isValidRequiredTermId: a resolved term ID is a non-empty numeric string.
function isNumericTermId(value: string | null | undefined): boolean {
  return !!value && value.trim() !== '' && /^\d+$/.test(value.trim())
}

function nonEmpty(value: string | null | undefined): boolean {
  return !!value && value.trim() !== ''
}

function worstSeverity(checks: PreflightCheck[]): CheckStatus {
  if (checks.some((c) => c.status === 'blocker')) return 'blocker'
  if (checks.some((c) => c.status === 'warning')) return 'warning'
  return 'pass'
}

function makeGroup(
  id: PreflightGroupId,
  title: string,
  checks: PreflightCheck[]
): PreflightGroup {
  return { id, title, status: worstSeverity(checks), checks }
}

// ── Main evaluation ──────────────────────────────────────────────────────────────

export function evaluateProductPreflight(input: PreflightInput): ProductPreflightResult {
  const { shirt, approvedSeo } = input
  const groups: PreflightGroup[] = []

  // ── Identificación ────────────────────────────────────────────────────────
  const idChecks: PreflightCheck[] = []
  idChecks.push(
    nonEmpty(input.referencia)
      ? { id: 'referencia', label: 'Referencia interna', status: 'pass', message: `Referencia: ${input.referencia!.trim()}` }
      : { id: 'referencia', label: 'Referencia interna', status: 'blocker', message: 'Falta la referencia interna del item.', fixHint: 'Edita el item y añade la referencia.' }
  )
  idChecks.push(
    shirt
      ? { id: 'shirt_details', label: 'Detalles de camiseta', status: 'pass', message: 'Detalles de camiseta presentes.' }
      : { id: 'shirt_details', label: 'Detalles de camiseta', status: 'blocker', message: 'El item no tiene detalles de camiseta.', fixHint: 'Edita el item para completar los datos de la camiseta.' }
  )
  if (shirt) {
    idChecks.push({
      id: 'product_type',
      label: 'Tipo de producto',
      status: nonEmpty(shirt.product_type) ? 'pass' : 'warning',
      message: nonEmpty(shirt.product_type) ? `Tipo: ${shirt.product_type}` : 'Tipo de producto sin definir.',
      ...(nonEmpty(shirt.product_type) ? {} : { fixHint: 'Revisa el tipo de producto en el formulario.' }),
    })
    idChecks.push({
      id: 'marca',
      label: 'Marca',
      status: 'pass',
      message: nonEmpty(shirt.marca_display) ? `Marca: ${shirt.marca_display}` : 'Sin marca (opcional).',
    })
  }
  groups.push(makeGroup('identificacion', 'Identificación', idChecks))

  if (shirt) {
    const liga = shirt.liga?.trim() ?? ''
    const jugador = shirt.jugador?.trim() ?? ''

    // ── Taxonomías Woo ──────────────────────────────────────────────────────
    const taxChecks: PreflightCheck[] = []

    // Equipo (required numeric term ID). Missing display → warning (bridge falls back to cache).
    if (!isNumericTermId(shirt.equipo)) {
      taxChecks.push({ id: 'equipo', label: 'Equipo', status: 'blocker', message: 'Equipo sin term ID resuelto.', fixHint: 'Selecciona un equipo reconocido en el formulario.' })
    } else if (!nonEmpty(shirt.equipo_display)) {
      taxChecks.push({ id: 'equipo', label: 'Equipo', status: 'warning', message: `Equipo (ID ${shirt.equipo!.trim()}) sin etiqueta cacheada; el puente la resolverá desde la caché de términos.`, fixHint: 'Vuelve a guardar el item para cachear la etiqueta.' })
    } else {
      taxChecks.push({ id: 'equipo', label: 'Equipo', status: 'pass', message: `Equipo: ${shirt.equipo_display}` })
    }

    // Año / temporada (required numeric term ID).
    if (!isNumericTermId(shirt.temporada)) {
      taxChecks.push({ id: 'ano', label: 'Año / temporada', status: 'blocker', message: 'Año/temporada sin term ID resuelto.', fixHint: 'Selecciona un año reconocido en el formulario.' })
    } else if (!nonEmpty(shirt.temporada_display)) {
      taxChecks.push({ id: 'ano', label: 'Año / temporada', status: 'warning', message: `Año (ID ${shirt.temporada!.trim()}) sin etiqueta cacheada; se resolverá desde la caché de términos.`, fixHint: 'Vuelve a guardar el item para cachear la etiqueta.' })
    } else {
      taxChecks.push({ id: 'ano', label: 'Año / temporada', status: 'pass', message: `Año: ${shirt.temporada_display}` })
    }

    // Liga (optional): "" = selección nacional (no requerido); non-empty must be numeric.
    if (liga === '') {
      taxChecks.push({ id: 'liga', label: 'Liga', status: 'pass', message: 'Sin liga (selección nacional) — no requerido.' })
    } else if (!isNumericTermId(liga)) {
      taxChecks.push({ id: 'liga', label: 'Liga', status: 'blocker', message: `Liga con valor no numérico "${liga}".`, fixHint: 'Corrige la liga en el formulario con un valor reconocido.' })
    } else if (!nonEmpty(shirt.liga_display)) {
      taxChecks.push({ id: 'liga', label: 'Liga', status: 'warning', message: `Liga (ID ${liga}) sin etiqueta cacheada; se resolverá desde la caché de términos.`, fixHint: 'Vuelve a guardar el item para cachear la etiqueta.' })
    } else {
      taxChecks.push({ id: 'liga', label: 'Liga', status: 'pass', message: `Liga: ${shirt.liga_display}` })
    }

    // Jugador (optional): if present it must be numeric AND have a display label — the
    // bridge has NO cache fallback for jugador, so a missing display is a hard blocker.
    if (jugador === '') {
      taxChecks.push({ id: 'jugador', label: 'Jugador', status: 'pass', message: 'Sin jugador (no aplica).' })
    } else if (!isNumericTermId(jugador)) {
      taxChecks.push({ id: 'jugador', label: 'Jugador', status: 'blocker', message: `Jugador con valor no numérico "${jugador}".`, fixHint: 'Resuelve o crea el término de jugador en el formulario.' })
    } else if (!nonEmpty(shirt.jugador_display)) {
      taxChecks.push({ id: 'jugador', label: 'Jugador', status: 'blocker', message: `Jugador (ID ${jugador}) sin etiqueta segura.`, fixHint: 'Vuelve a seleccionar el jugador en el formulario para cachear su etiqueta.' })
    } else {
      taxChecks.push({ id: 'jugador', label: 'Jugador', status: 'pass', message: `Jugador: ${shirt.jugador_display}` })
    }

    groups.push(makeGroup('taxonomias', 'Taxonomías Woo', taxChecks))

    // ── Categoría Woo ───────────────────────────────────────────────────────
    const catChecks: PreflightCheck[] = []
    const hasExplicitCategory =
      shirt.categoria != null && Number.isInteger(shirt.categoria) && shirt.categoria > 0
    if (hasExplicitCategory) {
      catChecks.push({ id: 'categoria', label: 'Categoría', status: 'pass', message: `Categoría: ${shirt.categoria_display ?? `#${shirt.categoria}`} (selección manual).` })
    } else {
      const heuristic = liga === '' ? 'Selecciones Nacionales' : 'Otros Clubs'
      catChecks.push({ id: 'categoria', label: 'Categoría', status: 'pass', message: `Categoría automática por liga: ${heuristic}.` })
      // Curatorial nudge: a resolved jugador usually signals a "Leyendas" candidate.
      if (isNumericTermId(jugador)) {
        catChecks.push({ id: 'categoria_curatorial', label: 'Revisión curatorial', status: 'warning', message: 'La camiseta tiene jugador destacado; valora si debería ir en "Leyendas".', fixHint: 'Selecciona la categoría manualmente en el formulario si aplica.' })
      }
    }
    groups.push(makeGroup('categoria', 'Categoría Woo', catChecks))
  }

  // ── SEO y precio ──────────────────────────────────────────────────────────
  const seoChecks: PreflightCheck[] = []
  if (!approvedSeo) {
    seoChecks.push({ id: 'seo_approved', label: 'Contenido SEO aprobado', status: 'blocker', message: 'No hay contenido SEO aprobado.', fixHint: 'Aprueba el contenido SEO manual en el panel de arriba.' })
  } else {
    const titulo = approvedSeo.titulo_seo?.trim() ?? ''
    seoChecks.push(
      titulo.length >= 5
        ? { id: 'seo_titulo', label: 'Título SEO', status: 'pass', message: 'Título SEO aprobado y con longitud válida.' }
        : { id: 'seo_titulo', label: 'Título SEO', status: 'blocker', message: 'Título SEO vacío o demasiado corto (mín. 5 caracteres).', fixHint: 'Actualiza el contenido SEO.' }
    )
    const desc = approvedSeo.descripcion_larga?.trim() ?? ''
    seoChecks.push(
      desc.length >= 20
        ? { id: 'seo_desc', label: 'Descripción larga', status: 'pass', message: `Descripción larga lista (${desc.length} caracteres).` }
        : { id: 'seo_desc', label: 'Descripción larga', status: 'blocker', message: 'Descripción larga vacía o demasiado corta (mín. 20 caracteres).', fixHint: 'Actualiza el contenido SEO.' }
    )
  }
  const precio = input.precioPublicadoWeb
  const precioValid = precio != null && !Number.isNaN(Number(precio)) && Number(precio) > 0
  seoChecks.push(
    precioValid
      ? { id: 'precio', label: 'Precio web', status: 'pass', message: `Precio web: €${Number(precio).toFixed(2)}` }
      : { id: 'precio', label: 'Precio web', status: 'blocker', message: 'Precio web vacío o inválido (debe ser mayor que 0).', fixHint: 'Añade el precio web al guardar el contenido SEO o edita el item.' }
  )
  groups.push(makeGroup('seo_precio', 'SEO y precio', seoChecks))

  if (shirt) {
    // ── Estado físico y medidas ───────────────────────────────────────────────
    const fisChecks: PreflightCheck[] = []
    fisChecks.push(
      nonEmpty(shirt.talla)
        ? { id: 'talla', label: 'Talla', status: 'pass', message: `Talla: ${shirt.talla}` }
        : { id: 'talla', label: 'Talla', status: 'blocker', message: 'Talla vacía.', fixHint: 'Añade la talla en el formulario.' }
    )
    fisChecks.push(
      nonEmpty(shirt.condicion)
        ? { id: 'condicion', label: 'Condición', status: 'pass', message: `Condición: ${shirt.condicion}` }
        : { id: 'condicion', label: 'Condición', status: 'blocker', message: 'Condición vacía.', fixHint: 'Selecciona la condición en el formulario.' }
    )
    const hasAncho = shirt.ancho_cm != null
    const hasLargo = shirt.largo_cm != null
    if (hasAncho && hasLargo) {
      fisChecks.push({ id: 'medidas', label: 'Medidas', status: 'pass', message: `Medidas: ${shirt.ancho_cm}×${shirt.largo_cm} cm (ancho × largo).` })
    } else {
      const faltan = [!hasAncho && 'ancho', !hasLargo && 'largo'].filter(Boolean).join(' y ')
      fisChecks.push({ id: 'medidas', label: 'Medidas', status: 'warning', message: `Faltan medidas (${faltan}); no aparecerán en la ficha del producto.`, fixHint: 'Añade las medidas ancho/largo en el formulario.' })
    }
    fisChecks.push({
      id: 'defectos',
      label: 'Defectos',
      status: 'pass',
      message: nonEmpty(shirt.condicion_notas) ? 'Defectos / notas de condición documentados.' : 'Sin defectos declarados (opcional).',
    })
    groups.push(makeGroup('estado_fisico', 'Estado físico y medidas', fisChecks))
  }

  // ── Publicabilidad Woo ────────────────────────────────────────────────────
  const pubChecks: PreflightCheck[] = []
  pubChecks.push(
    input.wcProductId != null
      ? { id: 'idempotencia', label: 'Borrador Woo', status: 'pass', message: `Borrador ya creado (ID ${input.wcProductId}); idempotencia activa, no se duplicará.` }
      : { id: 'idempotencia', label: 'Borrador Woo', status: 'pass', message: 'Sin borrador previo — se puede crear un borrador nuevo.' }
  )
  pubChecks.push({ id: 'draft_only', label: 'Modo borrador', status: 'pass', message: 'Se creará como borrador (status=draft). El puente nunca publica.' })
  pubChecks.push({ id: 'inventario', label: 'Inventario', status: 'pass', message: 'Inventario esperado: 1 unidad con stock gestionado.' })
  groups.push(makeGroup('publicabilidad', 'Publicabilidad Woo', pubChecks))

  // ── Aggregate ─────────────────────────────────────────────────────────────
  let blockers = 0
  let warnings = 0
  let passes = 0
  for (const g of groups) {
    for (const c of g.checks) {
      if (c.status === 'blocker') blockers++
      else if (c.status === 'warning') warnings++
      else passes++
    }
  }

  const status: PreflightStatus =
    blockers > 0
      ? 'BLOCKED_MISSING_REQUIRED_FIELDS'
      : warnings > 0
        ? 'WARNING_REVIEW_RECOMMENDED'
        : 'READY_TO_CREATE_DRAFT'

  return {
    status,
    canCreateDraft: blockers === 0,
    alreadyDrafted: input.wcProductId != null,
    wcProductId: input.wcProductId,
    counts: { blockers, warnings, passes },
    groups,
  }
}
