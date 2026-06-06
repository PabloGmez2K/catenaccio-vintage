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

Sesión de revisión AS-IS con el nuevo dato de Elementor Pro cancelado. Evaluar impacto sobre el stack actual antes de preparar TARGET_OPTIONS.

---

## Sesiones recientes (mantener últimas 5)

<!-- APPEND AQUÍ — no editar entradas anteriores -->
<!-- Formato: Sesión N (YYYY-MM-DD, Agente): MODO / tipo. [Qué se hizo]. [Qué se validó]. [Qué NO se tocó]. -->

Sesión 0 (YYYY-MM-DD, lafabrica-template): LITE / init. Template aplicado desde SEED. Docs base generados. No se tocó código del proyecto.

Sesión 1 (2026-06-06, Claude Code Sonnet): DOCS_ONLY / strategic. Registrado nuevo driver estratégico: suscripción de Elementor Pro cancelada. La dependencia de Elementor Pro pasa a ser un factor a evaluar en AS-IS y TARGET. No se decide migración ni arquitectura. Próximo bloque recomendado: revisar AS-IS con el impacto de Elementor incluido, luego preparar TARGET_OPTIONS.

