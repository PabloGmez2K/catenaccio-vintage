# LAFABRICA_ADOPTION.md — catenaccio-vintage

Declaración de adopción metodológica de este proyecto hijo frente a lafabrica.

**Copiar a:** `docs/meta/LAFABRICA_ADOPTION.md` del proyecto hijo.
**Fuente del protocolo:** `lafabrica/docs/orchestrator/LAFABRICA_RELEASE_PROTOCOL.md`.
**Modelo operativo:** `lafabrica/docs/orchestrator/CHILD_PROJECT_ADOPTION_MODEL.md` (`AUDIT -> PLAN -> APPLY`).
**Política:** este archivo es la **única fuente de verdad** de qué release y patrones metodológicos tiene adoptados este proyecto. El operador no recuerda el estado de cada repo — lo lee aquí.
**Quién mantiene:** Orquestador, al adoptar una release y al reactivar el proyecto. Modelo **pull**: lafabrica nunca empuja; este proyecto adopta cuando le toca.

---

## Estado de adopción (bloque legible por máquina)

> Mantener estas claves exactas. Un futuro Brain Console las parsea para calcular el estado del ecosistema sin intervención humana.

```
project: catenaccio-vintage
domain: e-commerce/CMS — tienda WooCommerce 10.8.1 + WordPress 7.0 (producción activa); Studio (Next.js/Supabase) como backoffice PIM activo con escritura Woo real
lafabrica_release_base: MR-014
lafabrica_release_current_seen: MR-014
pending_critical: none
pending_recommended: none
project_state: ACTIVE
last_reviewed: 2026-09-02
next_review_recommended: on-reactivation o cuando lafabrica publique una release posterior a MR-014
privacy_level: INTERNAL_ONLY
```

---

## 1 — Identidad

- **Proyecto:** catenaccio-vintage
- **Dominio:** e-commerce/CMS — tienda WooCommerce (WordPress 7.0 + WooCommerce 10.8.1) en producción activa, más Studio (Next.js/Supabase), backoffice PIM activo con escritura real hacia Woo bajo flag `SHADOW_FIRST`.
- **Estado del proyecto:** ACTIVE
- **Fecha de última revisión de adopción:** 2026-09-02

---

## 2 — Release base adoptada

- **Release base de lafabrica adoptada:** MR-014
- **Release actual de lafabrica vista en esta revisión:** MR-014 (Release Ledger de `LAFABRICA_RELEASE_PROTOCOL.md`, verificado en `https://github.com/PabloGmez2K/lafabrica` SHA `7c1c8bb133f50caa0772b5f5d813c9e01764234f`)
- **Gap:** ninguno — release base al día con la release actual

---

## 2.1 — Fidelidad canónica de `change_id` (MR-014.3)

El Change Index de `LAFABRICA_RELEASE_PROTOCOL.md` es la autoridad de identidad. Este archivo lo
consume; no lo reinterpreta. Cobertura completa MR-004..MR-014 en las Secciones 3-7 de abajo.
Ningún `change_id` de esa release fue renumerado, permutado ni inventado.

- **change_ids totales en rango MR-004..MR-014:** 53
- **change_ids con disposición terminal canónica:** 53 (cobertura completa — cero estados no terminales, cero `PENDING`)
- **Vocabulario vigente:** únicamente `VERIFIED`, `NOT_APPLICABLE`, `NOT_YET_NEEDED`, `LOCAL_OVERRIDE_APPROVED`. Los estados `ADOPTED`, `ALREADY_EQUIVALENT`, `DEFER_WITH_GATE` y `DONE_WITH_PROJECT_SPECIFIC_IMPLEMENTATION` usados en revisiones anteriores de este archivo quedan reclasificados con esta corrección y no vuelven a usarse como `adoption_status` vigente (pueden aparecer únicamente como referencia histórica de una reclasificación, ver Sección 8).

---

## 3 — Cambios verificados (`VERIFIED`)

Mecanismo canónico o equivalente presente y validado en el repo.

| change_id | Patrón / cambio | Disposición | Adoptado en | Nota |
|---|---|---|---|---|
| PATTERN-10 DOMAIN_PRODUCT_MODELING_GATE | RECOMMENDED | VERIFIED | 2026-06-28 | ORCHESTRATOR.md §20 + AGENTS.md "Catenaccio Studio — formularios/product UI". |
| MR-004.3 Guardrail ORCHESTRATOR/AGENTS | RECOMMENDED | VERIFIED | 2026-06-28 | Instalado en esa fecha. |
| MR-005.2 Builder/Verifier/Closer | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §28, consolidado con MR-011.1. |
| MR-005.3 Cierre proporcional | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §28, consolidado con MR-011.3. |
| MR-006.1 CHILD_PROJECT_ADOPTION_MODEL | RECOMMENDED | VERIFIED | 2026-09-02 | Aplicado operativamente en este mismo APPLY (AUDIT→PLAN→APPLY). |
| MR-006.3 MANAGED_BLOCKS_GUIDE | RECOMMENDED | VERIFIED | 2026-09-02 | Marcadores `LAFABRICA:BEGIN/END` usados en ORCHESTRATOR.md §32. |
| MR-006.4 Política manual-first | RECOMMENDED | VERIFIED | 2026-09-02 | Este APPLY completo es manual y docs-only. |
| PATTERN-14 CONTROLLED_EXTERNAL_WRITE_FOUNDATION | CRITICAL — **risk_live: YES** | VERIFIED | 2026-09-02 | Ver Sección 5. |
| MR-008.1 Update Notification Protocol V1 | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §32, managed block `MR008_UPDATE_CHECK`. |
| MR-008.2 methodology_source cross-repo | RECOMMENDED | VERIFIED | Pre-existente | `PROJECT_BOOTSTRAP.md`. |
| MR-008.3 Tracking/delta efímeros + CRITICAL 3 ejes | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §32. |
| MR-008.4 Change Index estable | RECOMMENDED | VERIFIED | 2026-09-02 | Consumido, no duplicado (regla MR-014.3). |
| MR-008.5 Wiring read-only CHECK | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §32. |
| MR-009.1 PERSIST_BEFORE_DELEGATE | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §25. |
| MR-009.2 DOCS_LITE + handoff remoto mínimo | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §26. |
| MR-009.3 Apertura vs continuación viva | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §22-23. |
| MR-009.4 Línea estable de gates + SIMPLIFY_REPLAN | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §30. |
| MR-009.5 Stop-loss R0-R3 | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §30. |
| MR-009.6 Presupuesto contexto/tiempo | RECOMMENDED | VERIFIED | Pre-existente | ORCHESTRATOR.md §3 Token Economics Gate. |
| MR-011.1 Sesión ejecutora + Builder/Verifier/Closer | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §28. |
| MR-011.2 Separación por gates materiales | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §28-30. |
| MR-011.3 Evidencia proporcional a DONE_BAR | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §28. |
| MR-011.4 Cambio de método tras 2 fallos equivalentes | RECOMMENDED | VERIFIED | 2026-09-02 | Matiz añadido sobre RULE-01/PATTERN-07 existente. |
| MR-011.5 Git read-only ≠ commit/push; memoria asistiva | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §31. |
| MR-011.6 Trackers por cambio real | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §31. |
| MR-012.1 ASSIGNMENT + DECISIONS_ALREADY_CLOSED | RECOMMENDED | VERIFIED | 2026-09-02 | AGENTS.md. |
| MR-012.2 Solución suficiente | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §31 + AGENTS.md. |
| MR-012.3 No microfix recursivo | RECOMMENDED | VERIFIED | 2026-09-02 | AGENTS.md guardrails genéricos, matiz añadido. |
| MR-012.5 Context delta only | RECOMMENDED | VERIFIED | 2026-09-02 | AGENTS.md + ORCHESTRATOR.md §31. |
| MR-012.6 Frontera A0/A1 estado externo | CRITICAL — **risk_live: YES** | VERIFIED | 2026-09-02 | Ver Sección 5. |
| MR-012.7 Validación patch proposal | RECOMMENDED | VERIFIED | 2026-09-02 | AGENTS.md, junto a MR-012.6. |
| MR-013.2 Interacción directa guiada | RECOMMENDED | VERIFIED | Pre-existente | ORCHESTRATOR.md §2. |
| MR-013.3 Grilling proporcional | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §27. |
| MR-013.6 Deliberación barata / transmisión cara | RECOMMENDED | VERIFIED | 2026-09-02 | ORCHESTRATOR.md §27. |
| MR-013.7 Disciplina de poda y sedimento | RECOMMENDED | VERIFIED | 2026-09-02 | Este APPLY es delta, no reemplazo. |
| MR-014.1 RETRIEVABLE_EXPERIENCE | RECOMMENDED | VERIFIED | 2026-09-02 | Capa de recuperación en `AGENT_EXPERIENCE_LEDGER.md`. |
| PATTERN-16 REPOSITORY_GROUNDED_PREFLIGHT | RECOMMENDED | VERIFIED | 2026-09-02 | AGENTS.md preflight IMPACT/BASELINE/NORMATIVE_STATE. |
| MR-014.3 CANONICAL_CHANGE_ID_FIDELITY | RECOMMENDED | VERIFIED | 2026-09-02 | Esta misma sección. |

**Total VERIFIED: 38.**

---

## 4 — Variantes locales aprobadas (`LOCAL_OVERRIDE_APPROVED`)

Objetivo del cambio satisfecho mediante una variante local deliberada y aprobada, sin copiar
literalmente el mecanismo o artefacto canónico.

| change_id | Patrón / cambio | Disposición | Adoptado en | Nota |
|---|---|---|---|---|
| MR-004.2 doc DOMAIN_PRODUCT_MODELING_GATE.md | RECOMMENDED | LOCAL_OVERRIDE_APPROVED | 2026-09-02 | `docs/studio/STUDIO_PRODUCT_FORM_MODELING_PLAYBOOK.md` local en vez del doc genérico — satisface el objetivo del gate sin copiar literalmente el mecanismo canónico. |
| MR-005.1 OUTCOME_FIRST_PROMPTING | RECOMMENDED | LOCAL_OVERRIDE_APPROVED | 2026-09-02 | Contrato instalado directo en ORCHESTRATOR.md §28 en vez del doc dedicado `OUTCOME_FIRST_PROMPTING.md` — variante local deliberada. |
| MR-013.1 Estado decisorio activo (`ACTIVE_DECISION_STATE.md`) | RECOMMENDED | LOCAL_OVERRIDE_APPROVED | 2026-09-02 | Ver **Owner Decision A** abajo. |

**Total LOCAL_OVERRIDE_APPROVED: 3.**

### Owner Decision A — MR-013.1

```
adoption_status: LOCAL_OVERRIDE_APPROVED
```

- **Rationale:** Catenaccio adopta consciencia del estado decisorio mediante ORCHESTRATOR.md, pero
  por decisión del owner NO crea `ACTIVE_DECISION_STATE.md` vacío.
- **Trigger de la variante local:** crear `ACTIVE_DECISION_STATE.md` cuando exista el primer
  `REJECTED` durable real que necesite `reopen_if`.
- Hasta que ese trigger se cumpla, el archivo **no se crea**.
- Esto **no** es `DEFERRED`: la decisión está tomada y la variante local está aprobada de forma
  terminal, no pendiente de revisión.

---

## 5 — Cambios críticos con `risk_live: YES` (verificados, sin autorizar runtime)

| Cambio | Release | `risk_live` | `activation_prerequisite` | `blocking_scope` | Estado |
|--------|---------|--------------|----------------------------|-------------------|--------|
| PATTERN-14 CONTROLLED_EXTERNAL_WRITE_FOUNDATION | MR-007 | true | false | `NEXT_EXTERNAL_WRITE` (cualquier nueva escritura Woo/Vercel/Supabase requiere `A3` explícito) | VERIFIED — ver Sección 3 (guardrail documentado en AGENTS.md; ninguna escritura nueva autorizada por esta declaración) |
| MR-012.6 Frontera A0/A1 de estado externo | MR-012 | true | false | `NEXT_EXTERNAL_WRITE` | VERIFIED — ver Sección 3 (mismo guardrail) |

`risk_live: YES` en ambos porque Studio ya tiene superficies reales de escritura externa Woo
(`SHADOW_FIRST_WOO_ATTACH_PATTERN`, `WOO_WRITE_SYNC_FOUNDATION_WITH_FABLE_ULTRACODE` —
`docs/meta/AGENT_EXPERIENCE_LEDGER.md`, SLT-011). Esta declaración documenta el riesgo existente;
no autoriza ninguna escritura nueva ni modifica runtime.

---

## 6 — Cambios opcionales sin situación activa (`NOT_YET_NEEDED`)

OPTIONAL revisado, sin trigger actual. Es un estado completo y válido: no es deuda.

| Cambio | Release | Situación que lo activa | Estado |
|--------|---------|-------------------------|--------|
| MR-005.4 PACK_INHERITANCE_MODEL | MR-005 | Referencia futura de herencia por bloques | NOT_YET_NEEDED |
| MR-005.5 LAFABRICA_PROJECT_METADATA | MR-005 | Referencia futura | NOT_YET_NEEDED |
| PATTERN-11 GSC_API_READONLY_CONNECTOR | MR-008 | Si se reactiva un conector GSC (hay experiencia previa saneada en SLT-002) | NOT_YET_NEEDED |
| PATTERN-13 APPROVED_BASE_DELTA_PATCHING | MR-008 | Escenario multi-agente de patching sobre base visual aprobada | NOT_YET_NEEDED |
| PATTERN-15 PRODUCT_TARGET_CONTRACT_DISCOVERY | MR-010 | Módulo nuevo o rediseño transversal dentro de Catenaccio | NOT_YET_NEEDED |
| MR-010.2 Wiring pre-CODE de PATTERN-15 | MR-010 | Atado a PATTERN-15 | NOT_YET_NEEDED |
| MR-012.4 Bucle técnico autónomo (PROVISIONAL) | MR-012 | Situación de ejecución autónoma acotada | NOT_YET_NEEDED |
| MR-013.4 Prototipo visual desechable | MR-013 | Tarea de prototipo UI/producto visual activa | NOT_YET_NEEDED |
| MR-013.5 Feedback loop antes de hipótesis | MR-013 | Bug no trivial abierto | NOT_YET_NEEDED |

**Total NOT_YET_NEEDED: 9.**

---

## 7 — Cambios no aplicables (`NOT_APPLICABLE`)

Fuera del dominio o superficie del hijo. Es una adopción completa y correcta, no una deuda.

| Cambio | Release | Dominio del cambio | Por qué no aplica aquí |
|--------|---------|--------------------|------------------------|
| MR-006.2 CHILD_PROJECT_REGISTRY | MR-006 | all (operativo de lafabrica) | Vive en el repo lafabrica, no en el hijo. |
| PATTERN-12 B2B_RETAIL_FALLBACK_DETECTION | MR-008 | e-commerce/B2B | Catenaccio es venta B2C de vintage, no B2B. |
| MR-011.7 Cierre histórico de CROSS_AGENT_CONTEXT_ENGINEERING | MR-011 | all | Catenaccio nunca adoptó esa capa. |

**Total NOT_APPLICABLE: 3.**

**Verificación de cobertura (Secciones 3+4+6+7): 38 + 3 + 9 + 3 = 53/53.**

---

## 7.1 — Históricos fuera de rango MR-004..MR-014 (no cuentan en la cobertura 53/53)

Estos `change_id` pertenecen a MR-001/MR-002/MR-003 (fuera del rango canonicalizado por esta
declaración) y se mencionan únicamente para preservar contexto de reclasificaciones previas. No
llevan `adoption_status` vigente y no forman parte del recuento 53/53 de la Sección 2.1.

| change_id | Release | Patrón / cambio | Nota histórica |
|---|---|---|---|
| PATTERN-01 SHADOW_FIRST | MR-001 | SHADOW_FIRST | Adoptado Sesión 013 (2026-06-13): THEME_SHADOW_SCAFFOLD y `SHADOW_FIRST_WOO_ATTACH_PATTERN` en Studio. |
| PATTERN-02 LONG_RUNNING_PROJECT_GOVERNANCE | MR-001 | LONG_RUNNING_PROJECT_GOVERNANCE | Adoptado en el arranque (2026-06-06): ORCHESTRATOR.md, BACKLOG.md, HISTORIAL_SESIONES.md, DECISIONS.md. |
| PATTERN-04 SLT_MIGRATION_IN_ACTIVE_REPOS | MR-001 | SLT_MIGRATION_IN_ACTIVE_REPOS | Pre-existente: `docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md`. |
| PATTERN-06 AGENT_EXPERIENCE_LEDGER | MR-002 | AGENT_EXPERIENCE_LEDGER | Pre-existente, extendido con capa MR-014.1 en esta revisión. |
| PATTERN-07 STOP_AND_REPLAN_MICROPATCH_PROTOCOL | MR-002 | STOP_AND_REPLAN_MICROPATCH_PROTOCOL | Reclasificado con evidencia (Sesión 2026-06-24): AGENTS.md "STOP_AND_REPLAN" + ORCHESTRATOR.md §19 RULE-01. |
| PATTERN-08 TRANSACTIONAL_EMAIL_PRODUCTION_GATE | MR-002 | TRANSACTIONAL_EMAIL_PRODUCTION_GATE | Reclasificado con evidencia (Sesión 2026-06-24): AGENTS.md "Email transaccional WooCommerce — PRODUCTION_ONLY_VALIDATION" + DEC-PABLO-02/03. El `pending_critical` heredado del bootstrap MR-003 era falso: el gate ya existía. |
| PATTERN-09 ECOMMERCE_HOOK_STATE_GUARD | MR-002 | ECOMMERCE_HOOK_STATE_GUARD | Reclasificado con evidencia (Sesión 2026-06-24): AGENTS.md "WooCommerce hooks — usar estado del objeto". |

---

## 8 — Notas de adopción

- Esta revisión (2026-09-02) corrige la semántica de disposición de este archivo: los estados
  `ADOPTED`, `ALREADY_EQUIVALENT`, `DEFER_WITH_GATE` y `DONE_WITH_PROJECT_SPECIFIC_IMPLEMENTATION`
  usados en la migración MR-003→MR-014 no son vocabulario canónico del protocolo de notificación
  de actualizaciones (`LAFABRICA_UPDATE_NOTIFICATION_PROTOCOL.md`). Cada fila fue revisada
  individualmente contra su evidencia y reclasificada a `VERIFIED`, `LOCAL_OVERRIDE_APPROVED`,
  `NOT_APPLICABLE` o `NOT_YET_NEEDED`. Ningún `change_id` cambió de release, título ni contenido —
  solo la etiqueta de disposición.
- Bootstrap inicial en MR-003 (2026-06-26) declaraba `pending_critical: [ PATTERN-08 ]` como
  `REVIEW_REQUIRED`. La migración de 2026-09-02 confirmó que el gate ya existía en AGENTS.md desde
  2026-06-24 — el pending era falso y se eliminó (PATTERN-08 es histórico fuera de rango, Sección 7.1).
- PATTERN-01 SHADOW_FIRST tiene evidencia directa: THEME_SHADOW_SCAFFOLD (migración A0) y
  `SHADOW_FIRST_WOO_ATTACH_PATTERN` (Studio, S026B) — dos superficies distintas del mismo patrón.
- Todo el contenido de las secciones 22-33 nuevas de ORCHESTRATOR.md y sus equivalentes en
  AGENTS.md se instaló por delta, preservando literalmente los contratos locales previos
  (WordPress/Woo producción requiere autorización explícita, ausencia permanente de SSH,
  `PABLO_VISUAL_OK`, `UI_DESIGN_GATE`/`DESIGN.md`, Studio ≠ storefront, `SHADOW_FIRST`,
  `DOMAIN_PRODUCT_MODELING_GATE`, `PRODUCTION_ONLY_VALIDATION` + TEST B, guardia de hooks Woo por
  estado persistente, `STOP_AND_REPLAN`).
- El contrato ORCA EXECUTION SURFACE (ORCHESTRATOR.md §33) es local a Catenaccio — no es
  metodología canónica de lafabrica y no debe copiarse a otro hijo como si lo fuera.
- No se creó `docs/meta/ACTIVE_DECISION_STATE.md` en esta migración (Owner Decision A, Sección 4 —
  `LOCAL_OVERRIDE_APPROVED`, no `DEFERRED`).

---

## 9 — Siguiente revisión recomendada

- **Cuándo:** on-reactivation, o cuando lafabrica publique una release posterior a MR-014.
- **Disparador:** nueva release de lafabrica detectada vía CHECK (ORCHESTRATOR.md §32), o inicio de
  bloque mayor.
- **Primera tarea de esa revisión:** diffear `lafabrica_release_base` (MR-014) contra la release
  actual del Release Ledger y adoptar CRITICAL (si aplica) + RECOMMENDED pendientes antes de
  retomar features.

---

## 10 — Checklist de privacidad y no-cascada

```
[x] Este archivo no contiene credenciales, PII, datos de clientes/pedidos/precios ni rutas reales
[x] Las notas de adopción describen metodología, no lógica de negocio sensible
[x] privacy_level marcado correctamente (INTERNAL_ONLY)
[x] La adopción se hizo por PULL: lafabrica no empujó cambios a este repo
[x] APPLY fue tras el ASSIGNMENT del operador, un solo hijo por sesión, sin push automático
[x] DOMAIN_SPECIFIC fuera de dominio están marcados NOT_APPLICABLE, no copiados
[x] No se adoptó nada estando en STANDBY (proyecto ACTIVE)
[x] Los bloques gestionados (`MR008_UPDATE_CHECK`) tienen BEGIN/END únicos y balanceados
[x] Vocabulario de disposición vigente restringido a VERIFIED/NOT_APPLICABLE/NOT_YET_NEEDED/LOCAL_OVERRIDE_APPROVED
```

---

## Historial de adopción

| Fecha | Release adoptada | Cambio | Quién |
|-------|------------------|--------|-------|
| 2026-06-26 | MR-003 | Bootstrap inicial — declaración de adopción instalada vía LAFABRICA_CHILDREN_ADOPTION_BOOTSTRAP_V1 | DOCS_ONLY agent |
| 2026-09-02 | MR-014 | Migración MR-003→MR-014 por delta. Cobertura canónica completa MR-004..MR-014 (53 change_id). PATTERN-07/08/09 reclasificados con evidencia como históricos fuera de rango (el pending_critical de PATTERN-08 era falso). PATTERN-14/MR-012.6 declarados `risk_live: YES` sin autorizar runtime. MR-013.1 con Owner Decision A. Contrato Outcome-First, Builder/Verifier/Closer, A0-A3/R0-R3, PATTERN-16 preflight y CHECK de MR-008 instalados por delta en ORCHESTRATOR.md/AGENTS.md. Sin push. | Claude Code (Sonnet) |
| 2026-09-02 | MR-014 | Corrección de disposición canónica (mismo APPLY, sin avanzar base): las 53/53 filas MR-004..MR-014 reclasificadas al vocabulario terminal canónico de `LAFABRICA_UPDATE_NOTIFICATION_PROTOCOL.md` (`VERIFIED` / `NOT_APPLICABLE` / `NOT_YET_NEEDED` / `LOCAL_OVERRIDE_APPROVED`). MR-013.1 fijado en `LOCAL_OVERRIDE_APPROVED` (Owner Decision A, sin crear `ACTIVE_DECISION_STATE.md`). Patrones fuera de rango (MR-001/002) movidos a Sección 7.1 como históricos, sin `adoption_status` vigente. `lafabrica_release_base: MR-014` reconfirmado con 53/53 disposiciones terminales y cero estados no terminales. Sin push. | Claude Code (Sonnet) |
