# DESIGN.md — Catenaccio

Contrato visual local de Catenaccio. **v0 — 2026-07-03.**

Hereda de `UI_IDENTITY_PARENT.md` de lafabrica (`lafabrica-template/docs/design/UI_IDENTITY_PARENT.md`). Este documento no reemplaza la identidad padre: la **aterriza** al contexto real de Catenaccio, con decisiones concretas (paleta, densidad, componentes) que la padre deja abiertas.

Derivado de la auditoría `DESIGN_IDENTITY_AUDIT_V1` (modo READ_ONLY, misma fecha).

> **Estado v0:** documento operativo, no inspiracional. Fija reglas y tokens canónicos. **No cambia código todavía** — la migración de tokens es una tarea futura explícita (ver §9). Cualquier cambio de UI a partir de aquí se hace por *delta* sobre lo aprobado (PATTERN-13 · APPROVED_BASE_DELTA_PATCHING, definido en `lafabrica-template/docs/orchestrator/ECOSYSTEM_LEARNING_PATTERNS.md`), no rediseñando de cero.

---

## 1. Propósito

Este archivo existe para que **ningún agente diseñe UI de Catenaccio desde su gusto propio ni desde los colores que ya hay en el código**.

El problema que resuelve, comprobado en la auditoría: el código actual contiene paletas *placeholder* que un agente anterior inventó (navy + rojo), y que no tienen relación con la marca. Un agente que "mejore" una pantalla mirando el CSS existente propaga esa deuda como si fuera identidad.

Reglas de fondo:

- La marca **no se infiere del CSS actual del repo**. Se lee de este documento.
- Las dos superficies visuales de Catenaccio (Studio y storefront) **no se diseñan igual**.
- Lo aprobado es base intocable; se trabaja por delta explícito.

Antes de tocar cualquier UI, leer: este `DESIGN.md` + `UI_IDENTITY_PARENT.md`. Si la tarea contradice este contrato, se pregunta antes de proceder.

---

## 2. Fuente de verdad visual

**El código actual NO es la fuente de verdad de la marca.** Contiene valores placeholder que deben tratarse como deuda, no como identidad.

| Dónde | Valor actual | Qué es realmente |
|---|---|---|
| `studio/styles/globals.css` → `--color-primary` | `#1a1a2e` (navy) | **Placeholder.** No es la marca. A reconciliar con el verde canónico. |
| `studio/styles/globals.css` → `--color-accent` | `#e63946` (rojo) | **Placeholder.** Catenaccio no tiene rojo de marca; el rojo solo es semántico (error/agotado). |
| `catenaccio-a0-child/assets/css/cv-a0.css` → `--cv-color-primary` | `#111111` | **Placeholder** (casi-negro genérico). El texto puede quedar casi-negro, pero la marca/CTA es verde. |
| `catenaccio-a0-child/assets/css/cv-a0.css` → `--cv-color-accent` | `#c0392b` (rojo) | **Placeholder.** Igual que arriba: rojo solo semántico. |

**Verde de marca:**

- **Canónico (rebrand):** `#1E5929` — confirmado por el product owner. Es la marca de futuro.
- **Legacy de producción:** `#155c2c` — etiquetado literalmente *"Verde principal Catenaccio"* en el CSS vivo (`custom.css` del tema hijo en producción). Es la marca **saliente**, a reconciliar → migrar a `#1E5929`.

Regla: **usar `#1E5929` para todo lo nuevo.** Si aparece `#155c2c` en código legacy, es candidato a migración, no un segundo verde de marca.

---

## 3. Marca común

Estos tokens son la capa compartida por las dos superficies. Cada superficie los mapea a su propio sistema (`--color-*` en Studio, `--cv-*` en el tema), pero el **valor** es el mismo.

### 3.1 Verde de marca

| Token sugerido | Valor | Uso |
|---|---|---|
| `--brand-green` | `#1E5929` | Color de marca. Acción primaria, CTA, foco, acentos con significado. |
| `--brand-green-hover` | `#164521` (sugerido) | Estado hover/active del verde de marca. (Legacy usaba `#0f4a21` / `#0e4420` sobre `#155c2c`.) |
| `--brand-green-legacy` | `#155c2c` | Solo referencia de migración. **No usar en código nuevo.** |

Un **único acento operativo** (§4.2 padre): el verde. Nada de una segunda familia de color llamativa compitiendo.

### 3.2 Neutros (recuperados de producción)

| Token sugerido | Valor | Uso |
|---|---|---|
| `--color-bg` | `#f7f7f7` | Fondo de página. |
| `--color-surface` | `#ffffff` | Tarjetas, tablas, paneles. |
| `--color-bg-muted` | `#fafafa` | Cabeceras de tabla, zonas secundarias. |
| `--color-border` | `#e5e5e5` | Bordes y separadores. (También `#e0e0e0` en legacy.) |
| `--color-text` | `#1a1a1a` | Texto principal. |
| `--color-text-secondary` | `#333333` | Texto secundario. |
| `--color-text-muted` | `#666666` | Labels, ayudas, metadatos. |

La pantalla es **mayoritariamente neutra**; el verde se reserva para significado.

### 3.3 Semánticos

| Concepto | Fondo | Borde / texto | Notas |
|---|---|---|---|
| **Éxito** | `#f0fdf4` | verde de marca / `#065f46` | Confirmaciones, estados "listo". |
| **Aviso** | `#fffbeb` | `#fcd34d` / `#92400e` | Advertencias no bloqueantes. |
| **Error** | `#fef2f2` | `#dc2626` / `#991b1b` | Errores accionables. Nunca stack trace crudo. |
| **Agotado** (dominio storefront) | — | `#e84a4a` | Badge "Agotado". Específico de pieza única vendida. |

Los semánticos son **consistentes en toda la app** y no se usan para decorar.

### 3.4 Radios y botón

- Radios: `6px` (por defecto), `8px`, `10px`; `999px` para pills/chips; `16px` en tarjetas del storefront.
- **Botón de marca:** verde sólido (`--brand-green`), texto blanco, `font-weight` 600–700. En el storefront el patrón histórico es MAYÚSCULAS con `letter-spacing: 0.5px`; en Studio, sin mayúsculas (más operativo). Una sola acción primaria por vista.

### 3.5 Logo / wordmark

- Assets de rebrand en `C:\Users\USUARIO\Catenaccio Vintage\Imágenes\Logo\REBRANDING\` (fuente legacy externa, read-only): wordmark horizontal (verde / negro / blanco) y emblema circular "C" con arcos concéntricos (verde / negro / blanco-sobre-verde).
- Wordmark = **sans-serif geométrica, pesada, condensada, todo mayúsculas**, en verde de marca.
- **No inventar una fuente de marca** ni recrear el wordmark con tipografía: usar el asset. Los assets aún no están copiados/saneados al repo (ver §9).

### 3.6 Tipografía

- **UI / cuerpo (provisional):** sans-serif de sistema / Inter-like. Token `--font-ui` = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (lo que Studio ya usa). **No añadir dependencia ni webfont nueva** en v0.
- **Display / titulares:** peso alto de la misma sans; para el logotipo, el asset del wordmark.
- Escala tipográfica limitada (§4.3 padre); cifras tabulares donde se comparen números (Studio ya usa `font-variant-numeric: tabular-nums`).

---

## 4. Superficies visuales

Catenaccio tiene **dos superficies** con público, densidad y estética distintas. **No se diseñan igual.**

| | **A · Studio** (`studio/`) | **B · Storefront** (`catenaccio-a0-child/`) |
|---|---|---|
| Qué es | Backoffice PIM interno / herramienta operativa | Tienda pública WooCommerce/WordPress |
| Público | Un operador experto (la persona operadora) | Comprador final |
| Estado | **ACTIVO** — desarrollo en curso | **DIFERIDO / CONGELADO** salvo instrucción explícita |
| Densidad | **Alta** (tabla, work-queue) | **Media** (tarjetas, aire, foto protagonista) |
| Protagonista | Estado y decisión operativa | La camiseta (imagen) |
| Stack | Next.js 15 + React 19, CSS `--color-*` | PHP/WooCommerce, CSS `--cv-*` |

Regla dura: **no aplicar la estética de tienda a Studio** (nada de heros, ilustraciones, tarjetas decorativas) y **no aplicar la densidad de dashboard a la tienda** (nada de convertir la ficha de producto en un panel de datos).

---

## 5. Studio (backoffice activo)

Superficie operativa. La identidad padre para "herramienta operativa" aplica en su forma más estricta.

**Principios:**

- **Densidad alta.** Más información por pantalla, menos aire. Base 14px, tabla 13px.
- **Tabla / work-queue, no tarjetas.** El inventario es una tabla orientada a decisión (referencia, estado, canal web, coste, precio, margen, fotos, alta, acciones). Los **datos tabulares van en tabla**; las tarjetas decorativas están prohibidas para filas de datos (§6 padre). En móvil, la tabla colapsa a tarjetas apiladas (una fila = una tarjeta) — eso es responsive, no decoración.
- **Estados de inventario visibles y semánticos.** Badges por estado; fila "requiere acción" resaltada; filtros con contadores.
- **Una acción primaria por vista.** El resto, subordinadas.
- **Copy operativo.** Describe lo que hace el operador, no la implementación. **Sin exponer IDs, nombres de variables de entorno, RLS ni valores internos** salvo en una pantalla técnica explícita (deuda conocida: `ErrorState` y el `error.message` crudo exponen internos — acotar en tarea futura, no ampliar el patrón).
- **Estados obligatorios:** carga / vacío / error, resueltos donde el flujo los pide (§4.6 padre). Vacío y error ya existen; **loading a confirmar** (ver §9).
- **No landing.** Ningún hero, testimonio, gradiente decorativo ni sección de marketing.
- **No rediseñar sin delta explícito.** Lo aprobado (shell, tabla, filtros, ficha, paneles AI/SEO/WC/Preflight) es base intocable.

---

## 6. Storefront (tienda pública — DIFERIDO/CONGELADO)

Superficie de consumo. **Congelada salvo instrucción explícita del product owner.** Se documenta aquí para preservar criterio cuando se reactive; no para tocarla ahora.

**Principios cuando se reactive:**

- **Producto visual protagonista.** La foto de la camiseta manda (tarjeta con `aspect-ratio 3/4`, hover-zoom sutil).
- **Mobile-first.** Grid 2 columnas ≤768px, menú off-canvas, sidebar de filtros que colapsa arriba del grid.
- **Densidad media.** Aire, respiración; no densidad de dashboard.
- **Fichas de producto:** galería + meta de dominio (talla, medidas, condición, defectos), precio, add-to-cart, explorar colecciones.
- **Archivo / listado:** breadcrumbs, intro SEO con toggle, toolbar (orden + filtros), grid responsive, paginación.
- **Filtros y búsqueda:** por liga / equipo / temporada; el plugin `filtro-camisetas` es parte del stack — respetar sus clases y AJAX.
- **Carrito:** mini-carrito popup + página de carrito; botón "Finalizar compra" en verde de marca.
- **Pieza única (stock 1).** Cada camiseta es única: **sin selector de cantidad** (la columna qty se oculta a propósito). El diseño asume unidad, no lotes.
- **No tocar mientras esté congelado.** Ni "de paso", ni como efecto lateral de una tarea de Studio.

---

## 7. Reglas anti-diseño

Un agente que trabaja UI en Catenaccio **no puede**, salvo autorización explícita:

- **No añadir librerías de UI**, frameworks de estilo, sistemas de iconos ni webfonts sin registrarlo en `DECISIONS.md`.
- **No cambiar tokens globales** (paleta, tipografía, espaciado base) como efecto lateral de una tarea acotada.
- **No inventar marca desde el CSS antiguo.** Los placeholders navy/rojo no son identidad.
- **No aplicar estética de tienda a Studio** (heros, ilustraciones, tarjetas decorativas, marketing copy).
- **No aplicar estética de dashboard a la tienda** (tablas densas donde va una ficha visual).
- **No usar tarjetas decorativas** para datos que son una tabla.
- **No rediseñar pantallas completas** cuando la tarea pedía un delta acotado.
- **No romper el estado congelado del storefront.**
- **No romper contraste/accesibilidad mínima (AA)** por estética.
- **No exponer valores internos** en copy de usuario (IDs, env vars, RLS, stack traces).

---

## 8. Checklist para futuras tareas UI

Antes de tocar UI:

- [ ] Leí `DESIGN.md` (este archivo) y `UI_IDENTITY_PARENT.md`.
- [ ] Identifiqué la superficie: ¿Studio (activo) o storefront (congelado)?
- [ ] Si es storefront: ¿tengo instrucción explícita para tocarlo? Si no → parar y preguntar.

Qué preservar:

- [ ] Los tokens de marca de §3 (verde `#1E5929`, neutros, semánticos).
- [ ] La densidad de la superficie (alta en Studio, media en storefront).
- [ ] Los componentes existentes (reutilizar antes que inventar; un dato se ve igual en toda la app).
- [ ] Lo aprobado como base intocable (delta explícito, no rediseño).

Qué validar:

- [ ] Una acción primaria por vista; jerarquía = importancia operativa.
- [ ] Verde con significado; contraste AA.
- [ ] Datos tabulares en tabla, no tarjetas.
- [ ] Estados carga / vacío / error resueltos donde el flujo los pide.
- [ ] Copy operativo, sin internos expuestos.

Qué preguntar antes de tocar:

- [ ] Si la tarea implica reactivar/rediseñar el storefront.
- [ ] Si la tarea implica cambiar un token global o migrar placeholders.
- [ ] Si la tarea añade cualquier dependencia visual nueva.

Qué reportar al cierre:

- [ ] Superficie tocada y por qué.
- [ ] Delta aplicado (no rediseño).
- [ ] Tokens/estados afectados.
- [ ] Deuda visual detectada o resuelta.

---

## 9. Pendientes explícitos

Fuera de alcance de v0. No hacer ahora; anotados para no perderse.

- **Tipografía definitiva:** confirmar familia de UI/body si algún día se formaliza un brand kit. Hoy = sans de sistema provisional.
- **Migración de tokens:** reemplazar los placeholders (`#1a1a2e`/`#e63946` en Studio, `#111`/`#c0392b` en el tema) por los tokens de marca de §3, y `#155c2c` → `#1E5929`. **Es una tarea futura dedicada, no un efecto lateral.**
- **Assets de logo:** copiar/sanear el set de `REBRANDING/` al repo cuando se apruebe (hoy viven solo en la carpeta legacy externa).
- **Validación visual del storefront:** pendiente desde su marca de "no pixel-perfect". Hacer cuando se reactive la superficie.
- **Loading states en Studio:** confirmar si faltan (empty/error existen; no se verificó `loading.tsx`) y añadirlos donde el flujo los pida.
- **Copy que expone internos:** acotar `ErrorState` y el `error.message` crudo a una pantalla técnica explícita.

---

*v0 · 2026-07-03 · Derivado de `DESIGN_IDENTITY_AUDIT_V1`. Marca canónica: `#1E5929`. Hereda de `UI_IDENTITY_PARENT.md`. Los cambios de rumbo visual se registran en `DECISIONS.md`.*
