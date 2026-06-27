# MIGRATION_OPTIONS — WordPress → Supabase / Vercel

Análisis de las rutas de migración candidatas y secuenciación. Justifica la elección de RUTA D.

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-27
**Sesión:** 018 — STRATEGIC_ROADMAP_OPUS
**Estado:** ANÁLISIS — soporta `CATENACCIO_STRATEGIC_ROADMAP.md`
**Veredicto soportado:** `APPROVE_ROUTE_HYBRID_STUDIO_WOO_BRIDGE` (RUTA D)

---

## 1. Las 5 rutas evaluadas

| Ruta | Descripción | Veredicto |
|------|-------------|-----------|
| **A** | Seguir con WordPress/WooCommerce y **reparar A0** (tema sombra). | ❌ RECHAZADA |
| **B** | WordPress/WooCommerce como **canal temporal**, construir Studio primero. | 🟡 PARCIAL (subsumida en D) |
| **C** | Migrar **directamente** a Supabase + Vercel (tienda incluida). | ❌ RECHAZADA |
| **D** | **Híbrida:** Studio propio + WooCommerce bridge + frontend nuevo posterior. | ✅ **ELEGIDA** |
| **E** | Parar desarrollo técnico y operar manualmente. | 🟡 PARCIAL (su espíritu se absorbe) |

---

## 2. Por qué se rechaza cada alternativa

### RUTA A — Reparar A0 ❌
- El orquestador ya emitió `KILL_CURRENT_A0_RELEASE_LINE`. La validación visual manual de Pablo lleva sesiones sin pasar.
- Ataca el **frontend**, que **no es** la fricción real de Pablo (la causa raíz, declarada en Sesión 005b, es el **backoffice**).
- Es exactamente "quedarse atrapado puliendo WordPress", lo que Pablo dijo que **no** quiere.
- Sin presión real: Elementor Pro caduca pero **no rompe la tienda** (ver §4). Reparar A0 ahora es resolver una urgencia que no existe.

### RUTA C — Supabase + Vercel directo ❌
- **Big bang.** Viola "evitar big bang migration" explícito.
- Mata la tienda activa, su SEO (RankMath, dominio posicionado) y su checkout funcionando.
- **WooPayments no soporta headless** (STOP ya registrado en DEC-8). Migrar la tienda exige resolver primero la pasarela de pago — un problema mayor sin ventas que lo justifiquen.
- Duplica complejidad **antes** de validar ventas. Es el error más caro en e-commerce.

### RUTA E — Parar y operar manual 🟡
- Su **espíritu sí se absorbe**: Pablo sigue vendiendo manualmente por WP Admin como puente inmediato mientras se construye Studio (no se bloquea la venta esperando software).
- Pero "parar todo desarrollo" desaprovecha el hosting/dominio recién renovados y el objetivo declarado de tener un sistema propio. No construye nada hacia el norte.

### RUTA B — WordPress como canal "temporal" 🟡
- Muy cercana a D y correcta en lo esencial (Studio primero).
- Se descarta como etiqueta porque declarar WooCommerce "temporal" sugiere quita inminente del checkout — justo la trampa headless ya frenada. WooCommerce/WooPayments es el **raíl de pago** y la **superficie SEO viva**; no es de quita inminente.
- D es B con la semántica corregida: WooCommerce se **mantiene** como destino y checkout, no como algo a arrancar pronto.

---

## 3. Por qué gana RUTA D ✅

D es la única ruta que:
1. **No toca la tienda activa** (cero riesgo a producción, SEO, pagos, dominio).
2. **Ataca la causa raíz** (backoffice) en vez del síntoma (frontend Elementor).
3. **Empieza el stack propio (Supabase + Vercel) ya**, pero por la capa de **menor riesgo** (herramienta interna), no por la tienda pública.
4. **Es acumulativa hacia el sistema propio:** Supabase se vuelve la fuente de verdad del inventario; el trabajo no se tira.
5. **Evita el big bang:** migración por capas, con gates de datos antes de cada salto.
6. **Corta el sumidero de tokens** de A0 y mueve la validación visual a un entorno (Vercel) donde **sí funciona** (sin el firewall de Raiola que bloqueó a Antigravity en la Sesión 015).

---

## 4. El análisis que des-urgentiza la migración: Elementor Pro es deadline BLANDO

**Hecho técnico:** una licencia de Elementor Pro vencida **no apaga el plugin**. Los widgets Pro ya colocados siguen renderizando; solo se pierden actualizaciones, soporte y descarga de nuevas plantillas. La web **no se cae** el 2026-07-01.

**Implicación estratégica:** el "deadline" que motivó toda la línea A0 era un deadline de *pérdida de updates*, no de *rotura de la tienda*. Tratarlo como rotura inminente llevó a invertir 7 sesiones en el frontend. Reclasificado correctamente como **blando**, libera la decisión: se puede pausar A0 sin riesgo para la tienda.

**Riesgo residual aceptado y su mitigación:**
- Riesgo: deuda de seguridad creciente en Elementor Pro sin updates.
- Mitigación 1: el tema sombra A0 **congelado** es el plan de contingencia ya escrito (incluye toda la lógica crítica del tema activo ya portada).
- Mitigación 2: si algún día algo se rompe de verdad, se descongela A0 como respuesta puntual — no como release proactiva.

---

## 5. Secuenciación de la migración por capas (sin big bang)

```
HOY                          MVP STUDIO (7-30d)            POST-TRACCIÓN (90d+, con gates)
─────────────────────────────────────────────────────────────────────────────────────────
Inventario:  Excel/WP    →   Supabase (fuente verdad)  →   Supabase (sin cambio)
Backoffice:  WP Admin    →   Catenaccio Studio (Vercel) →  Studio (madurando)
Tienda:      WooCommerce →   WooCommerce (igual)        →   ¿Next.js storefront? (DECISIÓN CON DATOS)
Checkout:    WooPayments →   WooPayments (igual)        →   ¿resolver pasarela headless? (gate duro)
SEO/dominio: WordPress   →   WordPress (igual)          →   plan de migración SEO si se mueve la tienda
```

**Regla de oro:** cada capa migra solo cuando la anterior está validada y hay datos que justifican la siguiente. La capa "tienda pública" es la **última** y solo se abre con los gates de tracción + respuesta de pasarela.

### ¿Cuándo Supabase? → AHORA
Como fuente de verdad del inventario en el MVP de Studio (S019). Es la capa de menor riesgo: no es visible al público, no toca pagos ni SEO.

### ¿Cuándo Vercel? → DOS MOMENTOS DISTINTOS
- **App interna (Studio): AHORA** (S021). Riesgo cero para la tienda; un solo usuario (Pablo).
- **Storefront público: DIFERIDO.** Solo tras tracción + decisión de pasarela. Ver gates en `CATENACCIO_STRATEGIC_ROADMAP.md §6`.

### ¿Cuándo se reconsidera WooCommerce como tienda? → CON DATOS
Tras publicar 5–10 camisetas por Studio y medir ventas/tráfico. No antes. La decisión "headless o no" se toma en frío (RULE-01), no por impulso de stack.

---

## 6. Riesgos de la ruta elegida y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Doble fuente de verdad temporal (Supabase + WC) durante el MVP | Medio | DRAFT_ONLY + Pablo aprueba; Studio es maestro, WC es destino. Sincronización en un solo sentido (Studio→WC). |
| Studio MVP se alarga como se alargó A0 | Alto | Gate duro: STOP_AND_REPLAN a ~4 sesiones sin MVP usable (RULE-01 / PATTERN-07). |
| Elementor Pro acumula deuda de seguridad | Bajo-Medio (temporal) | A0 congelado como contingencia; monitorizar; actuar solo ante rotura real. |
| WC_API write falla por mapeo `meta_data` | Medio | `WC_API_WRITE_ACCESS_TEST` contra 1 producto antes de operar (S020). |
| Tocar config WC dispara problema de email transaccional | Medio | PATTERN-08: resolver gate de email antes de cualquier cambio de config WC (`LAFABRICA_ADOPTION.md §4`). |

---

## 7. Relación con decisiones previas

- **DEC-8 (A0+B1 aprobado):** D **ejecuta el B1 nunca construido** y reclasifica A0 de "release activable" a "referencia congelada". No contradice DEC-8; corrige el orden de ejecución (B1 primero).
- **DEC-9 (acceso sin SSH):** es el canal exacto del puente Studio→WC. Se reusa tal cual.
- **DEC-10 (shadow release flow):** queda en reposo mientras A0 está congelado; sigue válido si se descongela.
- **DEC-5 (Next.js/Vercel como preferencia):** D lo concreta — Vercel entra ya, pero por la app interna.
- **PEND-2 (marketplace):** sin cambios, sigue NORTH_STAR / DEFER.

---

*Sesión 018 — 2026-06-27 — Claude Code (Opus 4.8). Modo STRATEGIC / DOCS_ONLY.*
