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
- Estado: CANDIDATE
- Siguiente acción: Validar en un segundo proyecto (Bijuymoda Suite o similar) → si funciona → promover a lafabrica como patrón estándar. Ver BACKLOG LATER: LAFABRICA_TRANSFER_GSC_CONNECTOR_PATTERN.

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
- Estado: CANDIDATE
- Siguiente accion: Revisar tras THEME_SHADOW_VISUAL_VALIDATION; si el release completo pasa, promover a patron operacional reusable.

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
