# STOCK_OPERATIONS_MODEL — Catenaccio Vintage

Modelo operativo real del inventario de camisetas. Define el ciclo de vida de un producto, los estados posibles, los campos mínimos de Catenaccio Studio y las guías de migración desde el Excel actual y las imágenes locales.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-13  
**Sesión:** 006c (reorden: 006d)  
**Estado:** DEFINIDO — pendiente de implementación en Studio  
**Bloque de origen:** B1_STOCK_OPERATIONS_MODEL_CAPTURE  
**Prioridad:** B1 (Track 1) — **no bloquea A0 ni la activación del acceso API**  
**Agente:** Claude Code (Sonnet)

---

## 1. VEREDICTO

Catenaccio Studio **no es solo un formulario de publicación**. Es el sistema operativo del inventario de camisetas de Pablo:

- **PIM** (Product Information Manager) — fuente de verdad de cada camiseta: datos, fotos, atributos, precio.
- **Gestor de stock** — sabe qué hay en físico, qué está publicado, qué está vendido.
- **Gestor de estados operativos** — reemplaza el Excel manual con un pipeline de estados claro.
- **Asistente de publicación** — prepara borradores para web y orientación para Vinted con ayuda de Claude.
- **Base futura de marketplace** — el modelo de datos lo permite, pero no se construye todavía.

El Excel actual es la operativa real de Pablo. Studio debe absorberla sin rompimiento, no reemplazarla con algo más complejo.

---

## 2. CICLO DE VIDA DE UNA CAMISETA

Cada camiseta pasa por estos estados. El estado es un campo único en Studio — no una combinación de flags.

```
COMPRADA
    ↓
PENDIENTE_FOTOS       ← Pablo tiene la camiseta pero todavía no la ha fotografiado
    ↓
FOTOS_HECHAS          ← Fotos tomadas, carpeta local creada, no subidas aún
    ↓
PENDIENTE_DESCRIPCION ← Fotos ok, esperando que Claude genere descripción/precio
    ↓
BORRADOR_WEB          ← Borrador creado en WooCommerce vía API (draft en WC)
    ↓
PENDIENTE_WEB         ← Borrador revisado por Pablo, listo para publicar en web
    ↓
PUBLICADA_WEB         ← Live en catenacciovintage.com
    ↓
PENDIENTE_VINTED      ← Publicada en web, todavía no subida a Vinted
    ↓
PUBLICADA_VINTED      ← Live en ambos canales
    ↓
RESERVADA             ← Hay un comprador pero el pago/envío está en curso
    ↓
VENDIDA               ← Venta completada (web o Vinted)
    ↓
ARCHIVADA             ← Retirada del catálogo (no se vende, no está activa, referencia histórica)
```

### Estados en tabla

| Estado | Descripción operativa | Canal |
|--------|-----------------------|-------|
| `COMPRADA` | Camiseta adquirida. Datos mínimos: coste, proveedor, fecha. | — |
| `PENDIENTE_FOTOS` | Camiseta sin fotografiar. Solo datos básicos. | — |
| `FOTOS_HECHAS` | Fotos tomadas. Carpeta local registrada. Sin publicar. | Local |
| `PENDIENTE_DESCRIPCION` | Fotos listas. Claude no ha generado descripción/precio todavía. | — |
| `BORRADOR_WEB` | Borrador en WooCommerce (status: draft). Revisión pendiente de Pablo. | WC API |
| `PENDIENTE_WEB` | Borrador revisado y aprobado por Pablo. A punto de publicar. | WC |
| `PUBLICADA_WEB` | Producto live en catenacciovintage.com. | Web |
| `PENDIENTE_VINTED` | Publicada en web pero falta subir a Vinted manualmente. | — |
| `PUBLICADA_VINTED` | Live en Vinted. Ambos canales activos. | Vinted |
| `RESERVADA` | Con comprador confirmado. Fuera de venta activa. | — |
| `VENDIDA` | Venta completada. Canal registrado (web/Vinted/otro). | — |
| `ARCHIVADA` | Retirada permanente. No visible públicamente. Histórico. | — |

### Notas sobre los estados

- Una camiseta puede estar `PUBLICADA_WEB` sin estar en Vinted — ambos canales son independientes.
- El estado `PENDIENTE_VINTED` existe porque Vinted es manual (no hay API pública de publicación). Studio le recuerda a Pablo qué camisetas le faltan subir a Vinted.
- `RESERVADA` puede ocurrir en cualquier canal — el campo `canal_venta` registra en cuál.
- `ARCHIVADA` preserva el registro histórico (coste, precio, margen) sin interferir en el catálogo activo.
- En MVP, Studio no publica en Vinted automáticamente. Solo genera un recordatorio y, opcionalmente, prepara el texto de la descripción de Vinted.

---

## 3. CAMPOS MÍNIMOS DE CATENACCIO STUDIO

Campos agrupados por bloque funcional. Todos los campos son para uso interno de Studio — los que van a WooCommerce se mapean en la llamada API.

### 3.1 Identificación

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | UUID | Sí (auto) | ID interno de Studio. Distinto del ID de WooCommerce. |
| `referencia` | string | Sí | Nombre de uso interno. Ej: "Real Madrid Home 2001-02". Para búsqueda interna. |
| `owner_id` | string | Sí (auto) | Siempre Pablo en Fase 2. Preparado para multi-vendor en Fase 4. |

### 3.2 Compra y coste

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `fecha_compra` | date | Sí | Fecha de adquisición. |
| `proveedor` | string | No | A quién se compró (persona, plataforma, mercadillo). |
| `coste` | decimal | Sí | Precio de compra (€). |
| `notas_compra` | text | No | Contexto de la compra (ej: "lote de 3", "condición incierta"). |

### 3.3 Precio y margen

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `precio_objetivo` | decimal | No | Precio de venta que Pablo tiene en mente antes de investigar mercado. |
| `precio_publicado_web` | decimal | No | Precio live en catenacciovintage.com. Puede diferir del objetivo. |
| `precio_publicado_vinted` | decimal | No | Precio en Vinted (puede ser distinto por comisiones). |
| `precio_vendido` | decimal | No | Precio final de venta (post-descuentos si aplica). |
| `margen_esperado` | decimal | Auto | Calculado: `precio_objetivo - coste`. |
| `margen_real` | decimal | Auto | Calculado: `precio_vendido - coste`. Solo cuando `VENDIDA`. |

### 3.4 Atributos de la camiseta (taxonomías WooCommerce)

| Campo Studio | Taxonomía WC | Tipo | Requerido |
|-------------|-------------|------|-----------|
| `liga` | `pa_liga` | string | Sí |
| `equipo` | `pa_equipo` | string | Sí |
| `temporada` | `pa_ano` | string | Sí |
| `talla` | `pa_talla` | string | Sí |
| `marca` | `pa_marca` | string | Sí |
| `condicion` | `pa_condicion` | string | Sí |
| `jugador` | `pa_jugador` | string | No |

Valores posibles para `condicion`: Mint, Excelente, Muy buena, Buena, Aceptable. (Mapeados a los términos reales de `pa_condicion` en WooCommerce.)

### 3.5 Contenido generado por Claude

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `titulo_seo` | string | Sí (pre-publicar) | En inglés. Formato: "YYYY-YY Club Home/Away Shirt". Claude lo propone. |
| `descripcion_larga` | text | Sí (pre-publicar) | En español. Claude la genera. Pablo la revisa. |
| `precio_sugerido_claude` | decimal | No | Precio que Claude sugiere basado en mercado. Referencia para Pablo. |
| `notas_tasacion` | text | No | Razonamiento de Claude sobre el precio sugerido. |

### 3.6 Imágenes

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `carpeta_local` | string | No | Ruta local de la carpeta de fotos. Ej: `Stock/Original/Real Madrid 2001-02`. |
| `fotos_subidas` | array | No | Lista de IDs de imágenes en WooCommerce Media Library (post upload). |
| `foto_principal_id` | int | No | ID de la imagen principal en WC. |
| `estado_fotos` | enum | Sí | `sin_hacer`, `hechas_local`, `subidas_studio`, `asignadas_wc`. |

### 3.7 Estado operativo y publicación

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `estado` | enum | Sí | Ver §2. El campo central del pipeline. |
| `id_woocommerce` | int | No | ID del producto en WooCommerce (post-creación vía API). |
| `url_web` | string | Auto | URL pública en catenacciovintage.com (derivada del id_woocommerce). |
| `url_vinted` | string | No | URL del listing en Vinted. Manual. |
| `canal_venta` | enum | No | `web`, `vinted`, `otro`. Solo cuando `VENDIDA`. |
| `fecha_publicacion_web` | date | Auto | Fecha de cambio a `PUBLICADA_WEB`. |
| `fecha_publicacion_vinted` | date | No | Manual. Fecha de subida a Vinted. |
| `fecha_venta` | date | No | Fecha de venta confirmada. |

### 3.8 Ubicación física y logística

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `ubicacion_fisica` | string | No | Dónde está físicamente. Ej: "Caja azul 2ª estantería". Útil al escalar. |
| `notas_internas` | text | No | Cualquier anotación operativa libre. No se publica. |

---

## 4. RECOMENDACIÓN PARA IMÁGENES LOCALES

Pablo gestiona actualmente las fotos en carpetas locales organizadas por producto.

### Las tres opciones

| Opción | Descripción | Pro | Contra |
|--------|-------------|-----|--------|
| **A — Carpetas locales + ruta en Studio** | Studio registra la ruta local (`carpeta_local`). Las fotos no se mueven. | Sin fricción. Sin cambios de hábito. Cero coste. | Las fotos no son accesibles desde Studio si Pablo está en otro dispositivo. Los agentes remotos no pueden acceder a las fotos. |
| **B — Google Drive / Dropbox** | Las fotos se suben a la nube. Studio registra la URL de Drive/Dropbox. | Accesible desde cualquier dispositivo y desde agentes. Sin infraestructura propia. | Requiere cambiar el flujo de trabajo de fotos. Puede tener coste (espacio Drive). Las URLs de Drive no son directamente usables en WC. |
| **C — Upload directo a Studio** | Studio tiene un módulo de upload. Las fotos van directamente a WooCommerce Media Library vía `POST /wp-json/wp/v2/media`. | Flujo único. Las fotos quedan en WC listos para el producto. | Requiere buena conexión. Si Studio no está disponible, el flujo se rompe. Requiere desarrollo extra en el MVP. |

### Recomendación para MVP: Opción A con puerta a C

**Opción A como MVP** — registrar la ruta local en Studio sin mover las fotos. Pablo sigue trabajando como ahora. Studio lo sabe.

**Razón:** El MVP de Studio es un formulario + llamada a WC REST API. Añadir upload de imágenes en el MVP no es complejo técnicamente, pero la gestión de archivos locales vs. red añade fricción de desarrollo. Primero validar que el resto del flujo funciona.

**Cuando escalar a C:** en cuanto Studio esté en uso real y Pablo quiera publicar sin pasar por WP Admin. En ese momento, añadir el upload de imágenes a Studio usando `POST /wp-json/wp/v2/media` — la API WC ya lo soporta.

**No hacer B** todavía. Google Drive añade una dependencia externa y el paso de foto Drive → WC Media Library requiere código adicional que no aporta valor en el MVP.

### Campo recomendado en Studio (MVP)

```
carpeta_local: "Stock/Original/Real Madrid 2001-02"
estado_fotos: "hechas_local"   ← Pablo actualizó este campo
```

Cuando Studio tenga upload propio:
```
fotos_subidas: [4521, 4522, 4523]   ← IDs en WC Media Library
foto_principal_id: 4521
estado_fotos: "asignadas_wc"
```

---

## 5. MIGRACIÓN DESDE EL EXCEL ACTUAL

### Qué sabemos del Excel

- Nombre del archivo: `STOCK.xlsx` (última modificación conocida: 19/04/2026).
- Columnas inferidas del uso real: nombre/referencia, estado operativo (falta fotos / falta Vinted / falta web / vendida), comprada a (proveedor), precio (¿coste? ¿precio objetivo?).
- No se ha visto el Excel directamente — no asumir columnas exactas.

### Lo que NO se hace todavía

- **No importar el Excel ahora.** No hay Studio aún. No tiene sentido importar a una herramienta que no existe.
- **No diseñar la importación automática ahora.** Es prematuro hasta ver las columnas reales.

### Lo que sí se define ahora

#### Paso 1 — Entender las columnas reales

Antes de construir cualquier importador, Pablo necesita compartir las columnas reales de `STOCK.xlsx`. La pregunta clave:

> ¿Qué columnas tiene el Excel actual? ¿Qué significa cada estado que usas en él?

Con esa información, se puede construir la plantilla de migración compatible con Studio.

#### Paso 2 — Plantilla CSV futura compatible con Studio

Una vez conocidas las columnas del Excel, se preparará una plantilla CSV con las siguientes columnas mínimas (alineadas con los campos de Studio §3):

```
referencia, fecha_compra, proveedor, coste, precio_objetivo,
liga, equipo, temporada, talla, marca, condicion, jugador,
carpeta_local, estado, notas_internas
```

Esta plantilla permitirá a Pablo exportar desde Excel → importar en Studio sin introducir cada camiseta manualmente.

#### Paso 3 — Importador Studio (futura tarea)

Studio tendrá un flujo de importación CSV en una iteración posterior. No es MVP. El MVP asume entrada manual o un script puntual de migración.

### Recomendación práctica (ahora, sin Studio)

Pablo puede seguir usando el Excel hasta que Studio esté operativo. No hay necesidad de migrar antes. La transición natural es:

1. Studio arranca → Pablo introduce las nuevas camisetas directamente en Studio.
2. Las camisetas del Excel que todavía están activas (pendiente web / pendiente Vinted) se migran manualmente al arrancar Studio (son pocas en el MVP).
3. Las camisetas del Excel que ya están vendidas o archivadas pueden quedarse en el Excel como histórico o migrarse en un segundo paso.

---

## 6. QUÉ NO CONSTRUIR EN EL MVP DE STUDIO

Para que el MVP de Studio sea rápido de construir y fácil de validar, estos elementos quedan fuera deliberadamente:

| Feature | Por qué no ahora |
|---------|-----------------|
| Marketplace (multi-vendor) | Fase 4. Gates en TARGET_OPTIONS.md §11. |
| Multi-vendedor / multi-usuario | Solo Pablo en Fase 2. `owner_id` es suficiente. |
| Sincronización automática con Vinted | Vinted no tiene API pública de publicación. Manual por ahora. |
| Publicación automática sin revisión de Pablo | El modelo es DRAFT_ONLY. Pablo aprueba siempre. |
| Sistema de pagos propios | WooPayments en WC es la pasarela. Studio no toca pagos. |
| Gestión de pedidos / envíos en Studio | WooCommerce Admin para pedidos. Studio solo gestiona inventario. |
| Import automático de precios de mercado en tiempo real | Claude hace la tasación manualmente. No hay scraping automático. |
| App móvil | Web app (Next.js). Pablo trabaja desde ordenador en el MVP. |
| Sistema de notificaciones | No en MVP. |
| Integración con InPost / Envia.com | Logística en WC Admin. Studio no gestiona envíos. |

---

## 7. IMPLICACIONES DE DISEÑO PARA STUDIO

Decisiones de diseño que este modelo impone:

### Estado como campo central

El estado del producto (`estado`) es el campo más importante de Studio. La UI debe hacer el estado visible en la vista de lista (tabla de inventario) y fácil de cambiar. Un kanban por estado o una tabla filtrable por estado son las dos opciones de UI razonables.

### Vista de inventario

Studio debe tener una vista de tabla donde Pablo vea, de un vistazo:

```
Referencia | Estado | Fotos | Web | Vinted | Coste | Precio | Días en stock
```

Con filtros por estado. Esto es lo que reemplaza el Excel.

### Flujo principal de una camiseta nueva

```
1. Pablo crea ficha en Studio (referencia, compra, atributos)
2. Estado: COMPRADA → PENDIENTE_FOTOS
3. Pablo hace fotos → registra carpeta_local → Estado: FOTOS_HECHAS
4. En Studio: "Sugerir con Claude" → Claude propone precio + descripción + título
5. Estado: BORRADOR_WEB → Studio llama WC REST API → crea producto en draft
6. Pablo revisa en Studio o WP Admin → aprueba → Estado: PENDIENTE_WEB → PUBLICADA_WEB
7. Studio muestra alerta: "Esta camiseta falta en Vinted" (si aplica)
8. Pablo sube manualmente a Vinted → registra url_vinted en Studio → Estado: PUBLICADA_VINTED
9. Venta → Pablo marca como VENDIDA + canal + precio_vendido → Studio calcula margen_real
```

### Owner_id para el futuro marketplace

El campo `owner_id` se incluye desde el primer día aunque en MVP siempre sea Pablo. Esto evita una migración de datos costosa cuando llegue Fase 4. No implica ningún código adicional en MVP — solo almacenar el campo.

---

## 8. PRÓXIMOS PASOS PARA ESTE MODELO

| Tarea | Estado | Sesión esperada |
|-------|--------|-----------------|
| `EXCEL_STOCK_IMPORT_MAPPING` — Pablo comparte columnas del Excel actual | Pendiente de acción de Pablo | Antes de sesión de Studio |
| `LOCAL_IMAGE_FOLDER_WORKFLOW` — Confirmar ruta/estructura de carpetas locales | Pendiente | Sesión Studio MVP |
| `VINTED_PUBLICATION_TRACKING` — Diseñar el recordatorio de Vinted en Studio | Pendiente | Sesión Studio MVP |
| `STUDIO_PRODUCT_STATUS_PIPELINE` — Implementar la vista de tabla de inventario con estados | Pendiente | Sesión Studio MVP |
| `STUDIO_MVP_DESIGN` — Formulario completo Studio con campos de §3 | En BACKLOG NOW | Sesión 007 paralela a Track 0 |

---

## 9. RELACIÓN CON OTROS DOCUMENTOS

| Documento | Relación |
|-----------|---------|
| `docs/discovery/TARGET_OPTIONS.md` | Contexto estratégico completo. B1 = Catenaccio Studio. |
| `docs/operations/ACCESS_MODEL_NO_SSH.md` | Modelo de acceso WC API para Studio (Application Password, DRAFT_ONLY). |
| `BACKLOG.md` | Tareas derivadas de este modelo (ver §8). |
| `DECISIONS.md` | DEC-9 (acceso sin SSH). Ver también PEND-2 (marketplace North Star). |

---

*Versión 006c — 2026-06-13 — Claude Code Sonnet.*  
*Basado en: AS_IS_UNDERSTANDING.md (VALIDADO_POR_USUARIO, 2026-06-10), TARGET_OPTIONS.md (OPCIÓN_APROBADA, 2026-06-13), operativa real del operador declarada en sesión 006c.*
