# STUDIO_AI_FIRST_OPERATING_SYSTEM_MODEL

Qué significa que Catenaccio Studio sea AI-first, por qué no es "otro Excel", y cómo este modelo es el prototipo de un sistema operativo reutilizable para negocios con stock.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-27  
**Sesión:** 019 — STUDIO_DATA_MODEL  
**Estado:** DEFINIDO  
**Depende de:** `STUDIO_DATA_MODEL.md`, `STOCK_OPERATIONS_MODEL.md`, `CATENACCIO_STUDIO_TARGET.md`

---

## 1. Qué significa AI-first aquí

"AI-first" no es un buzzword. En Catenaccio Studio significa tres cosas concretas:

**1. Los agentes son actores del sistema, no herramientas externas.**  
Claude no es un chatbot al que se le pregunta. Es un actor que recibe estado estructurado del sistema y devuelve datos que el sistema ingiere, versiona y traza. La IA genera un `ai_suggestion`, el sistema la registra, Pablo la revisa. El agente no es el paso final; Pablo lo es.

**2. El sistema está diseñado para que los agentes sepan qué hacer con cada ítem en cualquier momento.**  
El campo `status` + `photo_status` + `ai_suggestion_status` + `wc_status` forman un estado completo y no ambiguo de cada camiseta. Un agente puede leer esos campos y saber exactamente qué acción puede ofrecer: "faltan fotos", "puede sugerir descripción", "hay un error de sync que puedo diagnosticar", "está lista para publicar en Vinted".

**3. Trazabilidad como ciudadano de primera clase.**  
Cada acción relevante se registra en `item_lifecycle_events` con `triggered_by` (pablo / agente / sistema). Esto permite auditar qué hizo el agente, detectar patrones (¿cuántas veces rechaza Pablo una sugerencia de precio?), y mejorar los prompts con datos reales.

---

## 2. Por qué no es "otro Excel"

El Excel de Pablo (`STOCK.xlsx`) es un estado estático: columnas de texto libre, estados implícitos, sin historial, sin asistencia, sin conexión con la tienda.

Catenaccio Studio cambia eso en 6 dimensiones:

| Dimensión | Excel | Studio (AI-first) |
|-----------|-------|-------------------|
| **Estado** | Campo de texto libre ("falta web") | Enum tipado con 12 transiciones validadas |
| **Historial** | No existe | `item_lifecycle_events` — inmutable, completo |
| **Asistencia** | Pablo escribe todo | Claude propone título, descripción, precio; Pablo aprueba |
| **Conexión** | Desconectado de la tienda | Puente WC REST API (DEC-9): Studio → WC draft en 1 clic |
| **Margen** | Pablo lo calcula a mano | Calculado automáticamente (vista Postgres) |
| **Búsqueda/filtro** | Solo Excel | Tabla filtrable por estado, equipo, liga, temporada, precio |

---

## 3. Qué decisiones puede ayudar a tomar la IA

La IA no toma decisiones por Pablo. Le da contexto y propuestas para que Pablo decida **más rápido y con más información**.

### 3.1 Precio de mercado

**Qué hace la IA:** Claude recibe los atributos de la camiseta (equipo, temporada, condición, talla, marca) y propone un precio basado en su conocimiento del mercado vintage de fútbol. Incluye razonamiento (`notas_tasacion`): "Esta versión away del Barça 94-95 en XXL es escasa en Mint, el mercado la mueve entre 180 y 250 €."

**Qué guarda el sistema:** `ai_suggestions.precio_sugerido` + `notas_tasacion`. Pablo ve el precio sugerido junto a su `precio_objetivo` y decide.

**Por qué importa:** Pablo declara en Sesión 005b que investigar el precio es parte de los ~45 minutos por camiseta. Claude comprime eso a < 1 minuto de lectura.

### 3.2 Título SEO

**Qué hace la IA:** Genera el título en inglés en formato estandarizado: "YYYY-YY Club Home/Away Shirt (Talla)". Consistencia de naming que mejora el SEO sin que Pablo tenga que pensar el formato cada vez.

**Campo:** `ai_suggestions.titulo_seo`.

### 3.3 Descripción larga

**Qué hace la IA:** Genera la descripción completa en español para WooCommerce: historia de la temporada, hitos del equipo, contexto de la camiseta, estado de conservación. Lista para copiar al borrador de WC.

**Campo:** `ai_suggestions.descripcion_larga`.

### 3.4 Diagnóstico de errores de sync WC

**Qué puede hacer la IA (futuro, post-S020):** Si `wc_status = 'error_sync'` y `wc_error` tiene un mensaje, un agente puede leerlo y diagnosticar: "El campo `equipo` tiene un term ID que no existe en pa_equipo — necesitas actualizarlo con `GET /wc/v3/products/attributes/4/terms`."

### 3.5 Alertas de pipeline

**Qué puede hacer la IA:** Listar ítems que llevan más de X días en `pendiente_fotos`, ítems en `publicada_web` sin estar en `publicada_vinted` con más de Y días, ítems con `margen_esperado < 30%`, etc. El sistema tiene todos los datos; la IA los interpreta y prioriza para Pablo.

---

## 4. Qué datos necesita la IA

Para cada llamada a Claude en el flujo de sugerencia:

```json
{
  "referencia": "Real Madrid Home 2001-02",
  "equipo_display": "Real Madrid",
  "temporada_display": "2001-02",
  "liga_display": "Champions League / LaLiga",
  "talla": "L",
  "marca_display": "Adidas",
  "condicion": "Excelente",
  "tiene_etiquetas": false,
  "tiene_parches": true,
  "parches_descripcion": "Parche UEFA Champions League",
  "numero_dorsal": "7",
  "nombre_dorsal": "RAUL",
  "condicion_notas": "Pequeña mancha interior en el cuello, no visible al llevarla",
  "autenticidad": "Jugador edition, no réplica",
  "coste": 45.00,
  "precio_objetivo": 180.00
}
```

Esto viene de `inventory_items` + `football_shirt_details`. El sistema ya tiene todos estos datos antes de llamar a Claude. El agente no necesita pedirle nada más a Pablo.

---

## 5. Eventos y trazabilidad

`item_lifecycle_events` es la memoria del sistema. Un agente que arranca en una nueva sesión puede leer el timeline de una camiseta y entender exactamente qué pasó:

```
2026-07-15 10:23 [pablo]  status_change: comprada → pendiente_fotos
2026-07-16 18:45 [pablo]  photo_update: hechas_local, carpeta="Real Madrid 2001-02/L"
2026-07-17 11:02 [agente] ai_request: model=claude-sonnet-4-6, prompt_version=v1.0
2026-07-17 11:02 [sistema] status_change: pendiente_fotos → pendiente_descripcion
2026-07-17 11:05 [agente] ai_suggestion_generated: version=1, precio_sugerido=180
2026-07-17 14:30 [pablo]  ai_approved: version=1, review_notes="Precio OK, descripción corregida"
2026-07-17 14:31 [pablo]  status_change: pendiente_descripcion → borrador_web
2026-07-17 14:32 [agente] wc_sync_ok: wc_product_id=2091, payload_snapshot={...}
2026-07-17 14:35 [pablo]  status_change: borrador_web → pendiente_web
```

Esto permite:
- Auditoría completa sin revisar logs externos.
- Detección de patrones: "Pablo rechaza los precios sugeridos en el 40% de los casos — el prompt de tasación necesita ajuste."
- Reproducibilidad: `input_context` en `ai_suggestions` guarda exactamente qué se le dio al modelo.

---

## 6. Patrón reutilizable para lafabrica

Catenaccio Studio implementa el patrón **"AI-first Stock Operating System"** que lafabrica puede extraer y reutilizar para otros negocios con inventario físico.

### Invariantes del patrón (cambia el dominio, esto no cambia):

| Elemento | Invariante |
|----------|-----------|
| `workspaces` | Tenant / business unit |
| `inventory_items` | Core PIM + state machine |
| `item_lifecycle_events` | Immutable audit trail con triggered_by |
| `ai_suggestions` | Versionadas, revisables, trazadas |
| Pipeline de estados | Enum tipado, campo central |
| `owner_id` desde el día 1 | Multi-tenant preparado |
| RLS por owner | Sin acceso cruzado entre negocios |

### Qué cambia por dominio:

| Elemento | Catenaccio | Otro negocio (ej. librería) |
|----------|-----------|---------------------------|
| Extensión específica | `football_shirt_details` | `book_details` |
| Estados | 12 del pipeline de camisetas | Estados de un libro (recibido / catalogado / reservado / vendido) |
| Atributos | liga, equipo, temporada, talla | ISBN, autor, editorial, año, idioma |
| Canal externo | WooCommerce + Vinted | eBay + Wallapop |
| Contenido IA | título SEO EN + descripción ES + tasación | Sinopsis + precio de segunda mano |
| Taxonomías externas | pa_liga, pa_equipo (term IDs WC) | Categorías del canal externo |

### Cómo extraerlo a lafabrica:

En una fase post-tracción (Fase 3, cuando el patrón esté validado con ventas reales), el schema genérico (`workspaces` + `inventory_items` + `ai_suggestions` + `item_lifecycle_events` + `media_assets`) se extrae como **lafabrica Stock OS Template**. El siguiente proyecto de lafabrica que tenga inventario físico arranca con el template y añade su propia extensión específica.

---

## 7. Cómo Catenaccio se convierte en caso vendible a empresas

Cuando Pablo valide el sistema con ventas reales (gate: 5-10 camisetas publicadas por Studio en < 10 min/camiseta), el flujo documentado se convierte en evidencia vendible:

> "Construí un sistema operativo de inventario AI-first para negocio de camisetas vintage: PIM sobre Supabase, asistencia Claude para descripción/precio/título SEO, pipeline de estados, puente automático a WooCommerce. Tiempo por camiseta: de 45 min a < 10 min. Sistema genérico replicable para cualquier negocio con stock físico y canal de venta online."

Esto es evidencia concreta del PABLO_OPERATING_BRAIN: skill de arquitectura de sistemas AI-first para e-commerce de nicho, con stack moderno (Supabase + Next.js + Claude API) y resultado de negocio medible.

---

*Sesión 019 — 2026-06-27 — Claude Code (Sonnet). Modo LOCAL_SCHEMA_DESIGN_ONLY / NO_REMOTE_WRITE.*
