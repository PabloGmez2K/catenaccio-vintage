# CONFLICT_REGISTER — Catenaccio Vintage

Registro de contradicciones detectadas entre fuentes durante el Discovery Intake.

**Proyecto:** Catenaccio Vintage  
**Última actualización:** 2026-06-06

---

## Estados de conflicto

| Estado | Significado |
|--------|-------------|
| `DETECTADO` | Contradicción identificada, sin resolución todavía |
| `EN_REVISIÓN` | La persona usuaria está revisando el conflicto |
| `RESUELTO` | El conflicto tiene una resolución validada |
| `ACEPTADO_COMO_INCÓGNITA` | No se puede resolver con la información disponible; se documenta como incógnita del AS-IS |
| `DESCARTADO` | El conflicto no era real; ambas fuentes son compatibles en contexto |

## Niveles de impacto

| Nivel | Descripción |
|-------|-------------|
| `CRÍTICO` | Bloquea la generación del SEED; requiere resolución antes de avanzar |
| `ALTO` | Afecta decisiones de diseño TARGET; debe resolverse antes de aprobar TARGET |
| `MEDIO` | Afecta la comprensión del AS-IS pero no bloquea el diseño |
| `BAJO` | Detalle menor que no afecta las decisiones principales |

---

## Registro de conflictos

### CONF-001 — Archivos referenciados en CONTEXTO no encontrados en la carpeta legacy

**Estado:** DETECTADO  
**Impacto:** BAJO  
**Detectado:** 2026-06-06  
**Resuelto:** pendiente

**Dato conflictivo:**  
El archivo `CONTEXTO_PROYECTO_CATENACCIO.md` (SRC-02), sección 19 "Archivos del Proyecto", declara que los siguientes archivos existen en la carpeta legacy:
`_htaccess.md`, `filtro-camisetas.md`, `catenaccio-offcanvas-menu.md`, `resumen-operativo-catenaccio.docx`, `PROMPT_AUDITORIA_WORDPRESS.md`, `PREFERENCIAS_TRABAJO_PABLO.md`, `css-carrito-v6-completo.css`, `snippet-carrito-v2.3.php`.

Al listar el contenido de la carpeta `. CORE`, ninguno de estos archivos está presente. Solo se encontraron: `backlog_catenaccio_v3-v6.xlsx`, `CONTEXTO_PROYECTO_CATENACCIO.md`, `CSS Adicional backup.md`, `css-adicional-catenaccio nuevo.md`, `css-carrito-v4-clean.css`, `functions.php`, `PROMPT_CONTINUAR_CARRITO.md`, `snippet-carrito-v2.3 dentro de functions del tema hijo.md`.

**Fuentes implicadas:**
- SRC-02 (CONTEXTO_PROYECTO_CATENACCIO.md sección 19): declara la existencia de los archivos.
- SRC-01 (listado real de la carpeta `. CORE`): los archivos no están presentes.

**Hipótesis de resolución:**
1. Los archivos nunca se guardaron en la carpeta local — se referenciaron en el CONTEXTO anticipando una organización que no llegó a materializarse.
2. Los archivos existieron y fueron eliminados o movidos.
3. Algunos archivos tienen nombres ligeramente distintos (`snippet-carrito-v2.3 dentro de functions del tema hijo.md` podría ser la versión de `snippet-carrito-v2.3.php`).

**Resolución:** pendiente — la persona usuaria debe confirmar si estos archivos existen en otra ubicación o fueron descartados.

**Impacto sobre el AS-IS:** bajo — el código real está en el servidor. La ausencia de estos archivos en local no impide el discovery, pero sí puede hacer falta recuperar el código del servidor para sesiones técnicas futuras.

---

## Nota: ausencia de conflictos inter-fuente en esta primera revisión

En esta primera sesión de discovery, SRC-02 (CONTEXTO_PROYECTO_CATENACCIO.md) es la única fuente documental detallada disponible. No es posible detectar contradicciones entre fuentes hasta que se lean fuentes adicionales (ej: estado real del servidor, backlog v6, STOCK.xlsx). CONF-001 es un conflicto interno entre lo que el CONTEXTO declara y lo que realmente existe en la carpeta legacy.

---

## Conflictos pendientes de resolución

| ID | Título | Impacto | Estado | Bloqueante para |
|----|--------|---------|--------|----------------|
| CONF-001 | Archivos referenciados en CONTEXTO no encontrados en carpeta legacy | BAJO | DETECTADO | AS-IS (incógnita aceptable) |

---

## Notas

- Un conflicto CRÍTICO sin resolución **bloquea** la validación del AS-IS.
- Un conflicto ALTO sin resolución **bloquea** la aprobación del TARGET.
- Los conflictos ACEPTADOS_COMO_INCÓGNITA deben quedar reflejados como incógnitas en `AS_IS_UNDERSTANDING.md`.
