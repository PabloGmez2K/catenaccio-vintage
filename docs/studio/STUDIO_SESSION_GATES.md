# STUDIO_SESSION_GATES — Gates obligatorios para integraciones Studio / Woo / ACF

Checklist operativo para evitar sesiones sucias en la suite Catenaccio Studio. Cada gate es un
artefacto que el agente debe producir **antes de CODE**, con resultado binario PASS/FAIL.

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-29
**Sesión:** S023-STRATEGY — OPUS_MAX_STUDIO_SUITE_ARCHITECTURE_REVIEW
**Modo:** STRATEGIC_REQUIRED / DOCS_ONLY / NO_CODE
**Origen:** `STUDIO_SUITE_BUILD_SYSTEM_LESSONS.md §5` (formalizado aquí)
**Hermanos:** `STUDIO_TARGET_ARCHITECTURE.md`, `STUDIO_ROADMAP_S023_S030.md`
**Relación con governance:** extiende ORCHESTRATOR §20 (`DOMAIN_PRODUCT_MODELING_GATE`) y §19
(RULE-01..05); AGENTS.md (STOP_AND_REPLAN).

---

## 0. Cómo se usan

1. El orquestador, al preparar el prompt de una sesión Studio/Woo/ACF, **lista los gates aplicables**
   (ver matriz §7) en el campo Guardrails del prompt (ORCHESTRATOR §7).
2. El agente **produce el artefacto de cada gate antes de escribir código** y lo incluye en el reporte.
3. Si un gate da FAIL → no se pasa a CODE; se reabre diagnóstico o se escala.
4. El cierre de sesión declara, por gate: PASS / FAIL / N/A.

Estos gates son **obligatorios** para toda sesión que toque payload Woo, taxonomías, categorías,
campos ACF o UI de producto. Son **N/A** para sesiones puramente documentales o de sync read-only sin
cambio de payload (aunque `DATA_LAYER_MAPPING_GATE` aplica también a diseñar la caché).

---

## 1. PRODUCT_REFERENCE_DIFF_GATE

**Disparador:** cualquier creación o parche de payload Woo/ACF.

**Regla:** antes de implementar, comparar un **producto publicado bueno** (referencia: **1731 /
Rivaldo**) contra el **producto generado por Studio**. El diff debe cubrir: root fields, `meta_data`,
companion keys (`_field`), categorías, taxonomías (`wp_term_relationships`), stock, imágenes y meta
Rank Math.

**Artefacto:** tabla campo-a-campo "referencia vs generado vs gap vs cómo enviarlo" (modelo:
`STUDIO_WC_DRAFT_PUBLISHABILITY_GAP_AUDIT.md §MATRIZ`).

**PASS si:** toda diferencia está clasificada (gap real / aceptado MVP / no aplica) **antes** del
primer patch.

**FAIL si:** se implementa el payload sin diff previo. (Fue la causa raíz de S022C.)

---

## 2. ACF_CONFIG_GATE

**Disparador:** escribir a cualquier campo ACF.

**Regla:** antes de escribir, confirmar de la config ACF: tipo de campo, return format,
`save_terms`/`load_terms`, single/multi-valor y **field key estable** (`field_xxx`).

**Artefacto:** tabla de campos ACF implicados con esas 6 propiedades (modelo:
`STUDIO_WC_DRAFT_PUBLISHABILITY_GAP_AUDIT.md §CONFIRMACIÓN ACF`).

**PASS si:** se conoce, por campo, si necesita companion key, si es array (p.ej. `ano_temporada` →
`["180"]`) y si `save_terms` exige relación real en `wp_term_relationships`.

**FAIL si:** se asume que `meta_data` hidrata ACF por completo. (Era falso para ACF Taxonomy.)

**Nota:** las field keys actuales están en `bridge.ts:ACF_KEYS`. Si Pablo reconfigura el grupo ACF,
este gate debe re-ejecutarse.

---

## 3. DATA_LAYER_MAPPING_GATE

**Disparador:** cualquier campo nuevo en el payload, o diseño de la caché de términos.

**Regla:** para **cada** dato, documentar en qué capa(s) vive: Woo root / category / `attributes[]` /
`wp_postmeta` / ACF companion key / ACF taxonomy / `wp_term_relationships` / plugin meta (Filtro
Camisetas Pro) / Rank Math meta.

**Artefacto:** el mapa de capas (modelo: `STUDIO_TARGET_ARCHITECTURE.md §2`).

**PASS si:** ningún dato del payload tiene capa "desconocida".

**FAIL si:** durante la implementación aparece una capa no mapeada → STOP (ver §5).

---

## 4. FULL_FIXTURE_TEST_GATE

**Disparador:** cierre de cualquier fase que afecte publicabilidad.

**Regla:** el test usa una **camiseta completa**: equipo, liga, año, jugador (si aplica), talla,
condición, medidas (ancho_cm/largo_cm), defectos, categoría, precio, stock y contenido SEO. La fixture
canónica está en `STUDIO_TARGET_ARCHITECTURE.md §8`.

**PASS si:** Pablo valida el resultado real (WP Admin / preview), no solo typecheck.

**FAIL si:** se cierra con prueba parcial (un solo campo, sin jugador, sin medidas…).

---

## 5. NO_MICROPATCH_LOOP_GATE  (meta-gate / stop-loss)

**Disparador:** durante implementación aparecen **2+ capas no previstas**, o el código se vuelve más
complejo con cada intento, o 3 sesiones sin TEST B pass.

**Regla:** **parar**. No encadenar microparches. Reabrir diagnóstico, actualizar el mapa de datos,
definir el payload completo y volver a implementar **una sola vez**.

**Protocolo (= STOP_AND_REPLAN / RULE-01 / PATTERN-07):**
1. STOP — declarar el approach agotado.
2. COLD_REVIEW — agente distinto, sin contexto del intento previo.
3. SIMPLIFY — buscar el discriminador más estable.
4. REPLAN — documentar el nuevo approach antes de implementar; registrar en
   `docs/meta/AGENT_EXPERIENCE_LEDGER.md`.
5. TEST_PLAN — declarar si la validación exige producción real.

**Señal dura de Pablo:** si Pablo detecta 2+ microfixes de UI/dominio en la misma línea →
`STOP_AND_MODEL_DOMAIN` (ORCHESTRATOR §20).

---

## 6. Definiciones operativas

**Sesión limpia** (de las lecciones §7): objetivo único · scope cerrado · fixture definida antes del
código · validación definida antes del código · capas de datos identificadas · stop-loss armado ·
máximo 1 iteración de patch antes de reabrir diagnóstico · cierre documental proporcional.

**Sesión sucia** (de las lecciones §8): fallos emergentes no previstos · diagnóstico que cambia varias
veces · microparches encadenados · validación parcial sin fixture completo · el agente descubre
arquitectura durante la implementación · cada patch aumenta complejidad en vez de reducir
incertidumbre.

---

## 7. Matriz gate × fase (qué exigir en cada sesión)

| Fase | REF_DIFF | ACF_CONFIG | DATA_LAYER | FULL_FIXTURE | NO_MICROPATCH | DOMAIN_MODELING (§20) |
|------|:--:|:--:|:--:|:--:|:--:|:--:|
| S023A (read-sync) | — | — | **✓** (caché) | ✓ (vocab completo) | ✓ | — |
| S023B (cache→options/bridge) | **✓** | ✓ | ✓ | ✓ | ✓ | — |
| S023C (term creation) | ✓ | **✓** | ✓ | ✓ | ✓ | — |
| S023D (player) | ✓ | ✓ | ✓ | **✓** | ✓ | — |
| S023E (category selector) | — | ✓ | ✓ | ✓ | ✓ | **✓** |
| S024 (completeness/preflight) | **✓** | ✓ | ✓ | **✓** | ✓ | — |
| S025 (images) | ✓ | — | ✓ | ✓ | ✓ | — (visual obligatoria) |
| S026 (stock) | — | — | ✓ | ✓ | ✓ | — (PRODUCTION_ONLY si pedidos) |
| S027 (Rank Math) | **✓** | ✓ | ✓ | ✓ | ✓ | — |
| S028 (landings) | — | — | ✓ | — | ✓ | ✓ |
| S029 (drift) | — | — | **✓** | — | ✓ | — |
| S030 (publish) | **✓** | ✓ | ✓ | **✓** | ✓ | — (preflight + confirm Pablo) |

✓ obligatorio · **✓** crítico para esa fase · — N/A.

---

## 8. Cuándo parar y escalar; qué agente usar

**Parar y escalar (a Opus / estrategia):**
- 2+ capas de datos no previstas en implementación (NO_MICROPATCH).
- El diagnóstico read-only deriva en decisión arquitectónica (ORCHESTRATOR §11, AGENTS.md).
- 3 sesiones sobre el mismo issue sin TEST B (RULE-01).
- Cualquier decisión irreversible u outward-facing (publicar, borrar términos, tocar pedidos).

**Selección de agente (DEC-PABLO-01):**

| Tarea | Agente | Por qué |
|-------|--------|---------|
| Sync/validación determinista sin UI | **Codex** | S023A, S029, scripts de verificación |
| Código tipado form/bridge, WC writes con ASK→CODE | **Sonnet** | S023B/C/D/E, S024, S026, S027 |
| Validación visual / browser / WP Admin | **Antigravity** | S025, partes de S028 |
| Arquitectura / decisión irreversible / desbloqueo | **Opus** | S028 plan, S030 gate, revisiones estratégicas |
| Documentación / cierres | bajo coste (Codex/Sonnet) | no requiere capacidad de implementación |

**Antipatrón explícito:** usar Opus para polish, microfix o iteración rutinaria. Usar Codex para UI o
contexto amplio. Insistir con el mismo agente tras 2 fallos en el mismo punto.

---

## 9. Checklist de prompt (para el orquestador, por sesión Studio)

```
[ ] Objetivo único declarado (una tarea)
[ ] Gates aplicables listados (matriz §7) en Guardrails
[ ] Fixture canónica referenciada (TARGET_ARCHITECTURE §8) ANTES de pedir CODE
[ ] Validación definida (qué TEST real hace Pablo) ANTES de CODE
[ ] Guardrails NO_TOCAR explícitos (Woo write? .env.local? productos? publish?)
[ ] Agente correcto (§8) y modo (ASK→CODE si toca WC write o es ambiguo)
[ ] Criterio de parada + stop-loss armado (NO_MICROPATCH)
[ ] Veredicto binario esperado
```

---

*Sesión S023-STRATEGY — 2026-06-29 — Claude Code (Opus 4.8). STRATEGIC_REQUIRED / DOCS_ONLY / NO_CODE.*
