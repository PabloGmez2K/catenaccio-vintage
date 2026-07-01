# SESSION_LEARNING_TRANSFER_QUEUE — Catenaccio Vintage

Cola local de transferencias candidatas. Cada entrada representa un aprendizaje de sesión
que puede importarse a `lafabrica-template` y/o `pablo-operating-brain`.

**Regla:** este archivo es una cola, no un log. Las entradas importadas se marcan como
`IMPORTED_TO_LAFABRICA` o `IMPORTED_TO_BRAIN` — no se borran.

**Privacidad:** nada de lo aquí descrito debe contener datos privados (credenciales, clientes,
precios, pedidos, proveedores sensibles). Solo señales saneadas. Ver `DATA_AND_PRIVACY_BOUNDARIES.md`.

**Flujo:**
1. El agente genera `SESSION_LEARNING_TRANSFER` en el cierre de sesión.
2. Si el aprendizaje merece persistencia, se añade aquí como entrada `CANDIDATE`.
3. Pablo (o el orquestador) revisa y aprueba la importación.
4. El Brain (o lafabrica) absorbe cuando Pablo lo pida con `DIRECT_BRAIN_WRITE_ALLOWED`.
5. La entrada cambia estado a `IMPORTED_*` o `DISCARDED`.

---

## Formato de entrada

```
### SLT-XXX — Título breve

- Fecha: YYYY-MM-DD
- Proyecto: catenaccio-vintage
- Sesión/bloque: [Sesión N — nombre del bloque]
- project_value: [qué valor dejó en el proyecto — o "No aplica"]
- lafabrica: [patrón, workflow, guardrail, metodología transferible — o "No aplica"]
- brain:
  - evidence: [evidencia profesional saneada — o "No aplica"]
  - skills: [capacidad demostrada — o "No aplica"]
  - service_angle: [servicio que podría alimentar — o "No aplica"]
  - content_angle: [post, reflexión o narrativa pública — o "No aplica"]
  - portfolio_asset: [caso, prueba o activo de portfolio — o "No aplica"]
- future_product: [insight para producto futuro — o "No aplica"]
- no_copy: [qué NO transferir — categoría, nunca el dato privado]
- privacy_level: [PUBLIC_SAFE / INTERNAL_ONLY / PRIVATE_DO_NOT_EXPORT]
- Estado: CANDIDATE / IMPORTED_TO_LAFABRICA / IMPORTED_TO_BRAIN / DISCARDED / NEEDS_REVIEW
- Siguiente acción: [qué debe pasar para que avance]
```

---

<!-- ENTRADAS ABAJO — añadir nuevas al final, no editar anteriores -->

### SLT-001 — Patrón NO_SSH_SHADOW_RELEASE_FLOW

- Fecha: 2026-06-15
- Proyecto: catenaccio-vintage
- Sesión/bloque: Sesión 010C — NO_SSH_SHADOW_RELEASE_DECISION
- project_value: Flujo operativo para liberar cambios en WordPress sin SSH ni staging dedicado. Activo en sesiones 012-015.
- lafabrica: Patrón de shadow release con recurso sombra inactivo (tema/plugin paralelo), ventana temporal de acceso, validación visual antes de promoción y rollback manual definido. Candidato para proyectos WordPress en hosting compartido sin SSH.
- brain:
  - evidence: Diseño e implementación de un flujo de deployment seguro bajo restricciones de infraestructura reales (sin SSH, sin staging).
  - skills: Gestión de riesgo en deployments restringidos; diseño de flujos con blast radius mínimo en WordPress.
  - service_angle: Consultoría de operaciones WordPress en hosting compartido — mercado amplio de PYMEs con Raiola/SiteGround/Hostinger.
  - content_angle: "Cómo deployar en WordPress sin SSH y sin staging" — artículo técnico o hilo LinkedIn.
  - portfolio_asset: Caso de estudio de operaciones bajo restricciones reales; patrón documentado con flujo verificado.
- future_product: No aplica
- no_copy: Token cPanel API, credenciales de acceso, rutas de servidor, datos del hosting de Catenaccio.
- privacy_level: INTERNAL_ONLY
- Estado: CANDIDATE
- Siguiente acción: Validar el patrón con la migración A0 completa (Sesiones 014-RELEASE). Si RELEASE exitoso → promover a PUBLIC_SAFE y transferir a lafabrica.

---

### SLT-002 — Conector Google Search Console API read-only

- Fecha: 2026-06-14
- Proyecto: catenaccio-vintage
- Sesión/bloque: Sesión 009 — GSC_API_READONLY_CONNECTOR
- project_value: Connector operativo de Google Search Console en modo read-only. Scripts versionados, secretos ignorados, patrón documentado.
- lafabrica: Patrón reutilizable de integración OAuth Desktop + GSC API + .secrets/ ignorado + requirements separados. Candidato para cualquier proyecto que necesite datos SEO de Search Console.
- brain:
  - evidence: Integración real con Google Cloud + OAuth + GSC API sin comprometer seguridad del repo.
  - skills: Integración de APIs de Google con scope mínimo; gestión segura de secretos OAuth en repos.
  - service_angle: Auditorías SEO con datos reales de GSC para clientes sin acceso técnico directo.
  - content_angle: "Cómo integrar Google Search Console en un proyecto de código sin exponer credenciales" — tutorial técnico.
  - portfolio_asset: Script open-source reutilizable; caso de estudio de integración SEO data en proyecto e-commerce.
- future_product: Capa de observabilidad SEO para Cauvera o proyectos marketplace futuros.
- no_copy: Credenciales OAuth reales, token local, datos de búsqueda reales de catenacciovintage.com.
- privacy_level: INTERNAL_ONLY
- Estado: IMPORTED_TO_BOTH
- Traza Brain: 2026-06-20 → skills anotados en pablo-operating-brain EVID-003 (Sesión 5 Brain); 2026-06-29 → confirmado absorbido, status actualizado.
- Traza Lafabrica: 2026-06-29 → PATTERN-11 en ECOSYSTEM_LEARNING_PATTERNS.md (GSC_API_READONLY_CONNECTOR), promovido desde CANDIDATE-02 tras validación en Bijuymoda Suite S102.
- Siguiente acción: Ninguna.

---

### SLT-003 — cPanel UAPI como canal de discovery de filesystem sin SSH

- Fecha: 2026-06-14
- Proyecto: catenaccio-vintage
- Sesión/bloque: Sesión 010B — CPANEL_API_FILESYSTEM_READONLY_PROBE
- project_value: Canal de read-only filesystem descubierto y verificado para Catenaccio. Script reutilizable en `scripts/filesystem/cpanel_uapi_probe.py`.
- lafabrica: Patrón de discovery filesystem vía cPanel UAPI Fileman (list_files + get_file_content) para proyectos en hosting compartido sin SSH. Alternativa a WebDAV (bloqueado), FTP sin credenciales o acceso manual.
- brain:
  - evidence: Diagnosis y resolución de bloqueo de acceso a filesystem en hosting compartido usando API del panel de control.
  - skills: Discovery de infraestructura con APIs de panel de control (cPanel UAPI); trabajo con restricciones de hosting reales.
  - service_angle: Auditoría técnica de sitios WordPress en hosting compartido sin SSH.
  - content_angle: "Cómo leer el filesystem de tu hosting sin SSH usando cPanel API" — tutorial técnico práctico.
  - portfolio_asset: Script open-source de discovery filesystem; caso de estudio de superación de restricciones de infraestructura.
- future_product: No aplica
- no_copy: Token cPanel API real, credenciales del hosting, rutas internas del servidor, datos de Catenaccio.
- privacy_level: INTERNAL_ONLY
- Estado: CANDIDATE
- Siguiente acción: El patrón es candidato a lafabrica solo después de validar el shadow release completo (A0 RELEASE exitoso).

---

### SLT-004 — cPanel shadow sync write path quirks

- Fecha: 2026-06-27
- Proyecto: catenaccio-vintage
- Sesion/bloque: Sesion 014-sync — THEME_SHADOW_SYNC
- project_value: Tema sombra A0 sincronizado en servidor con verificacion hash local/remoto y sin tocar el tema activo.
- lafabrica: En cPanel Fileman, no asumir que todos los endpoints de escritura son equivalentes. `save_file_content` puede normalizar contenido PHP/HTML en read-back y `upload_files` puede no sobrescribir archivos existentes; para shadow sync archivo-a-archivo, validar endpoint con hash read-back y mantener allowlist de path antes de escribir.
- brain:
  - evidence: Sync real de tema WordPress en hosting compartido sin SSH, con recuperacion de un mismatch de hash sin rollback destructivo.
  - skills: Operacion segura de APIs de hosting, guardrails de filesystem, verificacion determinista por hash y manejo de fallos parciales.
  - service_angle: Servicio de migracion/estabilizacion WordPress en hosting compartido sin SSH.
  - content_angle: "Deploy seguro de un tema WordPress sin SSH: hashes, carpeta sombra y guardrails".
  - portfolio_asset: Caso de estudio de shadow release A0 con cPanel API y zero-write al tema activo.
- future_product: Checklist reusable para conectores de deploy en hosting compartido dentro de lafabrica/Cauvera.
- no_copy: Credenciales cPanel, valores de entorno, dominio/hosting especifico, rutas privadas locales.
- privacy_level: INTERNAL_ONLY
- Estado: IMPORTED_TO_BRAIN
- Traza Brain: 2026-06-29 → pablo-operating-brain EVID-003 ext. (shadow sync quirks + hash guardrail, INTERNAL_ONLY). Lafabrica pendiente hasta THEME_SHADOW_VISUAL_VALIDATION.
- Siguiente accion: Revisar tras THEME_SHADOW_VISUAL_VALIDATION para promover CANDIDATE-01 en lafabrica a PATTERN estable si el release completo pasa.

---

### SLT-005 — DOMAIN_PRODUCT_MODELING_GATE desde S022A

- Fecha: 2026-06-28
- Proyecto: catenaccio-vintage
- Sesion/bloque: S022A - Studio create/edit product form
- project_value: Playbook ligero para modelar formularios/product UI antes de CODE cuando hay vocabulario ambiguo, labels visibles, valores internos, title labels y mapping Woo pendiente.
- lafabrica: Patron generalizable como `DOMAIN_PRODUCT_MODELING_GATE`, `STOP_MICROFIX_SPIRAL` y `FORM_READINESS_CHECKLIST` para evitar bucles de microfix en pantallas de producto/backoffice.
- brain:
  - evidence: Evidencia saneada de diseno de backoffice/PIM AI-first y modelado operativo de producto antes de implementacion.
  - skills: Traduccion de feedback de product owner a guardrails accionables; separacion entre dato interno, display, SEO/title y external mapping.
  - service_angle: Diseno de backoffices operativos para e-commerce con vocabulario de dominio complejo.
  - content_angle: "Antes de codear un formulario de producto: modela labels, valores internos y casos borde".
  - portfolio_asset: Caso documentado de Catenaccio Studio como PIM AI-first con gate de modelado de producto.
- future_product: Checklist reusable para cualquier vertical donde el operador valide formularios internos antes de publicar a un canal externo.
- no_copy: Datos comerciales reales, clientes, ventas, precios, proveedores, credenciales o detalles privados de inventario.
- privacy_level: INTERNAL_ONLY
- Estado: IMPORTED_TO_BRAIN
- Siguiente accion: Evaluar absorcion en lafabrica-template via LAFABRICA_DOMAIN_PRODUCT_MODELING_GATE_FROM_CATENACCIO_S022A si el patron se valida en otra pantalla Studio.
- Traza Brain: 2026-06-28 -> pablo-operating-brain EVID-003 + absorb log + POST_IDEAS + OFFER-12; recomendacion lafabrica registrada.
---

### SLT-006 - Woo/ACF integration gates from S022C

- Fecha: 2026-06-29
- Proyecto: catenaccio-vintage
- Sesion/bloque: S022C.9 - DOCUMENT_STUDIO_BUILD_SYSTEM_LESSONS_AND_OPUS_BRIEF
- project_value: Captura el cambio de metodo para Catenaccio Studio antes de S023: dejar de iterar por microparches y exigir diff de producto referencia, revision ACF, mapa de capas de datos y fixture completa antes de CODE.
- lafabrica: Patron reusable para integraciones WooCommerce/ACF: `PRODUCT_REFERENCE_DIFF_GATE`, `ACF_CONFIG_GATE`, `DATA_LAYER_MAPPING_GATE`, `FULL_FIXTURE_TEST_GATE`, `NO_MICROPATCH_LOOP_GATE`.
- brain:
  - evidence: Evidencia saneada de integracion real Studio -> WooCommerce con ACF Taxonomy, categorias, stock y DRAFT_ONLY.
  - skills: Diagnostico de sistemas e-commerce por capas; conversion de sesiones sucias en gates operativos reutilizables.
  - service_angle: Arquitectura y estabilizacion de backoffices PIM/Studio para WooCommerce con ACF.
  - content_angle: "Cuando WooCommerce no basta: como mapear root fields, ACF, taxonomias y term relationships antes de codear".
  - portfolio_asset: Caso Catenaccio Studio como puente PIM -> WooCommerce draft-only con gates de integracion.
- future_product: Checklist reusable para conectores de publicacion desde Studio/PIM hacia CMS/e-commerce legacy.
- no_copy: Credenciales, datos reales de inventario, clientes, pedidos, precios privados, URLs privadas de admin, secretos y detalles operativos sensibles.
- privacy_level: INTERNAL_ONLY
- Estado: IMPORTED_TO_BRAIN
- Traza Brain: 2026-06-29 → pablo-operating-brain EVID-003 ext. (Woo/ACF integration gates, INTERNAL_ONLY), POST_IDEAS, OFFER-12 refuerzo.
- Traza Lafabrica: CANDIDATE-03 en ECOSYSTEM_LEARNING_PATTERNS.md pendiente validacion en S023.
- Siguiente accion: Revisar tras S023; si los gates guian una sesion limpia, promover CANDIDATE-03 a PATTERN en lafabrica como guardrail de integraciones Woo/ACF.

---

### SLT-007 - Football knowledge graph + programmatic landings opportunity

- Fecha: 2026-06-30
- Proyecto: catenaccio-vintage
- Sesion/bloque: S023B.CLOSE - Manual validation close and future ideas
- project_value: Captura una oportunidad estrategica futura conectada con el vocabulario vivo de taxonomias: explorador Liga -> Equipo -> Temporada -> Jugadores y agente de analisis de valor/rareza para catalogo Catenaccio.
- lafabrica: Patron candidato para convertir caches operativas de dominio en superficies exploratorias y landings programaticas orientadas a SEO/AI search.
- brain:
  - evidence: Validacion de que una cache de terminos puede ser base de conocimiento de catalogo, no solo infraestructura de formularios.
  - skills: Identificacion de producto futuro a partir de una validacion tecnica-operativa.
  - service_angle: Catalogos inteligentes y landings programaticas para ecommerce vertical.
  - content_angle: "De taxonomias internas a conocimiento publicable: como un PIM puede alimentar SEO y asistentes IA".
  - portfolio_asset: Futuro caso Catenaccio Studio como catalogo inteligente para camisetas vintage.
- future_product: Modulo reusable de knowledge graph ligero para verticales con taxonomias ricas, conectado a landings y agentes de analisis.
- no_copy: Inventario real, estrategia comercial privada, oportunidades de compra/venta concretas, precios privados, datos de clientes, credenciales.
- privacy_level: INTERNAL_ONLY
- Estado: CANDIDATE
- Siguiente accion: Reabrir en S028 LANDING_ARCHITECTURE; no implementar ni mezclar con S023C.

---

### SLT-008 - Studio internal catalog intelligence and prompt tools

- Fecha: 2026-06-30
- Proyecto: catenaccio-vintage
- Sesion/bloque: S023C.CLOSE - Manual validation close and future taxonomy ideas
- project_value: Captura que Studio puede evolucionar desde term creation operativa hacia herramientas internas de inteligencia de catalogo: sugerencias contextuales, universe manager y generacion de prompts sin integrar API IA al principio.
- lafabrica: Patron candidato para backoffices AI-first: antes de integrar IA por API, exponer herramientas NO-API que convierten datos reales del dominio en prompts accionables para agentes externos.
- brain:
  - evidence: Validacion de un flujo controlado de taxonomias que abre camino a inteligencia de catalogo sin aumentar riesgo operativo inmediato.
  - skills: Separacion entre operacion critica inmediata y oportunidades futuras de producto/IA.
  - service_angle: Herramientas internas de catalog intelligence y prompt workflows para ecommerce vertical.
  - content_angle: "Antes de automatizar con IA: crea herramientas que conviertan tu catalogo en buenos prompts".
  - portfolio_asset: Futuro caso Catenaccio Studio como PIM con capa de inteligencia interna progresiva.
- future_product: Modulo reusable de prompt generation tools y taxonomy universe manager para verticales con taxonomias ricas.
- no_copy: Datos reales de inventario, oportunidades comerciales concretas, precios privados, clientes, credenciales, URLs privadas de admin.
- privacy_level: INTERNAL_ONLY
- Estado: CANDIDATE
- Siguiente accion: Reabrir tras S023D/S023E o en S028 LANDING_ARCHITECTURE; no implementar en el flujo critico actual.

---

### SLT-009 — Media pipeline + "visual UX no esta hecho hasta que el operador lo siente"

- Fecha: 2026-07-01
- Proyecto: catenaccio-vintage
- Sesion/bloque: S025/S026 Studio MVP (backoffice v0 -> S026A imagenes local->Storage -> S026B attach a borrador Woo -> day-close review)
- project_value: Cadena de imagenes de Studio completa y validada: subida Browser->Supabase Storage (esquiva el limite de 1 MB de Server Actions sin ampliar `bodySizeLimit`), optimizacion WebP client-side, drag&drop, autosave/status, principal=primera, y attach al borrador Woo en el create via `images:[{src,position}]` bajo flag SHADOW_FIRST (default OFF). Ademas, criterio de cierre mas estricto para capacidades visuales.
- lafabrica:
  - `MEDIA_UPLOAD_BROWSER_TO_STORAGE`: para flujos de subida de archivos en Next.js, subir directo del navegador al object storage y dejar la Server Action solo para registrar metadata; no ampliar el body-size limit de Server Actions para meter binarios grandes.
  - `VISUAL_UX_DONE_GATE`: build/lint/typecheck PASS no cierra una capacidad con interfaz visible; exigir prueba manual del operador (`*_VISUAL_OK`), loading state para toda accion >1-2 s, y revision de microcopy cada vez que cambia el comportamiento funcional. Tratar la friccion de flujo que reporta el operador como senal de producto, no como polish opcional; no aceptar como deuda una pieza que es parte del flujo minimo util.
  - `SHADOW_FIRST_EXTERNAL_ATTACH`: integrar escritura hacia un canal externo vivo tras flag por defecto OFF, con mapeo best-effort que nunca revierte el recurso ya creado; mismo patron que un feature flag de IA en shadow.
  - `AGENT_ROLE_SPLIT_WITH_VISUAL_SURFACE`: Sonnet=patch quirurgico, Opus=decisiones de backlog/arquitectura, Codex=cierres/validaciones deterministas, Antigravity=inspeccion visual/UX (formularios/backoffice, mobile/desktop, copy viejo, loading states, modales nativos, selects, revision pre-deploy como usuario). Antigravity no para patches quirurgicos ni docs-only.
- brain:
  - evidence: Diseno de un pipeline de media (browser->storage->canal e-commerce) con guardrails de propiedad/RLS y flag de shadow; y endurecimiento del criterio de "hecho" para features visuales tras friccion real del operador.
  - skills: Arquitectura de subida de archivos evitando cuellos de framework; feature flags SHADOW_FIRST hacia canales externos; traduccion de friccion de UX del owner en gates de cierre reutilizables; asignacion de agentes por tipo de tarea incluyendo una surface de validacion visual.
  - service_angle: Backoffices/PIM con pipeline de imagenes y publicacion asistida a e-commerce; QA de UX asistida por agente antes de deploy.
  - content_angle: "Por que tu Server Action se rompe en 1 MB (y por que la solucion no es subir el limite)"; "Build en verde no es UX en verde: cerrar features visuales con el usuario, no con el linter".
  - portfolio_asset: Caso Catenaccio Studio: pipeline de fotos de producto de local a borrador WooCommerce con optimizacion client-side y shadow-first attach.
- future_product: Modulo reusable de media pipeline (upload directo + optimizacion + attach a canal) y checklist `VISUAL_UX_DONE_GATE` para cualquier vertical con backoffice visual.
- no_copy: Imagenes/fotos reales de inventario, credenciales Supabase/Woo, URLs privadas de Storage/admin, precios, clientes, datos de camisetas concretas.
- privacy_level: INTERNAL_ONLY
- Estado: CANDIDATE
- Siguiente accion: Validar `MEDIA_UPLOAD_BROWSER_TO_STORAGE` y `VISUAL_UX_DONE_GATE` en un segundo flujo visual (deploy de Studio o segunda pantalla). Si se repiten, promover a PATTERN en lafabrica y anotar skills en el Brain con `DIRECT_BRAIN_WRITE_ALLOWED`.
