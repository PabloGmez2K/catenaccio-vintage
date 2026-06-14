# HISTORIAL_SESIONES — Catenaccio Vintage

Memoria permanente del proyecto. **Append-only. Nunca editar entradas pasadas. Nunca replace_all.**

Cross-referencia con `agent_events.jsonl` para detalle de eventos.

---

## Formato de entrada

```
---
**Sesión [N]** — [YYYY-MM-DD]  
**Agente:** [ChatGPT Orquestador / Opus / Sonnet / Codex]  
**Modo:** [LITE / NORMAL / FULL]  
**Tipo:** [docs / impl / fix / strategic / cierre]  
**Tarea:** [descripción breve de la tarea]

**Decisiones clave:**
- [Decisión 1]
- [Decisión 2]

**Qué se validó:** [cómo se sabe que funcionó]  
**Qué NO se tocó:** [explícito]  
**Siguiente paso:** [una acción concreta o DEFER_STOP]  
**agent_events ref:** [ID o timestamp del evento en .jsonl]
---
```

---

<!-- APPEND ENTRADAS AQUÍ — no modificar lo de arriba -->

---
**Sesión 0** — 2026-06-06  
**Agente:** lafabrica-template  
**Modo:** LITE  
**Tipo:** init  
**Tarea:** Creación del repo desde lafabrica-template + SEED

**Decisiones clave:**
- Stack seleccionado: Pendiente de discovery, Pendiente de discovery, Preferencia inicial Vercel, pendiente de validar
- Proyecto arrancado con lafabrica v0.2 (SEED → `lafabrica_new.py` → repo)

**Qué se validó:** Docs base generados con placeholders del SEED  
**Qué NO se tocó:** Código del proyecto, GitHub, deploy  
**Siguiente paso:** Sesión 1 con Opus — validación del SEED  
**agent_events ref:** —
---

---
**Sesión 1** — 2026-06-06  
**Agente:** Claude Code (Sonnet)  
**Modo:** LITE  
**Tipo:** docs / strategic  
**Tarea:** Registrar nuevo driver estratégico — cancelación de suscripción Elementor Pro

**Decisiones clave:**
- No se decide arquitectura ni migración en esta sesión.
- La cancelación de Elementor Pro se registra como factor estratégico a evaluar en AS-IS y TARGET.
- TARGET_OPTIONS queda pendiente hasta revisar AS-IS con este nuevo dato incorporado.

**Qué se validó:** Actualización de docs (CONTEXTO, BACKLOG, AS_IS_UNDERSTANDING, LAFABRICA_INTAKE_MANIFEST, TARGET_OPTIONS, DECISIONS, HISTORIAL_SESIONES) sin tocar código, WordPress, producción ni credenciales.  
**Qué NO se tocó:** Código, WordPress, credenciales, dominio, hosting, Vercel, SEC-001, SEC-002, implementación técnica.  
**Siguiente paso:** Sesión de revisión AS-IS con impacto de Elementor Pro incluido. Luego preparar TARGET_OPTIONS.  
**agent_events ref:** —
---

---
**Sesión 002** — 2026-06-06  
**Agente:** Claude Code (Sonnet)  
**Modo:** LITE  
**Tipo:** docs / security-sync  
**Tarea:** Sincronizar en el repo la resolución manual confirmada por el operador de SEC-001 y SEC-002; actualizar AS-IS con datos confirmados del stack y validaciones de hipótesis; preparar siguiente tarea de acceso seguro al servidor.

**Decisiones clave:**
- SEC-001 y SEC-002 marcados RESUELTOS por confirmación manual del operador. El agente no verificó técnicamente — la responsabilidad de la rotación es del operador.
- El bloqueante de seguridad que impedía avanzar a TARGET_OPTIONS queda eliminado.
- Bloque 3 (incógnitas del AS-IS) validado: no bloquea el AS-IS, pero justifica una sesión SERVER_CONTEXT_CHECK_READONLY antes de TARGET_OPTIONS.
- Hipótesis workflow/AI-first marcada como VALIDADA por operador.
- Nueva tarea añadida al BACKLOG: SERVER_ACCESS_SAFE_SETUP / SERVER_CONTEXT_CHECK_READONLY.

**Qué se validó:** SECURITY_REVIEW.md actualizado con estado RESUELTO en SEC-001 y SEC-002. VALIDATION_RECORD.md con VAL-003. AS_IS_UNDERSTANDING.md con versiones confirmadas (WP 7.0, WooCommerce 10.8.1), hosting (com1014, cPanel 134.0, Apache 2.4.67, MariaDB 11.4.10-cll-lve, IP 178.211.133.29), Elementor Pro expiry, LiteSpeed problema, hipótesis workflow validada, Bloque 3 validado. BACKLOG.md sin bloqueante SEC, con nueva tarea. CONTEXTO.md e HISTORIAL_SESIONES.md actualizados. agent_events.jsonl con evento de sesión.  
**Qué NO se tocó:** Código, WordPress, wp-config.php, hosting, Google Cloud, OAuth, credenciales, dominio, DNS, Vercel, producción. No se solicitó ni copió ningún secreto. DECISIONS.md no modificado.  
**Siguiente paso:** SESSION SERVER_CONTEXT_CHECK_READONLY — diseñar acceso seguro read-only al servidor para verificar estado real del sitio antes de preparar TARGET_OPTIONS.  
**agent_events ref:** 2026-06-06T12:00:00Z (security_resolved)
---

---
**Sesión 003** — 2026-06-10  
**Agente:** Claude Code (Sonnet)  
**Modo:** API_FAST_DISCOVERY  
**Tipo:** docs / server-context-check  
**Tarea:** Completar SERVER_CONTEXT_CHECK_READONLY vía evidencias del operador (WP Admin Site Health + WooCommerce System Status) sin SSH. Raiola Networks Inicio SSD 2.0 confirmado sin acceso SSH — se acepta como decisión operativa permanente.

**Decisiones clave:**
- SSH no es requisito para discovery en Catenaccio: Raiola no lo ofrece en este plan. Se usa vía WP Admin como método estándar.
- Elementor Pro (v3.35.1) expira ~2026-07-01. Operador confirma que NO renovará. Pasa a ser el driver y deadline central de TARGET_OPTIONS.
- Servidor HTTP real confirmado como LiteSpeed (no Apache 2.4.67 como estaba en el AS-IS). Corrección documentada.
- OPcache completamente lleno (16 bytes libres, cache_full=true) — riesgo activo de rendimiento en producción. Registrado como PROB-09.
- WP_MEMORY_LIMIT = 40M en front-end (no 512M) — registrado como PROB-10.
- WooCommerce usa HPOS (OrdersTableDataStore), sync desactivado.
- WooPayments en modo LIVE con APMs activos: card, bancontact, ideal, multibanco, Apple Pay, Google Pay.
- WPS Hide Login instalado pero inactivo — /wp-admin expuesto. Registrado como PROB-12.
- Mini-cart template de Elementor Pro desactualizado (sin version header, requiere 10.0.0). PROB-11.
- ACF confirmado FREE (no Pro), 16 post types, 20 taxonomías.
- 28 productos confirmados. Sin publicaciones nuevas desde 15/03/2026.

**Qué se validó:** AS_IS_UNDERSTANDING.md actualizado con corrección httpd→LiteSpeed, Elementor Pro expiración con fecha y decisión definitiva, OPcache riesgo, WP_MEMORY_LIMIT, HPOS activo, shop URL /camisetas/, WooPayments live, WPS Hide Login inactivo, ACF FREE, ghost DB tables de 8+ plugins removidos, 7 nuevos PROBs (09-15), hipótesis de productos validada. BACKLOG.md actualizado con urgencia TARGET_OPTIONS y SERVER_CONTEXT_CHECK en DONE. CONTEXTO.md con Sesión 003.  
**Qué NO se tocó:** Código, WordPress, wp-config.php, cPanel, hosting, base de datos, credenciales, dominio, DNS, OAuth, producción. No se solicitaron ni copiaron secretos. No se preparó TARGET_OPTIONS.  
**Siguiente paso:** Operador valida AS_IS_UNDERSTANDING.md → cambia estado a VALIDADO_POR_USUARIO → preparar TARGET_OPTIONS con deadline ~2026-07-01.  
**agent_events ref:** 2026-06-10T10:30:00Z (server_context_check_complete)
---

---
**Sesión 004** — 2026-06-10  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** docs / as-is-validation  
**Tarea:** Cerrar la validación del AS-IS de Catenaccio Vintage: cambiar estado de AS_IS_UNDERSTANDING.md a VALIDADO_POR_USUARIO y registrar la validación formal.

**Decisiones clave:**
- El operador valida explícitamente el AS-IS como suficientemente correcto para avanzar a TARGET_OPTIONS.
- Las incógnitas residuales (backlog_v6.xlsx, buscador AJAX, presencia Vinted) no bloquean la decisión de arquitectura.
- El workflow de discovery avanza de `DISCOVERY_ABIERTO` a `AS_IS_VALIDADO`.
- Próxima sesión: TARGET_OPTIONS con deadline ~2026-07-01 (expiración Elementor Pro).

**Qué se validó:** AS_IS_UNDERSTANDING.md estado → VALIDADO_POR_USUARIO. VALIDATION_RECORD.md con VAL-004 y checklist AS-IS marcado. BACKLOG.md con validación en DONE y TARGET_OPTIONS como prioridad NOW. CONTEXTO.md con siguiente paso actualizado y sesión 004 registrada. HISTORIAL_SESIONES.md con esta entrada. agent_events.jsonl con evento as_is_validated. Commit docs-only.  
**Qué NO se tocó:** Código, WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS. No se preparó TARGET_OPTIONS. No se tomaron decisiones de arquitectura.  
**Siguiente paso:** Sesión 005 — TARGET_OPTIONS. Comparar mínimo 4 opciones con deadline ~2026-07-01. El operador aprueba la opción y se genera el SEED.  
**agent_events ref:** 2026-06-10T11:00:00Z (as_is_validated)
---

---
**Sesión 005d** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** approve + push  
**Tarea:** Registrar aprobación formal del operador para A0 + B1, cerrar TARGET_OPTIONS como aprobado, y pushear los commits pendientes a GitHub.

**Decisiones clave:**
- TARGET_OPTIONS.md → estado `OPCIÓN_APROBADA`. Opción aprobada: A0 + B1.
- Aprobación literal del operador: "APPROVE A0 + B1. Marketplace queda como NORTH_STAR / DEFER."
- Workflow de discovery avanza: AS_IS_VALIDADO → TARGET_APROBADO.
- VALIDATION_RECORD.md con VAL-005. DECISIONS.md DEC-8 cerrada como APROBADA. DEC-8 / PEND-2 marketplace confirmado como NORTH_STAR/DEFER.
- BACKLOG.md: bloqueo de implementación levantado. Nuevas tareas NOW: A0_IMPLEMENTATION_PLAN, B1_CATENACCIO_STUDIO_SEED, CMS_API_ACCESS_MODEL_READONLY.
- 4 commits (005, 005b, 005c, 005d) pusheados a origin/main.

**Qué se validó:** TARGET_OPTIONS.md OPCIÓN_APROBADA. VALIDATION_RECORD.md VAL-005. DECISIONS.md DEC-8 APROBADA. BACKLOG.md actualizado. CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. Push a GitHub completado.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS, pagos, código. No se implementó código. No se creó Application Password.  
**Siguiente paso:** Sesión 006 — Track 0: auditoría elementor_library + migración + fixes (deadline 2026-07-01). Track 1 paralelo: Application Password + scaffold Studio.  
**agent_events ref:** 2026-06-13T15:00:00Z (target_approved_and_pushed)
---

---
**Sesión 007b** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** api-probe / authenticated  
**Tarea:** Probe autenticado completo usando Application Password de `catenaccio-studio-agent`. Verificar acceso WC REST API v3, Elementor, y auditar modelo de datos real de productos.

**Decisiones clave:**
- Credenciales verificadas: usuario id=16, slug `catenaccio-studio-agent`, rol `shop_manager` = "Gestor de la tienda". Capacidad `manage_woocommerce` confirmada.
- **Hallazgo crítico:** todos los productos tienen `attributes: []` (vacío) en WC REST API. Los atributos se almacenan en `meta_data` como ACF fields: `liga`/`equipo`/`jugador`/`ano_temporada` como IDs de término WC, `talla`/`condicion` como strings. Studio debe escribir en `meta_data`, no en `attributes[]`.
- Elementor Pro: `isExpired: false`. Licencia activa con ~18 días restantes.
- 14 templates en elementor_library (no 19 como decía el AS_IS — 5 menos, posiblemente eliminados). 12/14 son Pro-dependientes por tipo de template (loop-item, product-archive, product, header, footer, search-results, error-404). Solo `single-page` podría no requerir Pro.
- Límite de shop_manager: puede listar templates pero no leer su contenido JSON. Para widget-level audit se necesita Application Password de Administrator.
- pa_equipo: 21 términos confirmados. pa_liga: 6 términos (Bundesliga, Eredivisie, LaLiga, Ligue 1, Premier League, Serie A).

**Qué se validó:** `API_READONLY_PROBE_RESULT.md` actualizado con todos los hallazgos autenticados. BACKLOG.md, CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. Ningún write al sitio.  
**Qué NO se tocó:** WordPress, producción, ninguna escritura. `.env.local` no mostrado ni cometteado.  
**Siguiente paso:** Sesión 008 — A0_ELEMENTOR_DEPENDENCY_AUDIT. Decidir si crear App Password de Admin para widget-level audit, o hacer auditoría visual en WP Admin. 12/14 templates ya clasificados como Pro por tipo.  
**agent_events ref:** 2026-06-13T20:00:00Z (api_auth_probe_complete)
---

---
**Sesión 007** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** api-probe / access-verification  
**Tarea:** Probar acceso de solo lectura a WordPress/WooCommerce. Confirmar qué endpoints funcionan sin auth, cuáles requieren Application Password, y si elementor_library puede auditarse por API.

**Decisiones clave:**
- `.env.local` está vacío — Pablo creó el archivo pero no lo completó. Probe autenticado bloqueado hasta completarlo.
- Endpoints públicos funcionan correctamente. 28 productos confirmados vía Store API. Elementor Pro namespace activo (`elementor-pro/v1`).
- `elementor_library` es post type registrado y visible públicamente (wp/v2/types). Sus items requieren auth.
- La auditoría de elementor_library es factible 100% por API con `GET /wp-json/wp/v2/elementor_library?context=edit` — sin capturas manuales de Pablo.
- WC Store API (público) no expone atributos custom. WC REST API v3 con auth es la vía para pa_liga, pa_equipo, etc.
- El usuario limitado debe tener rol `Shop Manager` para acceso completo a WC REST API v3. `Author` no es suficiente.
- Precios en WC están en EUR cents (4500 = €45.00).

**Qué se validó:** `API_READONLY_PROBE_RESULT.md` creado con resultados completos. BACKLOG.md actualizado. CONTEXTO.md con estado y nuevo orden. HISTORIAL_SESIONES.md con esta entrada. agent_events.jsonl con evento. Ningún write al sitio WordPress. `.env.local` no cometteado ni leído en contenido.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, código, credenciales. Ningún POST/PUT/PATCH/DELETE ejecutado.  
**Siguiente paso:** Pablo completa `.env.local` (WP_SITE_URL, WP_APP_USER con rol Shop Manager, WP_APP_PASSWORD) → Sesión 007b: probe autenticado (usuario, WC atributos, elementor_library 19 items, licencia Pro).  
**agent_events ref:** 2026-06-13T19:00:00Z (api_readonly_probe_executed)
---

---
**Sesión 006d** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** reorder / access-first  
**Tarea:** Corregir el orden operativo tras 006c: access-first como primera acción real, no pedir listas manuales a Pablo antes de probar el acceso.

**Decisiones clave:**
- `ACCESS_MODEL_ACTIVATION_READONLY` pasa a ser la primera acción en NOW — Pablo crea usuario limitado + Application Password (guía `ACCESS_MODEL_NO_SSH.md §6`). Prerequisito para todo lo que sigue.
- `WP_WC_API_READONLY_PROBE` — segunda acción: el agente verifica el acceso con una llamada GET de solo lectura. Confirma antes de auditar Elementor.
- `A0_ELEMENTOR_DEPENDENCY_AUDIT` — tercera acción: el agente audita los 19 items de elementor_library vía WP Admin / API. No depende de lista manual de Pablo como vía principal (solo fallback).
- `B1_CATENACCIO_STUDIO_SEED` movido de NOW a NEXT — Studio no arranca hasta que el acceso API esté verificado.
- Tareas stock/Excel/fotos/Vinted confirman posición en NEXT — no son acción inmediata de Pablo, no bloquean A0.
- `STOCK_OPERATIONS_MODEL.md` se mantiene íntegro como contexto B1 — añadida nota de que no bloquea A0 ni la activación del acceso.
- DEC-9 actualizada con nota: access-first es la política operativa activa.

**Qué se validó:** BACKLOG.md NOW reordenado — access-first como prioridad explícita. CONTEXTO.md siguiente paso con orden correcto 4 pasos. HISTORIAL_SESIONES.md con 006d. agent_events.jsonl con access_first_reordered. DECISIONS.md DEC-9 con nota policy. STOCK_OPERATIONS_MODEL.md con nota "no bloquea A0".  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, código. STOCK_OPERATIONS_MODEL.md contenido no modificado (solo nota añadida). No se creó Application Password. No se auditó Elementor.  
**Siguiente paso:** Pablo ejecuta `ACCESS_MODEL_ACTIVATION_READONLY` (WP Admin, 10-15 min) → Sesión 007: WP_WC_API_READONLY_PROBE → Sesión 008: A0_ELEMENTOR_DEPENDENCY_AUDIT.  
**agent_events ref:** 2026-06-13T18:00:00Z (access_first_reordered)
---

---
**Sesión 006c** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** strategic / stock-operations-model  
**Tarea:** Modelar la operativa real de stock de Pablo para que Catenaccio Studio sea un sistema operativo de inventario, no solo un formulario de publicación.

**Decisiones clave:**
- Catenaccio Studio definido explícitamente como PIM + gestor de estados + asistente de publicación web/Vinted + base futura de marketplace (sin construirlo).
- 11 estados del ciclo de vida de una camiseta: COMPRADA → PENDIENTE_FOTOS → FOTOS_HECHAS → PENDIENTE_DESCRIPCION → BORRADOR_WEB → PENDIENTE_WEB → PUBLICADA_WEB → PENDIENTE_VINTED → PUBLICADA_VINTED → RESERVADA → VENDIDA → ARCHIVADA.
- 8 bloques de campos mínimos definidos: identificación, compra/coste, precio/margen (con cálculo automático de margen_esperado y margen_real), atributos WC (pa_liga, pa_equipo, etc.), contenido Claude (título SEO, descripción, precio sugerido), imágenes (carpeta_local, estado_fotos), estado operativo/publicación (id_woocommerce, url_web, url_vinted, canal_venta), ubicación física y notas.
- Recomendación imágenes: Opción A en MVP (registrar ruta de carpeta local, sin mover fotos), escalar a Opción C (upload directo a WC Media Library vía `POST /wp-json/wp/v2/media`) cuando Studio esté en uso.
- No importar Excel todavía. Primer paso: Pablo comparte columnas reales de STOCK.xlsx. Segundo paso: plantilla CSV futura compatible con Studio. Tercer paso: importador en iteración posterior.
- 5 tareas derivadas añadidas al BACKLOG: EXCEL_STOCK_IMPORT_MAPPING, LOCAL_IMAGE_FOLDER_WORKFLOW, VINTED_PUBLICATION_TRACKING, STUDIO_PRODUCT_STATUS_PIPELINE, STUDIO_MVP_DESIGN actualizado con referencia a este documento.
- Qué NO construir en MVP: marketplace, multi-vendor, sincronización Vinted automática, publicación sin revisión, sistema de pagos propio, gestión pedidos, import automático precios mercado, app móvil.

**Qué se validó:** `docs/operations/STOCK_OPERATIONS_MODEL.md` creado. BACKLOG.md con B1_STOCK_OPERATIONS_MODEL marcado done + 5 tareas derivadas añadidas + registro en DONE. CONTEXTO.md y HISTORIAL_SESIONES.md con Sesión 006c. agent_events.jsonl con evento stock_operations_model_defined.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, pagos, código, Excel de Pablo. No se creó Application Password. No se implementó código.  
**Siguiente paso:** Sesión 007 (auditoría Elementor Library) + Pablo comparte columnas de STOCK.xlsx (acción sin agente) + Sesión 008 (Pablo crea credenciales ACCESS_MODEL §6) + Sesión 009 (Studio MVP).  
**agent_events ref:** 2026-06-13T17:00:00Z (stock_operations_model_defined)
---

---
**Sesión 005c** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** strategic / marketplace-north-star  
**Tarea:** Incorporar la visión de marketplace multi-vendor a largo plazo en TARGET_OPTIONS, sin cambiar la recomendación inmediata A0+B1.

**Decisiones clave:**
- Marketplace declarado como NORTH_STAR / DEFER (PEND-2 en DECISIONS.md). No es el MVP.
- 4 fases documentadas: Fase 1 (tienda estable) → Fase 2 (Studio interno) → Fase 3 (catálogo robusto) → Fase 4 (marketplace si hay tracción).
- Gates explícitos para Fase 4: 100+ productos, workflow ≤10 min, tráfico orgánico, ventas recurrentes, propuesta de valor clara frente a Vinted, sistema de autenticidad, modelo económico.
- Implicaciones de diseño ahora: `owner_id` en modelo de producto, auth con JWT (no hardcoded), URLs sin asumir seller subdomains. Sin features de marketplace en MVP.
- Recomendación A0+B1 sin cambios — sigue siendo la decisión pendiente de aprobación del operador.

**Qué se validó:** TARGET_OPTIONS.md con §11 Marketplace North Star + §12 QUÉ NO HACER actualizado + §14-15 renumerados. DECISIONS.md con PEND-2. BACKLOG.md con MARKETPLACE_NORTH_STAR_VALIDATION en LATER. CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, pagos, código. Recomendación A0+B1 no modificada. No se creó Application Password. No se pusheó.  
**Siguiente paso:** Operador aprueba A0+B1 → Sesión 006.  
**agent_events ref:** 2026-06-13T14:00:00Z (marketplace_north_star_added)
---

---
**Sesión 005b** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** strategic / root-cause-reframe  
**Tarea:** Revisión y corrección de TARGET_OPTIONS.md tras contexto adicional del operador sobre la fricción real de Catenaccio. Añadir Root Cause y corregir el veredicto de "Opción A (Gutenberg)" a "A0 + B1 (Studio)".

**Decisiones clave:**
- Root Cause documentada: 5 bloqueantes reales (Elementor, backoffice caótico, arquitectura catálogo, performance, visión de app/platform).
- Veredicto corregido: APPROVE A0 + B1. A0 = continuidad WordPress (deadline 2026-07-01). B1 = Catenaccio Studio, backoffice/PIM AI-first (Next.js + WC REST API + Claude).
- Insight estratégico: el cuello de botella no es el frontend — es el backoffice. Reemplazar Elementor por Gutenberg no cambia la dinámica de publicación. Studio sí la cambia.
- Modelo de acceso sin SSH definido: Application Password, usuario limitado, modos READ_ONLY / DRAFT_ONLY / APPLY_WITH_APPROVAL.
- Track 3 (storefront público moderno) DEFER hasta 100+ productos y evidencia de tráfico.
- WooPayments como razón de STOP para headless: no soporta headless checkout en producción en 2026.

**Qué se validó:** TARGET_OPTIONS.md reescrito con Root Cause + estrategia A0+B1 + modelo API + plan 7/30/90. DECISIONS.md con DEC-8 corregida. BACKLOG.md con nuevas tareas STUDIO_MVP_DESIGN, PRODUCT_WORKFLOW_DESIGN, WC_API_ACCESS_MODEL, ATTRIBUTE_TAXONOMY_SEO, PERFORMANCE_HOSTING_DECISION. CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS, pagos, código, Elementor Pro. No se generó SEED ni plan de implementación. No se creó Application Password (solo se definió el modelo).  
**Siguiente paso:** Operador aprueba A0 + B1 → Sesión 006: Track 0 (auditoría elementor_library + migración) + Track 1 (Application Password + scaffold Studio).  
**agent_events ref:** 2026-06-13T13:00:00Z (target_options_reframed)
---

---
**Sesión 005** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** strategic / target-options  
**Tarea:** Preparar TARGET_OPTIONS.md con comparativa estratégica completa y recomendación para el deadline de Elementor Pro (~2026-07-01).

**Decisiones clave:**
- Veredicto APPROVE Opción A: mantener WordPress + WooCommerce y eliminar la dependencia de Elementor Pro antes del 2026-07-01.
- Insight crítico documentado: el Checkout ya fue migrado a Gutenberg Checkout Blocks en febrero 2026. El riesgo de pagos al quitar Elementor Pro es prácticamente cero.
- Opción B (headless) STOP: WooPayments no soporta headless en producción.
- Opción C (migración completa) DEFER: inviable antes del deadline. Reevaluar con evidencia en 6-12 meses.
- Opción D (aplazar) DEFER condicional: solo si Opción A resulta más compleja de lo esperado.
- Opción E (Shopify) STOP: pérdida de activos reales sin justificación.
- PEND-1 avanzada a recomendación fuerte DEC-8 en DECISIONS.md (pendiente de aprobación del operador).

**Qué se validó:** TARGET_OPTIONS.md generado con 11 secciones (veredicto, contexto, opciones, comparativa, riesgos, recomendación binaria, plan 7/30/90, qué no hacer, pregunta al operador, cambios documentales, cierre). BACKLOG.md con TARGET_OPTIONS marcado DONE, nuevas tareas de auditoría e implementación. DECISIONS.md con DEC-8 propuesta. CONTEXTO.md e HISTORIAL_SESIONES.md actualizados. agent_events.jsonl con evento.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS, pagos, código, Elementor Pro. No se generó SEED ni plan de implementación. No se inició ninguna tarea técnica.  
**Siguiente paso:** Operador aprueba Opción A → Sesión 006: generar RECOMMENDED_IMPLEMENTATION_PLAN.md + SEED + auditoría elementor_library en WP Admin.  
**agent_events ref:** 2026-06-13T00:00:00Z (target_options_ready)
---

---
**Sesión 004c** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** LITE  
**Tipo:** docs / repo-os-sync  
**Tarea:** Sincronizar el sistema operativo documental de Catenaccio con aprendizajes genéricos recientes de Bijuymoda Suite, antes de abrir TARGET_OPTIONS.

**Decisiones clave:**
- Aprendizajes transferidos como principios operativos adaptados a Catenaccio (WP/WC, sin SSH, Elementor deadline).
- No copiados: workflow SSH de Bijuymoda, política Gemini-first, reglas PrestaShop, Company Brain, transferencia a lafabrica.
- TARGET_OPTIONS no iniciado — desbloqueado pero pendiente de Sesión 005.

**Qué se validó:** ORCHESTRATOR.md, AGENTS.md y CHATGPT_PROJECT_INSTRUCTIONS.md actualizados con stack real y reglas operativas. Bijuymoda Suite no modificado. git diff --check limpio.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS, TARGET_OPTIONS. Bijuymoda Suite: solo lectura.  
**Siguiente paso:** Sesión 005 — TARGET_OPTIONS. Usar Opus para evaluación final y veredicto APPROVE/STOP.  
**agent_events ref:** 2026-06-13T00:00:00Z (repo_os_sync)
---

---
**Sesión 006** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** docs / access-model / operations  
**Tarea:** Definir el modelo operativo de acceso a WordPress/WooCommerce sin SSH (Raiola Inicio SSD 2.0) para Catenaccio Vintage, prerequisito para Catenaccio Studio (Track 1).

**Decisiones clave:**
- Modelo de acceso en 4 capas: sin acceso servidor (siempre activo para el agente) / WP Admin manual (Pablo) / WP+WC REST API (agente con credenciales limitadas) / cPanel+Raiola Soporte (Pablo, excepcional).
- 6 modos de operación definidos: READ_ONLY, API_READ_ONLY, DRAFT_ONLY, APPLY_WITH_APPROVAL, MANUAL_BY_PABLO, BLOCKED_WITHOUT_STAGING.
- Modo por defecto del agente: DRAFT_ONLY. El agente prepara borradores — Pablo publica.
- Credencial recomendada para Studio: Application Password de usuario limitado `catenaccio-studio-agent`. Alternativa: WC API Key.
- Credenciales prohibidas: contraseña admin, wp-config.php, cPanel, pasarelas de pago.
- Regla de oro: credenciales en `.env.local` local — nunca en repo, nunca en chat.
- Modelo de revocación documentado (por nombre de password, por key, por usuario).
- Operaciones bloqueadas sin staging: functions.php, tema hijo, plugins custom — solo microfix con procedimiento autorizado.
- Opciones de staging en Raiola documentadas (subdominio manual, WP Duplicator, upgrade, entorno local).
- Plan OPcache/Raiola: valores recomendados (`opcache.memory_consumption=128`, `max_accelerated_files=4000`), texto de ticket para Raiola, fix de `WP_MEMORY_LIMIT` en wp-config.php.
- DEC-9 añadida en DECISIONS.md.

**Qué se validó:** `docs/operations/ACCESS_MODEL_NO_SSH.md` creado. DECISIONS.md con DEC-9. BACKLOG.md actualizado (CMS_API_ACCESS_MODEL_READONLY marcado completado-pendiente-ejecución, nuevas entradas, DONE actualizado). CONTEXTO.md con sesión 006 y nuevo siguiente paso. HISTORIAL_SESIONES.md esta entrada. agent_events.jsonl con evento. git diff --check limpio.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, cPanel, hosting, dominio, DNS, pagos, código, Elementor. No se creó ninguna credencial. No se entró en WP Admin.  
**Siguiente paso:** Sesión 007 — Track 0: Pablo entrega capturas/lista de elementor_library (19 items) → auditoría Elementor con Antigravity o Sonnet. Acción inmediata sin agente: Pablo abre ticket Raiola (OPcache) siguiendo §9 del ACCESS_MODEL_NO_SSH.md.  
**agent_events ref:** 2026-06-13T16:00:00Z (access_model_no_ssh_defined)
---

---
**Sesión 008** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY (ventana temporal de Administrator)  
**Tipo:** audit / A0_ELEMENTOR_DEPENDENCY_AUDIT  
**Tarea:** Auditoría widget-level de todos los templates Elementor con credenciales de Administrador. Pablo elevó temporalmente `catenaccio-studio-agent` a Administrator para esta sesión. Crear `docs/operations/ELEMENTOR_DEPENDENCY_AUDIT.md`.

**Decisiones clave:**
- Widget-level audit completado via `wp/v2/elementor_library/{id}?context=edit` — método que funciona con Admin (vs. 403 con shop_manager).
- 17 templates de elementor_library + 2 páginas WC (Carrito, Mi Cuenta) auditados.
- **CRÍTICOS (3):** Cabecera (653) con nav-menu + woocommerce-menu-cart, Producto individual (100) con 5 widgets WC Pro, Archivo productos (129) con loop-grid.
- **ALTO impacto (8+):** footer form, loop items ×5, resultados búsqueda, popup menú, carrito y mi cuenta.
- **Hallazgo correctivo:** Carrito (id=25) y Mi Cuenta (id=27) usan widgets Pro (`woocommerce-cart`, `woocommerce-my-account`). No estaban en WooCommerce Blocks como indicaban notas previas.
- **Finalizar Compra (id=1548) SÍ está en Blocks** — único elemento de checkout ya migrado.
- id=1414 posiblemente inactivo en uso real — conditions excluyen shop/cat/search.
- Quick win disponible: Carrito + Mi Cuenta reemplazables por shortcodes en WP Admin en ~10 min.
- Plan de migración A0 definido en 4 prioridades (P1 crítico, P2 alto, P3 medio, P4 bajo).

**Qué se validó:** `docs/operations/ELEMENTOR_DEPENDENCY_AUDIT.md` creado con tabla completa, catálogo de 17 widgets Pro, mapa de impacto por sección, plan de migración priorizado. `API_READONLY_PROBE_RESULT.md` actualizado con nota de sesión 008 y hallazgo Carrito/Mi Cuenta. BACKLOG.md: A0_ELEMENTOR_DEPENDENCY_AUDIT ✅, A0_MIGRATION_PLAN + CARRITO_MICUENTA_QUICKWIN añadidos a NOW. CONTEXTO.md siguiente paso actualizado. HISTORIAL_SESIONES.md esta entrada. agent_events.jsonl con evento.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, configuración, Elementor templates, páginas, plugins. Ningún write al sitio. Ningún POST/PUT/PATCH/DELETE ejecutado.  
**Siguiente paso:** (1) Pablo revierte `catenaccio-studio-agent` a Gestor de la tienda. (2) Pablo hace quickwin Carrito + Mi Cuenta (10 min en WP Admin). (3) Sesión 009: A0_MIGRATION_PLAN — plan técnico child theme para P1-A/B/C.  
**agent_events ref:** 2026-06-13T22:00:00Z (elementor_dependency_audit_complete)
---

---
**Sesión 009** — 2026-06-14  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** integration-close / seo-connector  
**Tarea:** Cerrar correctamente en el repo la integración local validada de Google Search Console API en modo read-only. Documentar el patrón reusable para lafabrica y Bijuymoda Suite.

**Decisiones clave:**
- GSC_API_READONLY_CONNECTOR marcado como validado localmente. No se abre sesión de implementación — el estado ya era funcional.
- Script `scripts/seo/gsc_probe.py` revisado: correcto sin cambios necesarios (scope readonly, carga `.env.local`, `sites.list()` + `searchanalytics.query`, token en `.secrets/`).
- `requirements-gsc.txt` correcto sin cambios.
- `.gitignore`: las reglas para `.secrets/`, `**/token*.json`, `**/client_secret*.json`, `**/credentials*.json` ya estaban añadidas por Pablo (M en git status). Se versiona tal cual.
- Patrón reusable documentado en `GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR_PATTERN.md` con 9 pasos y checklist de seguridad.
- Patrón registrado como candidato `LAFABRICA_TRANSFER_GSC_CONNECTOR_PATTERN` para lafabrica.
- Instrucciones específicas para Bijuymoda Suite incluidas en el patrón (sin tocar el repo de Bijuymoda en esta sesión).
- SERVER_FILESYSTEM_READONLY_DISCOVERY se mantiene como siguiente tarea principal de A0.

**Qué se validó:**
- `python scripts/seo/gsc_probe.py` ejecutado correctamente: propiedad `https://catenacciovintage.com/` detectada como siteOwner, datos reales devueltos (queries, páginas, clicks, impressions, CTR, posición).
- `git status --short --ignored` confirmado: `.env.local` → `!!`, `.secrets/` → `!!`, `.venv/` → `!!`. Ningún secreto como `??` o `M`.
- Búsqueda de señales de secretos en archivos versionables: solo referencias a nombres de archivo y patrones de código — sin valores reales.

**Qué NO se tocó:** WordPress, WooCommerce, producción, Google Cloud (solo se documentó), Search Console (solo lectura ya validada por Pablo), Bijuymoda Suite, lafabrica, credenciales.  
**Siguiente paso:** Sesión 010 — SERVER_FILESYSTEM_READONLY_DISCOVERY: mapear child theme, plugins custom, archivos Elementor override vía cPanel File Manager (read-only) o FTP readonly. Prerequisito para A0_MIGRATION_PLAN.  
**agent_events ref:** 2026-06-14T12:00:00Z (gsc_readonly_connector_closed)
---

---
**Sesión 010A** — 2026-06-14  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** discovery / filesystem / blocked  
**Tarea:** SERVER_FILESYSTEM_READONLY_DISCOVERY — conectar al filesystem real de WordPress vía Web Disk/WebDAV (read-only) y mapear child theme, plugins custom y overrides Elementor antes de A0_MIGRATION_PLAN.

**Decisiones clave:**
- Web Disk de cPanel configurado por Pablo (cv-readonly@catenacciovintage.com, directorio: public_html/wp-content, permisos: solo lectura). Credenciales presentes en `.env.local`.
- **BLOCKED_WEBDAV_CONNECTION:** puertos 2077/2078 bloqueados por firewall de Raiola en planes compartidos. Subdominio `webdisk.catenacciovintage.com` sin entrada DNS. Puerto 443 devuelve 403 a PROPFIND (WebDAV no habilitado en el webserver del dominio).
- No se ejecutó ninguna escritura (PUT/POST/DELETE/MKCOL) en ningún momento. Read-only no verificado por write attempt — asumido por configuración cPanel.
- Script `scripts/filesystem/webdav_probe.py` creado y ejecutado — funcional, reutilizable si se desbloquea el acceso.
- Mapa A0 documentado con datos disponibles de sesiones anteriores: riesgos de rewrite rules, Filtro Camisetas Pro vs loop-grid, Off-Canvas Menu widget dependency.
- Veredicto: **FIX_BLOCKER_FIRST**. Ruta A (más rápida): Pablo pega 4 ficheros desde cPanel File Manager.
- CARRITO_MICUENTA_QUICKWIN no bloqueado — Pablo puede hacerlo YA en WP Admin (10 min).

**Qué se validó:** `docs/operations/SERVER_FILESYSTEM_READONLY_DISCOVERY.md` creado. BACKLOG.md, CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. Script de probe en `scripts/filesystem/webdav_probe.py`. Ningún write al sitio. Ningún secreto impreso ni commiteado.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, cPanel, Elementor, base de datos, archivos del servidor. Ningún método WebDAV de escritura ejecutado.  
**Siguiente paso:** Pablo elige ruta de desbloqueo (ver `SERVER_FILESYSTEM_READONLY_DISCOVERY.md §5`): Ruta A (cPanel File Manager, 20-30 min) o Ruta B (corregir URL WebDAV en .env.local). Luego Sesión 010B: A0_MIGRATION_PLAN con código real.  
**agent_events ref:** 2026-06-14T16:xx:xx (filesystem_discovery_blocked_webdav)

---
**Sesión 010B** — 2026-06-14  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** discovery / filesystem / cpanel-api  
**Tarea:** SERVER_FILESYSTEM_READONLY_DISCOVERY vía cPanel API Token. Leer filesystem real del servidor en modo estrictamente read-only usando UAPI Fileman (list_files + get_file_content).

**Decisiones clave:**
- **Canal de acceso:** cPanel UAPI Token (`Authorization: cpanel {user}:{token}`) — exitoso donde WebDAV había fallado. Script reutilizable: `scripts/filesystem/cpanel_uapi_probe.py`.
- **Off-Canvas Menu:** 100% independiente de Elementor. Es un shortcode (`[catenaccio_offcanvas_menu]`) con assets propios. NO registra widgets Elementor. Riesgo eliminado.
- **Filtro Camisetas Pro v3.0.0:** Core WC-nativo. Hook `elementor/query/filtro_camisetas` solo se activa si hay Loop Grid activo — al reemplazarlo, este hook queda inerte. Riesgo reducido a BAJO.
- **functions.php (62KB, ~1712 líneas):** Shortcodes custom (cv_product_meta, cv_explorar, cv_archive_title, cv_archive_intro, cv_short_description, cv_search_latest_products) — todos independientes de Elementor. URL rewrite system robusto con transients. Mini-cart JS usa selectores Elementor Pro que se vuelven no-op al desactivar Pro.
- **Sin woocommerce/ override directory** en child theme — confirmado. Sin template overrides WC.
- **mu-plugins vacío** — Raiola no instala mu-plugins en este plan.
- **ACF solo FREE** — no hay dependencias ACF Pro.
- **Veredicto:** APPROVE_A0_MIGRATION_PLAN_PREP.

**Qué se validó:** `docs/operations/SERVER_FILESYSTEM_READONLY_DISCOVERY.md` actualizado con estado CPANEL_API_READONLY_DISCOVERY_COMPLETED, inventario completo, análisis de dependencias, riesgos actualizados y veredicto. BACKLOG.md: SERVER_FILESYSTEM_READONLY_DISCOVERY ✅, A0_MIGRATION_PLAN desbloqueado. CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. Ninguna escritura al servidor. Token no impreso ni commiteado.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, configuración, credenciales, archivos del servidor. Ningún método de escritura UAPI ejecutado.  
**Siguiente paso:** A0_MIGRATION_PLAN — plan técnico completo con el código real disponible. Estimado: 45-60 min sesión siguiente.  
**agent_events ref:** 2026-06-14T21:30:00Z (cpanel_api_readonly_discovery_completed)

---
**Sesión 008b** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** close / role-verify / sync  
**Tarea:** Cerrar ventana admin de Sesión 008. Verificar que `catenaccio-studio-agent` volvió a `shop_manager`. Pushear commit documental de Sesión 008. Añadir SERVER_FILESYSTEM_READONLY_DISCOVERY al backlog como prerequisito de A0_MIGRATION_PLAN.

**Decisiones clave:**
- `catenaccio-studio-agent` verificado como `shop_manager` via `GET /wp/v2/users/me?context=edit` → roles: `["shop_manager"]`. Ventana admin cerrada correctamente.
- La migración real no puede planificarse sin conocer la estructura del servidor: child theme existente, archivos Elementor override, plugins custom. Se añade SERVER_FILESYSTEM_READONLY_DISCOVERY como prerequisito antes de A0_MIGRATION_PLAN.
- CARRITO_MICUENTA_QUICKWIN no requiere agente — Pablo puede hacerlo directamente en WP Admin (10 min).
- Commit de Sesión 008 pusheado a origin/main.

**Qué se validó:** rol `shop_manager` confirmado por API GET. `.env.local` confirmado ignorado (`.gitignore:6`). Commit `97d470c` de Sesión 008 pusheado. BACKLOG.md con SERVER_FILESYSTEM_READONLY_DISCOVERY añadido como prerequisito. CONTEXTO.md siguiente paso actualizado. HISTORIAL_SESIONES.md esta entrada. agent_events.jsonl con evento.  
**Qué NO se tocó:** WordPress, configuración, roles, templates, páginas, producción. No se modificó ningún documento de Sesión 008. Ningún write al sitio.  
**Siguiente paso:** Sesión 009 — SERVER_FILESYSTEM_READONLY_DISCOVERY: mapear child theme, plugins custom, archivos override del servidor (vía cPanel File Manager read-only o FTP readonly). Luego A0_MIGRATION_PLAN con contexto real.  
**agent_events ref:** 2026-06-13T23:00:00Z (admin_window_closed_role_verified)
---
