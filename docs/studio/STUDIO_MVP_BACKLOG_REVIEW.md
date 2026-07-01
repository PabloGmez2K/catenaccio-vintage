# STUDIO_MVP_BACKLOG_REVIEW — Estado, MVP útil y próximas prioridades

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-07-01
**Sesión:** STUDIO_MVP_BACKLOG_REVIEW (Opus 4.8)
**Modo:** STRATEGIC_REQUIRED / BACKLOG_REVIEW / NO_CODE / NO_WC_WRITE / NO_SUPABASE_WRITE / NO_DEPLOY
**Veredicto:** `APPROVE_COMPRESS_S025_GO_IMAGES_NEXT`
**Hermanos:** `STUDIO_POST_S024_ROADMAP_REORDER.md`, `STUDIO_TARGET_ARCHITECTURE.md`, `STUDIO_SESSION_GATES.md`

---

## 0. TL;DR

El *happy path* de Studio está ~90% construido y validado. El borrador Woo que genera ya lleva
datos + taxonomías reales + categoría + SEO + precio + stock (`DRAFT_ONLY`, idempotente). **La única
capacidad que falta en cada camiseta son las IMÁGENES.** Publicar sigue manual en WP Admin (correcto
para MVP, DEC-A9). Todo lo demás pendiente es robustez/higiene, no *happy path*.

## 1. Estado por subsistema

| Capacidad | Estado | Nota |
|-----------|--------|------|
| Form + dominio + edición + autotítulo EN | 🟢 DONE | PABLO_LOCAL_FORM_OK |
| SEO manual (NO-API) | 🟢 DONE | prompt v2, `saveManualSeoContent` |
| Bridge Woo v2.1 (draft, idempotente) | 🟢 DONE | root + meta_data ACF + attributes[] |
| Caché taxonomías + creación controlada (S023A–E) | 🟢 DONE | Liga/Equipo/Año/Jugador + categoría |
| Preflight completitud (S024) | 🟢 DONE | advisory, espeja reglas del bridge |
| Backoffice v0 (work queue, filtros, soft-archive) | 🟢 DONE | absorbe S025A+B |
| Rank Math / slugs / categorías curatoriales | 🟡 PARTIAL | solo primary cat; override manual |
| **Imágenes** | 🔴 FALTA | manual WP Admin — última pieza del listing |
| **Deploy (Vercel)** | 🔴 FALTA | Studio es local → bloquea uso diario/móvil |
| Edit/resync a Woo, cleanup drafts, drift vivo | 🔴 FALTA | robustez, no MVP |
| Vinted, Rank Math full, landings, publish controlado | 🔴 FALTA | post-MVP (S027–S031) |

## 2. Definición de MVP útil

> Pablo prepara una camiseta completa en Studio (**incluidas fotos**) → un clic crea **UN** borrador
> Woo completo → en WP Admin solo mira y pulsa Publicar. Medido: tiempo/camiseta vs. ~45 min, sobre
> 5–10 camisetas reales (`GATE_STUDIO_MVP`).

Solo faltan **dos** capacidades para esto: **imágenes en Studio** y **deploy**. El resto no es requisito.

## 3. Refinamiento del reorder S025

El reorder (mismo día) puso 6 bloques de operaciones (S025A–F) **por delante** de imágenes. Dos hechos
lo dejan sobredimensionado:

1. **Backoffice v0 ya entregó S025A+B** (consola operativa + soft-archive/restore).
2. Como Studio prepara todo **antes** de crear el borrador, **las imágenes se adjuntan en el create**
   → no requieren update/PUT (S025D) ni drift vivo (S025A) para el *happy path*.

Correr S025C→D→E→F antes de imágenes es el desvío de microtareas que `RULE-01` / `GATE_STUDIO_MVP`
(STOP_AND_REPLAN si no hay MVP a ~4 sesiones de impl) advierte evitar. **Decisión: comprimir.** Ir a
imágenes ahora; edit/resync, cleanup, audit y Vinted pasan a *fast-follow*, priorizados por lo que
revele la medición E2E. No se re-arquitectura nada: DEC-13, DRAFT_ONLY, gates y publish-manual intactos.

## 4. Roadmap recomendado (4 al gate + 3 fast-follow)

| # | Bloque | Woo write | Riesgo | Agente | SHADOW_FIRST |
|---|--------|-----------|--------|--------|--------------|
| **1** | **S026A — IMAGES: local → Supabase Storage** (sin WP) | No | Bajo | Sonnet | — |
| **2** | **S026B — Upload WP Media + attach en create** (DRAFT_ONLY intacto) | Sí (media) | Medio | Sonnet+Antigravity | **Sí** (1 img test, veto media existente) |
| **3** | **STUDIO_VERCEL_DEPLOY_MINIMAL** (env server-side, redirect Supabase, postcss CVE) | No | Medio | infra | — |
| **4** | **GATE_STUDIO_MVP — E2E real** (1 → 5–10, medir tiempo) | manual Pablo | — | Opus cold-review | — |
| 5 | S025D — EDIT_AND_RESYNC_TO_WOO | Sí (PUT) | Med-Alto | Sonnet ASK→CODE | — |
| 6 | S025C — WOO_DRAFT_CLEANUP (1854/1856/1861; o manual) | DELETE→trash | Alto | Sonnet+gate Opus | **Sí** (veto 1731) |
| 7 | S025E FIELD_AUDIT (docs) ∥ S025F VINTED_EXPORT (copy) | No | Bajo | Sonnet | — |

Orden: 1→2→3→4 en serie; 5/6/7 tras el gate, priorizados por la medición. Escape de recuperación
durante la medición (sin edit/resync aún): **borrador malo → trash en WP Admin → recrear desde Studio**.

## 5. Qué matar / diferir / no documentar de más

- **Diferir (no matar):** S025C/D/E/F a *fast-follow*; S027–S031 sin cambio (+1 ya aplicado en el
  reorder); STOCK.xlsx, taxonomy universe manager, knowledge graph, marketplace → LATER.
- **No re-especificar S025A** (absorbido por backoffice v0).
- **Un solo doc** de imágenes (`STUDIO_IMAGE_PIPELINE_PLAN`) cuando se implemente S026A — no un doc por
  sub-bloque. Este review es el único doc estratégico nuevo.

## 6. Primer prompt implementable

**S026A — IMAGE_PIPELINE_LOCAL_TO_STORAGE** (Sonnet, LOCAL, sin WP write): subir fotos desde carpeta
local/upload a un bucket de Supabase Storage; asociar a `inventory_item`; miniaturas + orden + foto
destacada en el form; añadir check `imágenes ≥1` al preflight S024. Cero WP, cero Woo, cero publish.
**Pre-req de Pablo:** crear bucket Storage + RLS (manual, patrón S020D). Cierra con Pablo viendo las
fotos subidas y persistidas por item. Gates: `DATA_LAYER_MAPPING` (capa Storage) + validación visual
obligatoria (RULE-02).

## 7. Veredicto

`APPROVE_COMPRESS_S025_GO_IMAGES_NEXT`. MVP útil = borrador completo con fotos desde Studio + publish
manual de un clic, a ~4 sesiones de impl (imágenes ×2 + deploy + gate). Confirma cambio de prioridad:
imágenes pasan a ser el siguiente bloque; S025C–F se difieren a *fast-follow*. Pendiente nod de Pablo.

---

*Sesión STUDIO_MVP_BACKLOG_REVIEW — 2026-07-01 — Claude Code (Opus 4.8). STRATEGIC_REQUIRED / NO_CODE.*
