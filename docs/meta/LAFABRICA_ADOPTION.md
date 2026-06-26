# LAFABRICA_ADOPTION.md — catenaccio-vintage

Declaración de adopción metodológica de este proyecto hijo frente a lafabrica.

**Copiar a:** `docs/meta/LAFABRICA_ADOPTION.md` del proyecto hijo.
**Fuente del protocolo:** `lafabrica-template/docs/orchestrator/LAFABRICA_RELEASE_PROTOCOL.md`.
**Política:** este archivo es la **única fuente de verdad** de qué release y patrones metodológicos tiene adoptados este proyecto. El operador no recuerda el estado de cada repo — lo lee aquí.
**Quién mantiene:** Orquestador, al adoptar una release y al reactivar el proyecto. Modelo **pull**: lafabrica nunca empuja; este proyecto adopta cuando le toca.

---

## Estado de adopción (bloque legible por máquina)

> Mantener estas claves exactas. Un futuro Brain Console las parsea para calcular el estado del ecosistema sin intervención humana.

```
project: catenaccio-vintage
domain: e-commerce/CMS — tienda WooCommerce 10.8.1 + WordPress 7.0 (producción activa); migración A0 en curso
lafabrica_release_base: MR-003
lafabrica_release_current_seen: MR-003
pending_critical: [ PATTERN-08 ]
pending_recommended: [ PATTERN-05, PATTERN-07, PATTERN-09 ]
project_state: ACTIVE
last_reviewed: 2026-06-26
next_review_recommended: on-reactivation o apertura de sesión A0_MIGRATION_PLAN
privacy_level: INTERNAL_ONLY
```

> **Nota de bootstrap:** esta es la declaración inicial (bootstrap MR-003). PATTERN-08 figura como REVIEW_REQUIRED — la tienda WooCommerce es producción activa sin SSH; el estado del gate de email transaccional no es verificable desde los docs sin una sesión técnica. Ver sección 4.

---

## 1 — Identidad

- **Proyecto:** catenaccio-vintage
- **Dominio:** e-commerce/CMS — tienda WooCommerce (WordPress 7.0 + WooCommerce 10.8.1) en producción activa. Elementor Pro expira ~2026-07-01. Sin SSH (Raiola Inicio SSD 2.0). Migración A0 de tema en curso.
- **Estado del proyecto:** ACTIVE (sesiones 013/013b, junio 2026; A0 migration plan desbloqueado)
- **Fecha de última revisión de adopción:** 2026-06-26

---

## 2 — Release base adoptada

- **Release base de lafabrica adoptada:** MR-003
- **Release actual de lafabrica vista en esta revisión:** MR-003 (del Release Ledger en `LAFABRICA_RELEASE_PROTOCOL.md`)
- **Gap:** ninguno — declaración inicial instalada en la release actual

---

## 3 — Patrones adoptados

Patrones del catálogo `ECOSYSTEM_LEARNING_PATTERNS.md` que este proyecto **ya aplica**.

| Patrón | Tipo de cambio | Adoptado en | Nota |
|--------|----------------|-------------|------|
| PATTERN-01 SHADOW_FIRST | CRITICAL | Sesión 013 (2026-06-13) | La migración A0 usa explícitamente THEME_SHADOW_SCAFFOLD: child theme shadow creado antes de tocar el tema activo. Ver `docs/operations/THEME_SHADOW_SCAFFOLD.md` y `THEME_SHADOW_IMPLEMENT.md`. |
| PATTERN-02 LONG_RUNNING_PROJECT_GOVERNANCE | RECOMMENDED | Arranque (2026-06-06) | ORCHESTRATOR.md, BACKLOG.md, HISTORIAL_SESIONES.md, TOKEN_ECONOMICS.md, DECISIONS.md presentes desde el inicio |
| PATTERN-04 SLT_MIGRATION_IN_ACTIVE_REPOS | RECOMMENDED | Pre-existente | `docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md` presente |
| PATTERN-06 AGENT_EXPERIENCE_LEDGER | RECOMMENDED | Pre-existente | `docs/meta/AGENT_EXPERIENCE_LEDGER.md` presente |

---

## 4 — Cambios críticos pendientes (CRITICAL)

| Cambio | Release | ¿Riesgo vivo aquí? | Acción | Estado |
|--------|---------|--------------------|--------|--------|
| PATTERN-08 TRANSACTIONAL_EMAIL_PRODUCTION_GATE | MR-002 | **UNKNOWN — requiere revisión** | Verificar si WooCommerce tiene gates de email transaccional antes de que la migración A0 o cualquier sesión toque configuración de WooCommerce | REVIEW_REQUIRED |

**Nota:** catenaccio-vintage es producción activa WooCommerce. PATTERN-08 aplica en-dominio como CRITICAL. El repo no tiene evidencia de un gate explícito de email transaccional documentado. Dado que la siguiente sesión (`A0_MIGRATION_PLAN`) es de tema (no toca WooCommerce/email), el riesgo inmediato es bajo — pero debe resolverse antes de cualquier sesión que modifique configuración de WooCommerce, plugins de email o estados de pedido.

**Regla:** resolver en la primera sesión que toque configuración WooCommerce, no al inicio de A0_MIGRATION_PLAN si es solo de tema.

---

## 5 — Cambios recomendados pendientes (RECOMMENDED)

| Cambio | Release | Adoptar cuándo | Estado |
|--------|---------|----------------|--------|
| PATTERN-05 AI_FIRST_LAYERED_DOCUMENTATION | MR-002 | Próximo cierre de bloque A0 | PENDING — ORCHESTRATOR.md tiene orden de lectura pero no arquitectura documental por capas explícita al estilo AI_FIRST |
| PATTERN-07 STOP_AND_REPLAN_MICROPATCH_PROTOCOL | MR-002 | Próximo cierre de bloque mayor | UNKNOWN — el Token Economics Gate cubre parte del espíritu pero el protocolo micropatch explícito no está documentado |
| PATTERN-09 ECOMMERCE_HOOK_STATE_GUARD | MR-002 | Primera sesión que modifique hooks WooCommerce | REVIEW_REQUIRED — WooCommerce activo, aplica en dominio, estado actual desconocido |

---

## 6 — Patrones pendientes opcionales / situacionales (OPTIONAL)

| Cambio | Release | Situación que lo activa | Estado |
|--------|---------|-------------------------|--------|
| PATTERN-03 STANDBY_AS_FIRST_CLASS_STATE | MR-001 | Si el proyecto entra en STANDBY tras A0 o cambio de stack | NOT_YET_NEEDED — proyecto ACTIVE |
| Protocolo de releases metodológicas + LAFABRICA_ADOPTION.md | MR-003 | Instalado en este bootstrap | DONE — este archivo |

---

## 7 — Cambios no aplicables (NOT_APPLICABLE)

Ninguno en esta revisión. Todos los DOMAIN_SPECIFIC[e-commerce/CMS] aplican a este proyecto.

---

## 8 — Notas de adopción

- PATTERN-01 tiene evidencia directa y explícita: la decisión de A0 migration usa THEME_SHADOW_SCAFFOLD (hijo activo + shadow separado). Ver `docs/operations/THEME_SHADOW_SCAFFOLD.md`. La sesión 013b completó los blockers del shadow theme. El patrón está operativo.
- El proyecto arrancó sin SSH por restricción de hosting (Raiola Inicio SSD 2.0). Esto limita las superficies de agente disponibles pero no invalida los patrones metodológicos.
- Elementor Pro expira ~2026-07-01: riesgo activo de continuidad del tema. La migración A0 es la respuesta directa a este riesgo.
- PATTERN-08 se revisará cuando se toque configuración WooCommerce, no necesariamente en A0_MIGRATION_PLAN (que es solo de tema).

---

## 9 — Siguiente revisión recomendada

- **Cuándo:** al apertura de sesión A0_MIGRATION_PLAN o primera sesión que toque WooCommerce config
- **Disparador:** nueva release de lafabrica / inicio de bloque mayor / sesión WooCommerce
- **Primera tarea de esa revisión:** para A0_MIGRATION_PLAN — confirmar que solo toca tema, no WooCommerce/email (si toca WooCommerce → resolver PATTERN-08 primero).

---

## 10 — Checklist de privacidad y no-cascada

```
[x] Este archivo no contiene credenciales, PII, datos de clientes/pedidos/precios ni rutas reales
[x] Las notas de adopción describen metodología, no lógica de negocio sensible
[x] privacy_level marcado correctamente (INTERNAL_ONLY)
[x] La adopción se hizo por PULL: lafabrica no empujó cambios a este repo
[ ] PATTERN-08 requiere revisión — no se marcó como adoptado sin confirmación
[x] DOMAIN_SPECIFIC fuera de dominio están marcados NOT_APPLICABLE o NOT_YET_NEEDED
[x] No se adoptó nada estando en STANDBY (proyecto ACTIVE)
```

---

## Historial de adopción

| Fecha | Release adoptada | Cambio | Quién |
|-------|------------------|--------|-------|
| 2026-06-26 | MR-003 | Bootstrap inicial — declaración de adopción instalada vía LAFABRICA_CHILDREN_ADOPTION_BOOTSTRAP_V1 | DOCS_ONLY agent |
