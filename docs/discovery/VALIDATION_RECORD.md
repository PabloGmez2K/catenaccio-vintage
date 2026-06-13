# VALIDATION_RECORD — Catenaccio Vintage

Registro append-only de todas las validaciones humanas realizadas durante el Discovery Intake.

**Este registro no se edita hacia atrás.** Si una validación anterior se revisa, se añade una nueva entrada.

**Proyecto:** Catenaccio Vintage  
**Última actualización:** 2026-06-06

---

## Estados del workflow de discovery

| Estado | Descripción |
|--------|-------------|
| `DISCOVERY_ABIERTO` | El intake ha comenzado pero AS-IS no está validado |
| `AS_IS_VALIDADO` | La persona usuaria aprobó el AS-IS |
| `TARGET_APROBADO` | La persona usuaria aprobó una opción TARGET |
| `SEED_GENERADO` | El PROJECT_SEED fue generado |
| `SEED_APROBADO` | El SEED fue revisado y aprobado para implementación |
| `DISCOVERY_CERRADO` | `lafabrica new` ejecutado; el discovery está completo |

**Estado actual del workflow:** TARGET_APROBADO

---

## Registro de validaciones

### VAL-001 — Discovery inicial read-only ejecutado sobre carpeta legacy

**Fecha:** 2026-06-06  
**Fase del discovery:** AS-IS (construcción del borrador)  
**Qué se validó:** Inventario completo de la carpeta legacy `C:\Users\USUARIO\Catenaccio Vintage` realizado en modo read-only. Lectura del documento CONTEXTO_PROYECTO_CATENACCIO.md y listado de estructura de directorios y subfuentes. Primer borrador de AS-IS generado.  
**Documento validado:** `AS_IS_UNDERSTANDING.md` — estado: BORRADOR  
**Fuente principal:** SRC-01 (carpeta legacy), SRC-02 (CONTEXTO_PROYECTO_CATENACCIO.md)

**Resultado:** PENDIENTE DE VALIDACIÓN HUMANA

**Notas del agente:**
- La tienda es **LIVE** en catenacciovintage.com con pagos activos. No es un proyecto abandonado.
- Se detectó un archivo de credenciales sensibles: `Plugins/Nextend Social Login/usuario y clave secreta google.txt` — registrado como SRC-BLK-01. No fue abierto. Requiere atención.
- El CONTEXTO del proyecto (SRC-02) tiene fecha 15/03/2026; hay actividad hasta al menos 19/04/2026 (STOCK.xlsx). Los últimos ~6 semanas no están documentados.
- AS-IS en estado BORRADOR — pendiente de revisión y aprobación por la persona usuaria antes de avanzar a TARGET_OPTIONS.
- No se aprueba ninguna opción TARGET en este punto.
- No se copió ningún archivo bruto al repo.

**Cambios tras la validación:** pendiente — la persona usuaria debe revisar `AS_IS_UNDERSTANDING.md` y cambiar el estado a `VALIDADO_POR_USUARIO` cuando esté de acuerdo.

**Estado del workflow tras esta validación:** DISCOVERY_ABIERTO (sin cambio — requiere validación humana para avanzar)

---

### VAL-002 — Revisión de seguridad pre-target ejecutada

**Fecha:** 2026-06-06  
**Fase del discovery:** Pre-target (SECURITY_CHECK)  
**Qué se validó:** Análisis de los dos riesgos de seguridad detectados durante VAL-001. Creación de `SECURITY_REVIEW.md` con plan de acción manual para la persona usuaria.  
**Documento generado:** `docs/discovery/SECURITY_REVIEW.md` — estado: PENDIENTE DE ACCIÓN  
**Fuentes consultadas:** SOURCE_REGISTRY.md (SRC-BLK-01), AS_IS_UNDERSTANDING.md (PROB-01, PROB-02)

**Resultado:** PENDIENTE DE RESOLUCIÓN HUMANA — acciones requeridas fuera del repo

**Riesgos documentados:**
- SEC-001: Credenciales OAuth Google (Nextend Social Login) en archivo de texto plano. Acción: revocar en Google Cloud Console.
- SEC-002: WP secret keys posiblemente expuestas en chat de sesión el 15/03/2026. Acción: generar nuevas claves y actualizar wp-config.php en servidor.

**Notas del agente:**
- Ningún secreto ni credencial fue abierto, leído ni copiado al repo durante esta revisión.
- El conocimiento de los riesgos proviene de nombres de archivo y referencias textuales del CONTEXTO, no de la lectura de los archivos de credenciales.
- El discovery NO debe avanzar a TARGET_OPTIONS hasta que la persona usuaria confirme haber resuelto SEC-001 y SEC-002, o haber evaluado conscientemente el riesgo residual.

**Estado del workflow tras esta validación:** DISCOVERY_ABIERTO — riesgos de seguridad documentados, pendientes de resolución antes de avanzar

---

### VAL-003 — Resolución manual de SEC-001 y SEC-002 confirmada por operador

**Fecha:** 2026-06-06  
**Fase del discovery:** Pre-target (SECURITY_CHECK — cierre)  
**Qué se validó:** Confirmación manual del operador de que SEC-001 y SEC-002 han sido resueltos fuera del repositorio, sin copiar secretos al chat ni al repo.  
**Documentos actualizados:** `docs/discovery/SECURITY_REVIEW.md` (SEC-001 y SEC-002 → RESUELTO), `docs/discovery/AS_IS_UNDERSTANDING.md` (PROB-01, PROB-02 actualizados), `BACKLOG.md` (bloqueante SEC eliminado)

**Resultado:** RESUELTO — confirmación humana directa

**Confirmación del operador:**
- SEC-001: Google OAuth / Nextend Social Login fue rotado. El login con Google funciona. El secret antiguo fue retirado o queda fuera de uso. No se copiaron secretos al chat ni al repo.
- SEC-002: Las WP secret keys de wp-config.php fueron rotadas manualmente en el servidor. WordPress sigue funcionando. El operador puede iniciar sesión. No se copiaron claves al chat ni al repo.

**Notas del agente:**
- Ningún secreto ni credencial fue solicitado, leído ni copiado durante esta sesión.
- La confirmación es de responsabilidad del operador — el agente no verificó la rotación técnicamente ni accedió al servidor ni a Google Cloud Console.
- La dependencia de seguridad que bloqueaba el avance a TARGET_OPTIONS queda eliminada.

**Estado del workflow tras esta validación:** DISCOVERY_ABIERTO — bloqueos de seguridad resueltos; AS-IS pendiente de validación humana completa antes de TARGET_OPTIONS

---

### VAL-004 — AS-IS validado por el operador: suficientemente correcto para abrir TARGET_OPTIONS

**Fecha:** 2026-06-10  
**Fase del discovery:** AS-IS (validación humana final)  
**Qué se validó:** El operador (Pablo) confirma que `AS_IS_UNDERSTANDING.md` es suficientemente correcto para avanzar a TARGET_OPTIONS. Las incógnitas residuales (contenido de backlog_catenaccio_v6.xlsx, estado real del buscador AJAX, presencia exacta en Vinted) no bloquean la decisión de arquitectura.  
**Documento validado:** `docs/discovery/AS_IS_UNDERSTANDING.md` — estado cambiado de `BORRADOR` a `VALIDADO_POR_USUARIO`  
**Fuentes cubiertas al momento de validación:** SRC-01, SRC-02, SRC-03, SRC-04, SRC-05, SRC-06 + SERVER_CONTEXT_CHECK (2026-06-10)

**Resultado:** VALIDADO — confirmación humana directa del operador

**Confirmación del operador:**
- "Valido AS_IS_UNDERSTANDING.md como suficientemente correcto para avanzar a TARGET_OPTIONS."
- "No necesito más discovery antes de abrir TARGET_OPTIONS. Las incógnitas residuales no bloquean la decisión."

**Notas del agente:**
- El AS-IS cubre 15 problemas documentados (PROB-01 a PROB-15), 5 hipótesis con estado de validación, hechos confirmados del stack técnico completo y procesos actuales del operador.
- Los dos bloqueantes de seguridad (SEC-001, SEC-002) fueron resueltos antes de esta validación (VAL-003).
- El SERVER_CONTEXT_CHECK_READONLY fue completado antes de esta validación (Sesión 003, 2026-06-10).
- El driver central de TARGET_OPTIONS queda establecido: Elementor Pro expira ~2026-07-01, operador no renueva.

**Estado del workflow tras esta validación:** AS_IS_VALIDADO — habilitado para preparar TARGET_OPTIONS

---

### VAL-005 — TARGET_OPTIONS aprobado por el operador: A0 + B1

**Fecha:** 2026-06-13  
**Fase del discovery:** TARGET (aprobación formal)  
**Qué se validó:** El operador (Pablo) aprueba explícitamente la estrategia A0 + B1 para Catenaccio Vintage. Marketplace queda como NORTH_STAR / DEFER.  
**Documento validado:** `docs/discovery/TARGET_OPTIONS.md` — estado cambiado de `EN_REVISIÓN` a `OPCIÓN_APROBADA`

**Resultado:** APROBADO — confirmación literal del operador

**Confirmación del operador:**
- "APPROVE A0 + B1. Marketplace queda como NORTH_STAR / DEFER."

**Decisión aprobada:**
- **A0:** estabilizar WordPress/WooCommerce antes del 2026-07-01. Quitar dependencia crítica de Elementor Pro. Resolver performance mínima. Sin tocar pagos, pedidos, SEO ni productos.
- **B1:** construir Catenaccio Studio — app interna Next.js para subida controlada de productos via WooCommerce REST API, asistida por Claude.
- **Marketplace:** visión a largo plazo (NORTH_STAR). No construir multi-vendor hasta cumplir los gates documentados en TARGET_OPTIONS.md §11.

**Notas del agente:**
- La aprobación fue explícita y literal. Se registra sin interpretación.
- El workflow avanza de `AS_IS_VALIDADO` a `TARGET_APROBADO`.
- Siguiente paso: generar `RECOMMENDED_IMPLEMENTATION_PLAN.md` para A0 y `PROJECT_SEED.md` para B1.

**Estado del workflow tras esta validación:** TARGET_APROBADO — implementación desbloqueada

---

## Checklist de cierre del discovery

El discovery puede cerrarse cuando todos los ítems siguientes están marcados:

- [ ] `LAFABRICA_INTAKE_MANIFEST.md`: todas las preguntas del discovery tienen respuesta documentada.
- [ ] `SOURCE_REGISTRY.md`: todas las fuentes relevantes tienen estado `PROCESADA` o `VALIDADA` (no quedan en `EN_LECTURA`).
- [ ] `CONFLICT_REGISTER.md`: no hay conflictos en estado `DETECTADO` o `EN_REVISIÓN` con impacto CRÍTICO o ALTO.
- [x] `AS_IS_UNDERSTANDING.md`: estado `VALIDADO_POR_USUARIO`. *(2026-06-10, VAL-004)*
- [x] `TARGET_OPTIONS.md`: estado `OPCIÓN_APROBADA`. *(2026-06-13, VAL-005)*
- [ ] `RECOMMENDED_IMPLEMENTATION_PLAN.md`: estado `APROBADO_PARA_IMPLEMENTACIÓN`.
- [ ] `PROJECT_SEED.md`: generado y aprobado.
- [x] `VALIDATION_RECORD.md`: al menos una entrada VAL para AS-IS y una para TARGET. *(VAL-004 AS-IS + VAL-005 TARGET)*
- [ ] Estado del workflow: `SEED_APROBADO`.

**Fecha de cierre del discovery:** pendiente  
**Comando ejecutado:** pendiente
