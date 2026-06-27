# CATENACCIO_STRATEGIC_ROADMAP — Catenaccio Vintage

Hoja de ruta estratégica 30/60/90 días. Documento maestro de dirección.

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-27
**Sesión:** 018 — STRATEGIC_ROADMAP_OPUS
**Agente:** Claude Code (Opus 4.8) — modo STRATEGIC / DOCS_ONLY
**Estado:** APROBADO POR EL AGENTE — pendiente de confirmación literal de Pablo
**Veredicto:** `APPROVE_ROUTE_HYBRID_STUDIO_WOO_BRIDGE`

> Documentos hermanos:
> - `docs/strategy/CATENACCIO_STUDIO_TARGET.md` — arquitectura y MVP del backoffice propio.
> - `docs/strategy/MIGRATION_OPTIONS_WORDPRESS_SUPABASE_VERCEL.md` — análisis de las 5 rutas y secuenciación de migración.
> - `DECISIONS.md` → DEC-13 — registro de la decisión estratégica.

---

## 0. TL;DR (para Pablo)

1. **Dejamos de pulir WordPress.** La línea A0 (tema sombra para reemplazar Elementor) se **congela**, no se mata: queda como referencia/aprendizaje, no como próxima release.
2. **Elementor Pro caduca, pero la tienda NO se rompe.** Cuando expira la licencia, los widgets ya colocados siguen renderizando. Pierdes updates y soporte, no la web. → No es una urgencia. No renovamos. No invertimos más en reemplazarlo ahora.
3. **Construimos primero Catenaccio Studio**, tu backoffice propio: dar de alta camisetas rápido, fotos, estados, precio/margen, y publicar a la web como borrador. Eso es lo que te quita fricción real, no el frontend.
4. **Stack del Studio:** Supabase (base de datos + auth + imágenes) + Next.js en Vercel (la app interna) + puente a WooCommerce vía API.
5. **WooCommerce se queda** como tienda pública y pasarela de pago (WooPayments). No se toca el checkout. El dominio y el SEO se mantienen intactos.
6. **Vercel entra YA, pero solo para tu herramienta interna (Studio).** La tienda pública en Next.js es para MÁS ADELANTE, cuando haya ventas que lo justifiquen.
7. **Sin big bang.** Nada se migra de golpe. Empezamos a vender mientras se construye.

---

## 1. Decisión

**Ruta elegida: RUTA D — Híbrida: Catenaccio Studio propio + WooCommerce bridge + frontend nuevo posterior.**

Coincide con la hipótesis del orquestador (`APPROVE_ROUTE_HYBRID_STUDIO_WOO_BRIDGE`) tras lectura del repo y verificación de criterios. No es un sello automático: se ha sometido a prueba contra las 5 rutas (ver `MIGRATION_OPTIONS_WORDPRESS_SUPABASE_VERCEL.md`).

### Qué se MATA / PAUSA
- **Línea de release A0 como release activable:** CONGELADA (`FREEZE`). Confirma el veredicto previo del orquestador `KILL_CURRENT_A0_RELEASE_LINE`. El tema sombra `catenaccio-a0-child` **no se borra** — se conserva como referencia técnica y como librería ya capturada de la lógica crítica del tema activo (IVA 21% envío, URLs limpias, breadcrumbs, carrusel home, RankMath, buscador AJAX).
- **Bucle de validación visual del tema sombra** (preview manual + resync): se detiene. Consumió ~7 sesiones (011–017) sin converger. RULE-01 (revisión fría tras 3 sesiones sin convergencia) debería haberse disparado antes; se dispara ahora.
- **Inversión adicional en reemplazar Elementor a corto plazo:** PAUSADA.

### Qué se MANTIENE
- **WooCommerce + WooPayments** como tienda pública y checkout. No se toca. Es la pasarela de pago real y la superficie SEO viva. Hosting y dominio recién renovados → tiene runway pagado.
- **Tema activo `hello-elementor-child`** intacto en producción.
- **Modelo de acceso sin SSH (DEC-9):** Application Password + usuario limitado `catenaccio-studio-agent` (shop_manager) + DRAFT_ONLY. Es exactamente el canal que el puente Studio→WooCommerce necesita. Ya está construido y probado.
- **Toda la inteligencia ya capturada:** `STOCK_OPERATIONS_MODEL.md` (modelo de datos del Studio), `API_READONLY_PROBE_RESULT.md` (mapeo `meta_data`), `ACCESS_MODEL_NO_SSH.md`.

### Qué se CONSTRUYE primero
- **Catenaccio Studio (MVP):** el backoffice propio que ya estaba aprobado en DEC-8 (track B1) pero nunca se construyó porque toda la energía fue al frontend A0. Es el producto real. Ver `CATENACCIO_STUDIO_TARGET.md`.

### Qué se DIFIERE
- **Storefront público en Next.js/Vercel:** DEFER hasta tracción (gates en §6).
- **Marketplace multi-vendor:** sigue NORTH_STAR / DEFER (PEND-2). Sin cambios.
- **Automatización Vinted, import Excel automático, gestión de pedidos/envíos en Studio, pagos propios, app móvil:** fuera del MVP (ver `STOCK_OPERATIONS_MODEL.md §6`).

---

## 2. Por qué esta ruta (criterios de decisión)

| Criterio | Cómo lo cumple RUTA D |
|----------|----------------------|
| Menor riesgo para la tienda activa | No toca tema activo, checkout, pagos ni DB. Studio escribe solo borradores vía API. |
| Máxima reducción de fricción de Pablo | Ataca la **causa raíz real** (backoffice de publicación, declarada en Sesión 005b), no el frontend. |
| Mejor inversión de tokens | Frena el sumidero de tokens de A0 (resync + preview manual). Studio en Vercel es validable visualmente sin el firewall de Raiola que bloqueó a Antigravity. |
| Compatibilidad con lafabrica-template | Supabase + Vercel + Next.js es exactamente la dirección del template; el Studio es un proyecto-hijo limpio bajo el SO documental. |
| Capacidad de evolucionar a sistema propio | Supabase pasa a ser la fuente de verdad del inventario; WooCommerce queda como destino de publicación. La inversión es acumulativa hacia el sistema propio. |
| No duplicar complejidad antes de validar ventas | No se reconstruye la tienda pública. Solo se añade la capa que falta (backoffice). |
| Mantener SEO/dominio/tienda actual | Intactos. La web sigue en WooCommerce con su SEO (RankMath) y su dominio. |
| Evitar big bang | Migración por capas: primero backoffice, storefront público mucho después y solo si los datos lo piden. |

**El error estratégico que esta ruta corrige:** la Sesión 005b ya había identificado que la fricción real de Pablo es el **backoffice** (flujo de alta de productos demasiado caótico), no el frontend. Sin embargo, las sesiones 011–017 invirtieron ~7 ciclos en el **frontend** (sustituir widgets de Elementor por PHP). Se pulió lo que no dolía. RUTA D reorienta el esfuerzo a lo que sí duele.

---

## 3. El dato técnico que hace segura esta decisión

**Elementor Pro NO rompe la tienda al caducar la licencia.** Cuando una licencia de Elementor Pro expira:
- El plugin **sigue funcionando**.
- Los widgets Pro ya colocados **siguen renderizando** en producción.
- Se pierde: descarga de nuevas plantillas de la librería, actualizaciones del plugin y soporte.
- **La web NO se cae.**

Sesiones anteriores trataron `~2026-07-01` como un *deadline duro de rotura*. Técnicamente es un *deadline blando* (pérdida progresiva de actualizaciones/parches de seguridad con el tiempo, no caída inmediata). Esto **des-urgentiza por completo** la migración A0 y hace seguro pausarla: la tienda sigue operativa con Elementor Pro aunque la licencia esté vencida.

**Riesgo residual aceptado:** sin actualizaciones, Elementor Pro acumula deuda de seguridad con el tiempo. Mitigación: el tema sombra A0 congelado es el plan de contingencia ya escrito si algún día algo se rompe de verdad. Hasta entonces, la energía va al negocio.

---

## 4. Roadmap 0-7 / 7-30 / 30-90 días

### 0–7 días — Frenar, congelar, arrancar Studio en seco
- **Pablo:** confirmar el veredicto de esta sesión (gate de aprobación literal, RULE-02).
- **Pablo (sin agente):** seguir vendiendo manualmente por WP Admin como ahora. No esperar a Studio para vender. Es el puente operativo inmediato (espíritu de RUTA E absorbido).
- **Pablo (sin agente):** revocar el token cPanel API de la Sesión 017 (CPANEL_TOKEN_REVOCATION) — ya no hace falta acceso al servidor para la nueva dirección.
- **Agente (Sonnet/Opus):** congelar formalmente A0 — tag de git en el estado actual del tema sombra, nota de FREEZE en sus docs, y mover sus tareas de NOW/NEXT a un bloque FROZEN en BACKLOG. **No** se vuelve a sincronizar ni a iterar.
- **Decidir alojamiento del Studio:** cuenta Supabase + proyecto Vercel (Pablo crea las cuentas; coste $0 en tier gratuito para el MVP).

### 7–30 días — Construir el MVP de Catenaccio Studio
- **S019 — STUDIO_DATA_MODEL (Supabase):** materializar el modelo de `STOCK_OPERATIONS_MODEL.md §3` como esquema Postgres en Supabase (tablas, enums de los 11 estados, RLS básica, storage bucket de imágenes). Incluir `owner_id` desde el día 1 (preparación marketplace, sin construirlo).
- **S020 — STUDIO_WC_BRIDGE_CONTRACT:** definir el contrato de publicación Studio→WooCommerce. Reusa DEC-9 (Application Password, DRAFT_ONLY) y el mapeo a `meta_data` ya descubierto en `API_READONLY_PROBE_RESULT.md` (liga/equipo/año como term IDs; talla/condición como strings). Sin escribir aún a producción.
- **S021 — STUDIO_MVP_SCAFFOLD:** scaffold Next.js + Supabase desplegado en Vercel. App interna autenticada (solo Pablo). Vista de inventario (tabla con los 11 estados).
- **S022 — STUDIO_CREATE_AND_PUBLISH:** formulario de alta de camiseta (`§3` del modelo) + "Sugerir con Claude" (título SEO + descripción + precio) + botón "Crear borrador en WooCommerce". Imágenes: **Opción A** (ruta local) en MVP, con puerta a upload directo (`§4`).
- **Gate de validación:** Pablo da de alta y publica **1 camiseta real de extremo a extremo** por Studio. PABLO_VISUAL_OK + TEST B real (la camiseta aparece como borrador en WC) (RULE-02, DEC-PABLO-02).

### 30–90 días — Validar velocidad, decidir lo siguiente con datos
- **Publicar 5–10 camisetas reales** vía Studio. Medir el tiempo real por camiseta (objetivo: ≤10 min vs. ~45 min actuales). Esta es la métrica que valida B1.
- **Upload de imágenes directo** (`STOCK_OPERATIONS_MODEL §4`, Opción C) si Pablo quiere dejar de pasar por WP Admin para las fotos.
- **Migración asistida del Excel** (`STOCK_OPERATIONS_MODEL §5`): Pablo comparte columnas reales de `STOCK.xlsx`; se prepara importador CSV. Solo cuando Studio esté en uso real.
- **Revisión fría obligatoria (RULE-01 / token gate):** decidir, **con datos de ventas y de tiempo de publicación**, si tiene sentido empezar el storefront público en Next.js o seguir con WooCommerce como tienda. **No antes** de tener esos datos.

---

## 5. Token budget — qué motor para qué

| Motor | Para qué | Por qué |
|-------|----------|---------|
| **Opus** | Decisiones estratégicas (esta sesión), arquitectura del modelo de datos del Studio y del contrato del puente, y los gates go/no-go. | Caro. Solo en puntos de inflexión de decisión/arquitectura. |
| **Sonnet** | Grueso de la implementación del Studio (app Next.js, esquema Supabase, formularios, código del puente WC), docs de sesión, cierres. | Capaz y económico para el trabajo de construcción rutinario. |
| **Codex** | Tareas de código mecánicas con spec clara (worker de sync a WC, integración de API, PRs acotados). | Probado en las sesiones 014/017 (sync cPanel): ejecución fiel con spec explícita. |
| **Antigravity** | QA visual de la UI del Studio. | Ahora **sí es viable**: el Studio vive en Vercel (URL pública de preview), sin el firewall de Raiola que bloqueó la validación visual del shadow WP en la Sesión 015. |

**Límite de tokens antes de reevaluar (gate duro):** revisión fría obligatoria cuando ocurra lo primero de:
1. **3 sesiones de implementación** del Studio sin que Pablo pueda publicar 1 camiseta de extremo a extremo (RULE-01), **o**
2. el MVP no es usable por Pablo tras **~4 sesiones de construcción** → `STOP_AND_REPLAN` (PATTERN-07).

Si se alcanza el gate sin un MVP usable, se para y se replantea — no se sigue parcheando (la lección directa de la línea A0).

---

## 6. Gates para abrir lo diferido

**Storefront público en Next.js/Vercel — abrir solo si:**
- Studio en uso real y estable (alta de camisetas ≤10 min sostenido).
- Evidencia de tráfico/ventas que justifique invertir en presentación (no antes).
- Decisión explícita sobre checkout: WooPayments **no soporta headless** (STOP ya registrado en DEC-8). Migrar el storefront implica resolver la pasarela de pago primero. Sin esa respuesta, no se abre.

**Marketplace multi-vendor — sin cambios:** gates de `TARGET_OPTIONS.md §11` y PEND-2. 100+ productos, tráfico orgánico ≥1.000/mes, ventas recurrentes, propuesta de valor frente a Vinted, modelo de autenticidad. `owner_id` ya queda en el modelo desde el MVP para no pagar una migración cara después.

---

## 7. Respuestas directas a las preguntas de la Sesión 018

1. **¿Qué hacemos con `catenaccio-a0-child`?** → **FREEZE.** No se borra, no se activa, no se vuelve a sincronizar. Tag de git + nota de congelación. Es la referencia para una futura migración de storefront y una librería ya capturada de la lógica PHP crítica del tema activo.
2. **¿Qué hacemos con Elementor a corto plazo?** → **Dejarlo caducar.** No renovar, no invertir más en reemplazarlo ahora. La tienda sigue renderizando. Monitorizar; actuar solo si algo se rompe de verdad. A0 congelado es el fallback.
3. **¿Cuál es el producto real que hay que construir primero?** → **Catenaccio Studio (backoffice/PIM).** No un storefront nuevo.
4. **¿Debe Supabase ser la base de datos principal?** → **Sí**, como fuente de verdad operativa del inventario de Pablo. WooCommerce pasa a ser destino de publicación, no el maestro del stock.
5. **¿Debe Vercel ser frontend ya o más adelante?** → **Ya, pero solo para la app interna (Studio). Más adelante para la tienda pública.** Son dos "frontends" distintos.
6. **¿WooCommerce debe seguir siendo checkout temporal?** → **Sí, se queda** como checkout + tienda pública + pasarela (WooPayments). No es "temporal de quita inminente"; es el raíl de pago y la superficie SEO viva. Se revisa solo post-tracción.
7. **¿Cuál es el MVP de Catenaccio Studio?** → Formulario de alta (`§3`) + imágenes (Opción A) + "Sugerir con Claude" (título/descr./precio) + tabla de inventario con 11 estados + botón "Crear borrador en WooCommerce". Ver `CATENACCIO_STUDIO_TARGET.md`.
8. **¿Qué NO debemos construir todavía?** → Storefront Next.js público, marketplace, automatización Vinted, import Excel automático, gestión de pedidos/envíos en Studio, pagos propios, app móvil, notificaciones. (`STOCK_OPERATIONS_MODEL.md §6`.)
9. **¿Qué sesiones abrir después?** → S019 (modelo datos Supabase), S020 (contrato puente WC), S021 (scaffold MVP), S022 (alta+publicación), luego Pablo publica 5 camisetas → revisión fría.
10. **¿Cuál es el límite de tokens antes de reevaluar?** → Revisión fría a las 3 sesiones de impl. sin publicar 1 camiseta E2E, o STOP_AND_REPLAN a las ~4 sesiones sin MVP usable (§5).

---

## 8. Qué NO se tocó en esta sesión

- No se tocó WordPress, WP Admin, cPanel, servidor, DB, plugins, temas ni pagos.
- No se modificó el tema sombra `catenaccio-a0-child` ni `hello-elementor-child`.
- No se hizo deploy. No se creó código de Studio (solo documentación estratégica).
- No se usaron credenciales ni `.env.local`.
- No se creó Supabase ni Vercel (es acción de Pablo en el roadmap, fuera de esta sesión DOCS_ONLY).

---

*Sesión 018 — 2026-06-27 — Claude Code (Opus 4.8). Modo STRATEGIC / DOCS_ONLY.*
*Basado en: DECISIONS.md (DEC-8 A0+B1, DEC-9 acceso, DEC-10 shadow flow), STOCK_OPERATIONS_MODEL.md, API_READONLY_PROBE_RESULT.md, AS_IS_UNDERSTANDING.md (VALIDADO), y el veredicto previo del orquestador KILL_CURRENT_A0_RELEASE_LINE.*
