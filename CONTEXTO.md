# CONTEXTO.md — Catenaccio Vintage

Estado vivo del proyecto. **Append-only. Nunca replace_all. Nunca editar entradas pasadas.**

Actualizar al cierre de cada sesión. Si no se actualizó → la sesión no cerró limpia.

---

## Fase actual

**Fase:** Arranque  
**Desde:** 2026-06-06  
**Descripción:** Repo recién generado desde SEED. Sin sesiones reales todavía.

---

## Experimento activo

**Hipótesis:** Catenaccio Vintage puede beneficiarse de una migración hacia un stack más moderno y compatible con el workflow de lafabrica.  
**Inicio:** 2026-06-06  
**Criterio de éxito:** Tener el AS-IS de Catenaccio Vintage validado, las fuentes principales registradas, una opción TARGET aprobada y un PROJECT_SEED implementable para iniciar la reconstrucción o migración técnica.  
**Criterio de fallo:** _(completar)_  
**Rollback:** _(completar)_  
**Fecha límite de decisión:** 2026-06-06

---

## Riesgos activos

| Riesgo | Impacto | Estado | Última revisión |
|--------|---------|--------|-----------------|
| Copiar archivos brutos al repo | Alto/Medio/Bajo | Activo/Mitigado | 2026-06-06 |
| Decidir stack antes de entender el proyecto | Alto/Medio/Bajo | Activo/Mitigado | 2026-06-06 |

Hipótesis no verificadas del SEED:
- : pendiente validación
- : pendiente validación

---

## Siguiente paso recomendado

**Sesión 006 — Aprobación + arranque Track 0 + Track 1.** TARGET_OPTIONS v2 EN_REVISIÓN (2026-06-13). El operador aprueba estrategia A0+B1 → Track 0: auditoría elementor_library + migración Cart/Mi Cuenta/mini-cart. Track 1 (paralelo): Application Password + scaffold Studio + test WC REST API. Deadline Track 0: ~2026-07-01.

---

## Sesiones recientes (mantener últimas 5)

<!-- APPEND AQUÍ — no editar entradas anteriores -->
<!-- Formato: Sesión N (YYYY-MM-DD, Agente): MODO / tipo. [Qué se hizo]. [Qué se validó]. [Qué NO se tocó]. -->

Sesión 0 (YYYY-MM-DD, lafabrica-template): LITE / init. Template aplicado desde SEED. Docs base generados. No se tocó código del proyecto.

Sesión 1 (2026-06-06, Claude Code Sonnet): DOCS_ONLY / strategic. Registrado nuevo driver estratégico: suscripción de Elementor Pro cancelada. La dependencia de Elementor Pro pasa a ser un factor a evaluar en AS-IS y TARGET. No se decide migración ni arquitectura. Próximo bloque recomendado: revisar AS-IS con el impacto de Elementor incluido, luego preparar TARGET_OPTIONS.

Sesión 002 (2026-06-06, Claude Code Sonnet): LITE / DOCS_ONLY / security-sync. SEC-001 y SEC-002 marcados RESUELTOS por confirmación manual del operador. AS_IS_UNDERSTANDING.md actualizado con versiones confirmadas (WP 7.0, WooCommerce 10.8.1), hosting server (com1014, cPanel 134.0, Apache 2.4.67, MariaDB 11.4.10-cll-lve), matiz Elementor Pro (caduca en semanas), LiteSpeed como problema (ralentiza la web), hipótesis workflow/AI-first validada, Bloque 3 validado. BACKLOG.md: bloqueante SEC eliminado, nueva tarea SERVER_CONTEXT_CHECK_READONLY añadida. No se tocó código, WordPress, producción, credenciales, hosting, Google Cloud ni dominio.

Sesión 003 (2026-06-10, Claude Code Sonnet): API_FAST_DISCOVERY / SERVER_CONTEXT_CHECK_READONLY. Evidencias recopiladas vía WP Admin (Salud del sitio + WooCommerce System Status) sin SSH. Confirmados: WP 7.0, PHP 8.3.31, servidor HTTP LiteSpeed (no Apache — corrección AS-IS), 28 productos, HPOS activo, WooPayments live, 19 plugins activos, 3 inactivos. **Dato crítico: Elementor Pro expira ~2026-07-01, operador NO renueva** — pasa a ser el driver y deadline de TARGET_OPTIONS. Riesgos detectados: OPcache lleno (16 bytes libres), WP_MEMORY_LIMIT=40M, mini-cart override Elementor desactualizado, WPS Hide Login inactivo. AS_IS_UNDERSTANDING.md actualizado con todos los datos confirmados, 7 nuevos PROBs añadidos (09-15). BACKLOG.md actualizado. No se tocó código, WordPress, producción, credenciales ni hosting.

Sesión 004 (2026-06-10, Claude Code Sonnet): DOCS_ONLY / as-is-validation. **AS-IS validado por el operador.** AS_IS_UNDERSTANDING.md cambiado de BORRADOR a VALIDADO_POR_USUARIO. VALIDATION_RECORD.md con VAL-004. BACKLOG.md, CONTEXTO.md, HISTORIAL_SESIONES.md y agent_events.jsonl actualizados. Workflow pasa a AS_IS_VALIDADO. Siguiente sesión: TARGET_OPTIONS con deadline ~2026-07-01. No se tocó código, WordPress ni producción.

Sesión 004c (2026-06-13, Claude Code Sonnet): LITE / DOCS_ONLY / repo-os-sync. Transferencia de aprendizajes genéricos de Bijuymoda Suite al sistema operativo documental de Catenaccio. Actualizado ORCHESTRATOR.md (stack real, lectura proporcional +git step 0, guardrails de dominio, tabla de agentes, §16 WORKSTREAM_ANCHOR, §17 TARGET binario), AGENTS.md (tabla de superficies específica, guardrails de dominio, stop-loss con clasificación, microparches WP), CHATGPT_PROJECT_INSTRUCTIONS.md (estado actual, agentes, workstream anchor). No se tocó WordPress, producción, TARGET_OPTIONS ni Bijuymoda Suite.

Sesión 005 (2026-06-13, Claude Code Sonnet): DOCS_ONLY / strategic / TARGET_OPTIONS. TARGET_OPTIONS.md completado con comparativa A/B/C/D/E, tabla comparativa, riesgos, plan 7/30/90 días. Veredicto inicial: APPROVE Opción A — WP+WC sin Elementor Pro. [CORREGIDO en 005b]

Sesión 005b (2026-06-13, Claude Code Sonnet): DOCS_ONLY / strategic / ROOT_CAUSE_AND_TARGET_REFRAME. TARGET_OPTIONS.md reescrito con causa raíz de la fricción real (5 bloqueantes: Elementor, backoffice, catálogo, performance, visión). Veredicto corregido: APPROVE A0 + B1 — Track 0 (continuidad Elementor antes del 2026-07-01) + Track 1 (Catenaccio Studio: backoffice/PIM AI-first con Next.js + WC REST API). Modelo de acceso sin SSH definido (Application Password, usuario limitado, DRAFT_ONLY). DECISIONS.md, BACKLOG.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. Workflow: AS_IS_VALIDADO → TARGET_OPTIONS EN_REVISIÓN (v2). Pendiente: operador aprueba A0+B1. No se tocó WordPress, producción, pagos ni código.

