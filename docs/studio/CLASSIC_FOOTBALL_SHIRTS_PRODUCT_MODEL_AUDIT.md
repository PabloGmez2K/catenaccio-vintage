# CLASSIC_FOOTBALL_SHIRTS_PRODUCT_MODEL_AUDIT

Fecha: 2026-06-28
Sesión: 022A.1B
Agente: Antigravity
Modo: READ_ONLY_COMPETITOR_PRODUCT_MODEL_AUDIT / NO_CODE / NO_REMOTE_WRITE
Veredicto: **ADJUST_S022A2_MODEL_FIRST**

---

## 1. Resumen ejecutivo

Tras analizar visual y funcionalmente el sitio de referencia de la industria, **Classic Football Shirts (CFS)**, y compararlo con el estado público y el probe de WooCommerce de **Catenaccio Vintage**, se concluye que el modelo de datos técnico implementado en S022A y proyectado en S022A.1 requiere ajustes conceptuales de dominio antes de programar la UI de S022A.2. 

El veredicto es **ADJUST_S022A2_MODEL_FIRST**. El campo propuesto anteriormente como `version_camisa` debe ser descartado en favor de un modelo de dominio en inglés y más granular. Proponemos separar el tipo de producto (`product_type`), la versión del kit (`shirt_version`), la manga (`sleeve_length`) y el tipo de autenticidad (`authenticity_type`) como columnas de base de datos independientes. Esto permitirá generar títulos SEO consistentes y limpios, estructurar correctamente los filtros del catálogo para el cliente final y optimizar el puente de publicación a WooCommerce (S022C).

---

## 2. Qué se auditó

Se auditaron las siguientes superficies públicas de **Classic Football Shirts (CFS)**:
- **Home y menú principal:** Categorías estructuradas por regiones ("UK Clubs", "European Clubs"), ligas principales ("Premier League", "La Liga", "Serie A") y secciones de catálogo ("New In", "Clearance", "Players", "Brands").
- **Filtros de listado (Sidebar):** Opciones de filtrado por Talla, Marca, Temporada, Equipo, Liga, Tipo de artículo (Shirt, Shorts, Training, etc.), Condición, Manga (Short/Long Sleeve), Jugador y Rango de precio.
- **URLs de listado y fichas:**
  - Estructura de liga: `/spanish-clubs/la-liga.html`
  - Estructura de producto: `/2019-20-manchester-city-home-shirt-sterling-7.html` (Slug plano con atributos clave incrustados).
- **Atributos visibles en 5 tipos de ficha de producto:**
  1. *Camiseta club clásica:* `2004-05 Real Madrid Home Shirt` (sin estampación, talla y estado indicados en selectores/fichas).
  2. *Camiseta selección nacional:* `2014-15 France Away Shirt` (sin liga asociada, categorizada en "International").
  3. *Camiseta con jugador y dorsal:* `2019-20 Manchester City Home Shirt Sterling #7` (patrón de título descriptivo plano).
  4. *Camiseta sin jugador / con dorsal:* `1991-93 Internacional Home Shirt #5` (solo número estampado).
  5. *Camiseta de entrenamiento/goalkeeper/especial:* `2006 England Match Worn World Cup Home L/S Shirt Beckham #7` y `2023-24 Wolves Match Issue Home Shirt Neto #7` (incluye manga y tipo de autenticidad premium en el título).

También se analizó el resultado del probe autenticado de Catenaccio Vintage (`API_READONLY_PROBE_RESULT.md`) y el plan de UX del formulario (`STUDIO_FORM_DOMAIN_UX_FIX_PLAN.md`).

---

## 3. Limitaciones de la auditoría

- **Backoffice inaccesible:** No es posible ver el panel de administración ni la estructura física de la base de datos de Classic Football Shirts. El modelo de datos se infiere exclusivamente a partir de la salida HTML pública, la API de búsqueda expuesta (Sobooster) y los metadatos estructurados visibles en el frontend.
- **Lectura estática:** Toda interacción con el competidor se realizó de manera anónima y de solo lectura. No se agregaron productos al carrito, no se realizaron flujos de checkout, ni se expusieron credenciales de ningún tipo.

---

## 4. Hallazgos Classic Football Shirts

1. **Patrón de títulos limpio y plano:** CFS no utiliza guiones, barras ni paréntesis para el jugador y talla en su título principal. Su formato canónico es:  
   `[Temporada] [Equipo] [Autenticidad Premium] [Versión] [Manga] Shirt [Jugador] #[Número]`  
   *Ejemplo:* `2006 England Match Worn World Cup Home L/S Shirt Beckham #7`. La talla no se incluye en el título del producto de catálogo principal, sino en el nivel de inventario (variantes).
2. **Condición e inventario subjetivo:** CFS utiliza una puntuación numérica del 1 al 10 (ej: `Condition: 8/10`) y un estado especial `BNWT` (Brand New With Tags). Acompañan esta nota con una descripción detallada en texto libre (bobbles, pulls, sponsor fading) para de-riesgar devoluciones.
3. **Manga y Autenticidad como atributos core:** La manga (`L/S` o `Long Sleeve`) y la autenticidad (`Player Issue`, `Match Issue`, `Match Worn`) aparecen de forma explícita en el título y en los filtros laterales de listado.
4. **URLs descriptivas y amigables:** Las URLs se generan directamente sobre el slug del título simplificado: `/2019-20-manchester-city-home-shirt-sterling-7.html`.

---

## 5. Hallazgos Catenaccio actual

1. **Catálogo estructurado por ACF meta fields:** A diferencia de la instalación por defecto de WooCommerce que usa `attributes[]`, el catálogo de Catenaccio Vintage lee de ACF meta fields: `liga` (term ID), `equipo` (term ID), `ano_temporada` (term ID), `talla` (string), `condicion` (string), `jugador` (term ID/string). El Filtro Camisetas Pro lee exclusivamente de estas llaves de metadatos.
2. **Títulos con Talla explícita:** En Catenaccio, al ser piezas vintage de inventario único (sin variantes en WooCommerce), la talla se incluye en el título para que el comprador la identifique rápidamente desde los grids del listado: `2014-15 France Away Shirt (XXL)`.
3. **Falta de granularidad:** El schema Supabase MVP no contenía el campo de versión (Home/Away/Third) ni manga (Short/Long Sleeve), y el tipo de producto estaba simplificado como una constante `'football_shirt'`.

---

## 6. Matriz de campos inferidos

Esta matriz mapea cómo se conciben los campos en CFS, cómo se implementan hoy en Catenaccio, el tipo recomendado para Catenaccio Studio, su obligatoriedad y su destino de publicación final.

| Campo | Cómo aparece en CFS | Cómo aparece en Catenaccio actual | Tipo recomendado en Studio | Obligatorio MVP | Alimenta Woo/ACF | Alimenta filtros/URLs/SEO | Notas |
|---|---|---|---|---|---|---|---|
| **Liga** | Menú/Filtros laterales | ACF meta `liga` (term ID) | `SELECT` (con mapeo a ID) | Sí (salvo selecciones) | Sí (`liga`) | Sí (Filtro / URLs de archivo) | Selección nacional se guarda con `liga = ""` |
| **Equipo** | Ficha/Filtros laterales | ACF meta `equipo` (term ID) | `Autocomplete` (datalist) | Sí | Sí (`equipo`) | Sí (Filtro / SEO) | Si no existe en la lista, Pablo lo escribe libre |
| **Temporada** | Título/Filtros laterales | ACF meta `ano_temporada` (term ID) | `Autocomplete` (datalist) | Sí | Sí (`ano_temporada`) | Sí (Filtro / Título) | Formato canónico: `YYYY-YY` (ej. 2001-02) |
| **Talla** | Ficha/Selector de stock | ACF meta `talla` (string directo) | `SELECT` (lista fija) | Sí | Sí (`talla`) | Sí (Filtro / Título) | XS, S, M, L, XL, XXL, XXXL, Única |
| **Condición** | Ficha/Notas (ej. 8/10) | ACF meta `condicion` (string directo) | `SELECT` (lista fija) | Sí | Sí (`condicion`) | Sí (Filtro) | Mint, Excelente, Muy buena, Buena, Aceptable |
| **Marca** | Ficha/Filtros laterales | Tag o ACF libre (interno) | `SELECT` + input libre fallback | Sí | No (MVP es interno) | No (Solo tracking interno) | Adidas, Nike, Umbro, Puma, Reebok, Kappa, etc. |
| **Jugador** | Título/Filtros laterales | ACF meta `jugador` (term ID) | `Texto libre` | No | Sí (`jugador`) | Sí (Filtro / Título) | En S022C se resuelve contra term ID de WC |
| **Dorsal** | Título (ej: Sterling #7) | Estampado en ficha | `Texto libre` (numérico) | No | No (MVP es interno) | Sí (Título autogenerado) | Solo número de camiseta del jugador |
| **Product Type** | Filtros laterales (Type) | No diferenciado | `SELECT` (lista fija) | Sí | No (Draft default: simple) | Sí (Determina sufijo del título) | Shirt, Shorts, Jacket, Tracksuit, etc. |
| **Shirt Version** | Título/Filtros | No existía en schema | `SELECT` (lista fija) | Sí | No (MVP es interno) | Sí (Título / SEO) | Home, Away, Third, GK, Training, Pre-match, Special |
| **Authenticity** | Título (Match Worn/Issue) | Meta manual / descripción | `SELECT` (lista fija) | Sí | No (MVP es interno) | Sí (Título / SEO) | Replica, Player Issue, Match Issue, Match Worn, etc. |
| **Sleeve** | Título (L/S) / Filtros | En descripción si acaso | `SELECT` (lista fija) | Sí | No (MVP es interno) | Sí (Título / SEO) | Short Sleeve, Long Sleeve |
| **Sponsor** | Ficha (Sponsor) | En descripción | `Texto libre` | No | No (MVP es interno) | No (Solo para Claude/AI) | Ej: "Bwin", "Opel", "Carlsberg" |
| **Patches** | Ficha (Patches) | En descripción | `Texto libre` / checkboxes | No | No (MVP es interno) | No (Solo para Claude/AI) | Ej: "Champions League", "LFP parche" |
| **Medidas** | Ficha (Measurements) | En descripción | `Numeric` (largo / ancho cm) | No | No (MVP es interno) | No (Para Claude / Guía tallas) | Ayuda a Claude a describir el fit real |
| **Precio Web** | Ficha en libras (£) | Precio regular en EUR (€) | `Decimal` (EUR enteros) | Sí | Sí (`regular_price`) | Sí (Checkout / Tienda) | WC espera entero como string en Catenaccio |
| **Referencia** | Ficha (Item SKU) | Nombre interno / Título | `Texto libre` (Autogenerado) | Sí | Sí (`name`) | Sí (Búsqueda / Título) | Es el título del producto en WooCommerce |

---

## 7. Product type vs shirt version vs authenticity

Para estructurar el catálogo sin cometer errores de dominio, se definen estas tres dimensiones como columnas independientes de base de datos en la tabla `football_shirt_details` de Studio:

1. **`product_type` (Tipo de Producto):**  
   - *Valores:* `Shirt` (Camiseta), `Shorts` (Pantalón), `Jacket` (Chaqueta), `Tracksuit` (Chándal), `Socks` (Medias), `Goalkeeper` (Portero - si no es camiseta).
   - *Por defecto:* `Shirt`.
   - *Uso:* Si el tipo no es `Shirt`, se adapta el nombre en el título autogenerado (ej: `2001-02 Real Madrid Home Shorts` en lugar de `Shirt`).
2. **`shirt_version` (Versión de Camiseta):**  
   - *Valores:* `Home` (Primera Equipación), `Away` (Segunda), `Third` (Tercera), `Goalkeeper` (Portero), `Training` (Entrenamiento), `Pre-match` (Calentamiento), `Special` (Edición Especial), `None` (Sin versión específica / selecciones o ropa de paseo).
   - *Por defecto:* `Home`.
   - *Uso:* Determina el sufijo del título autogenerado y el mapeo en WooCommerce.
3. **`authenticity_type` (Tipo de Autenticidad):**  
   - *Valores:* `Replica` (Versión comercial estándar), `Player Issue` (Versión comercial con especificaciones de jugador / Authentic), `Match Issue` (Preparada para partido / utilería oficial), `Match Worn` (Usada en partido real por un jugador), `Official Reissue` (Reedición retro oficial de la marca), `Deadstock` (Vintage original sin usar, con etiquetas originales intactas).
   - *Por defecto:* `Replica`.
   - *Uso:* Añade prefijos premium en el título (ej: "Match Worn" o "Player Issue") y es un filtro clave del catálogo.

---

## 8. Patrón de título recomendado

El patrón propuesto por Pablo es una versión limpia en inglés con la talla visible al final entre paréntesis para el listado de Catenaccio:
`[Temporada] [Equipo] [Versión] Shirt – [Jugador] #[Dorsal] – ([TALLA])`

El algoritmo de Studio construirá el título dinámicamente en base a las 4 dimensiones anteriores (`temporada`, `equipo`, `shirt_version`, `sleeve_length`, `authenticity_type`), adaptándose a los siguientes casos de uso:

### Caso A: Camiseta Club Clásica Estándar (Sin jugador)
- *Input:* Temporada: "2001-02", Equipo: "Real Madrid", Versión: "Home", Manga: "Short Sleeve", Talla: "L", Autenticidad: "Replica".
- *Resultado:* `2001-02 Real Madrid Home Shirt (L)`

### Caso B: Camiseta con Jugador y Dorsal
- *Input:* Temporada: "2001-02", Equipo: "Real Madrid", Versión: "Home", Jugador: "Raúl", Dorsal: "7", Talla: "L".
- *Resultado:* `2001-02 Real Madrid Home Shirt – Raúl #7 – (L)`

### Caso C: Camiseta de Selección Nacional (Sin liga)
- *Input:* Temporada: "2014-15", Equipo: "Francia" (Liga: ""), Versión: "Away", Talla: "XXL".
- *Resultado:* `2014-15 Francia Away Shirt (XXL)`

### Caso D: Camiseta Manga Larga (Long Sleeve)
- *Input:* Temporada: "1997-98", Equipo: "Arsenal", Versión: "Home", Manga: "Long Sleeve", Talla: "XL".
- *Resultado:* `1997-98 Arsenal Home L/S Shirt (XL)`  
*(CFS usa el acrónimo compacto `L/S Shirt` para mantener el título corto y legible)*

### Caso E: Camiseta de Portero (Goalkeeper)
- *Input:* Temporada: "2010-11", Equipo: "Chelsea", Versión: "Goalkeeper", Talla: "M".
- *Resultado:* `2010-11 Chelsea GK Shirt (M)`  
*(Se simplifica "Goalkeeper Shirt" a "GK Shirt" siguiendo el patrón de CFS)*

### Caso F: Camiseta de Entrenamiento o Pre-match
- *Input:* Temporada: "2012-13", Equipo: "FC Barcelona", Versión: "Training", Talla: "S".
- *Resultado:* `2012-13 FC Barcelona Training Shirt (S)`

### Caso G: Camiseta Premium / Match Worn / Player Issue
- *Input:* Temporada: "2005-06", Equipo: "Arsenal", Versión: "Home", Jugador: "Henry", Dorsal: "14", Talla: "L", Autenticidad: "Match Worn", Manga: "Long Sleeve".
- *Resultado:* `2005-06 Arsenal Match Worn Home L/S Shirt – Henry #14 – (L)`  
*(Se inserta la autenticidad premium antes de la versión para emular el valor de catálogo de CFS)*

---

## 9. Estructura recomendada del formulario Studio

El formulario debe organizarse en 4 bloques de entrada lógicos de arriba a abajo, permitiendo que la creación y edición sean sumamente fluidas para Pablo.

```
┌────────────────────────────────────────────────────────┐
│ 1. IDENTIFICACIÓN Y CATÁLOGO                           │
│    - Liga [SELECT con label/resolución]                │
│    - Equipo [Autocomplete / datalist de pa_equipo]     │
│    - Temporada [Autocomplete / datalist YYYY-YY]       │
│    - Marca [SELECT + fallback input libre]             │
│    - Talla [SELECT]     - Condición [SELECT]           │
│                                                        │
│ 2. ESPECIFICACIÓN DEL PRODUCTO                         │
│    - Product Type [SELECT: Shirt, Shorts, Jacket...]   │
│    - Shirt Version [SELECT: Home, Away, Third...]      │
│    - Authenticity Type [SELECT: Replica, Player...]    │
│    - Sleeve Length [SELECT: Short Sleeve, Long...]     │
│                                                        │
│ 3. PERSONALIZACIÓN Y DETALLES VINTAGE                  │
│    - Jugador [Datalist / texto libre]                  │
│    - Número Dorsal [Texto]                             │
│    - Parches [Texto libre]                             │
│    - Medidas: Largo (cm) y Ancho (cm) [Numeric inputs] │
│    - Condición Notas (falla de sponsor, bobbles) [Text]│
│                                                        │
│ 4. DATOS DE ADQUISICIÓN E INTERNOS                     │
│    - Coste (€) [Numeric] - Proveedor [Text]            │
│    - Fecha Compra [Date] - Ubicación Física [Text]     │
│    - Carpeta Fotos Local [Text]                        │
│    - Precio Objetivo (€) [Numeric]                     │
└────────────────────────────────────────────────────────┘
```

---

## 10. Qué debe ser select/autocomplete/texto libre/derivado/oculto

- **SELECT (Opciones canónicas fijas):**
  - `liga` (Mapeado a term ID internamente vía `wc-terms-mvp.ts`).
  - `talla` (XS, S, M, L, XL, XXL, XXXL, Única).
  - `condicion` (Mint, Excelente, Muy buena, Buena, Aceptable).
  - `marca` (Nike, Adidas, Umbro, Reebok, Puma, Kappa, Lotto, Hummel, Le Coq Sportif, Diadora, Asics, Joma, Meyba, New Balance, Under Armour, Otra).
  - `product_type` (Shirt, Shorts, Jacket, Tracksuit, Socks, Accessories).
  - `shirt_version` (Home, Away, Third, Goalkeeper, Training, Pre-match, Special, None).
  - `authenticity_type` (Replica, Player Issue, Match Issue, Match Worn, Official Reissue, Deadstock).
  - `sleeve_length` (Short Sleeve, Long Sleeve).
- **Autocomplete / Datalist (Texto rápido con sugerencias no limitativas):**
  - `equipo` (Datalist con los 21+ equipos confirmados por el probe, mapeando a term ID si se encuentra, o guardando texto libre con `termId: ""` si no existe).
  - `temporada` (Datalist de temporadas comunes con formato `YYYY-YY`).
  - `jugador` (Datalist opcional con leyendas/jugadores populares de la tienda, texto libre).
- **Texto Libre:**
  - `numero_dorsal`, `parches_descripcion`, `condicion_notas`, `autenticidad` (notas detalladas), `proveedor`, `ubicacion_fisica`, `carpeta_local`.
- **Derivados (Autogenerados por código, mostrados en tiempo real en la UI):**
  - `referencia` (Nombre/Título autogenerado con opción a override manual).
  - `slug` (Slug web derivado de la referencia).
- **Ocultos técnicos:**
  - `id` (UUID auto), `workspace_id` (auto de sesión), `owner_id` (auto de sesión / Pablo).
  - Campos de puente: `wc_product_id`, `wc_status`, `wc_error`, `wc_payload_snapshot`.

---

## 11. Decisiones propuestas para schema

Para no depender de un "campo temporal" (`autenticidad`) ni forzar parches frágiles en el código, **es obligatorio realizar un cambio de schema mínimo en Postgres antes de escribir la UI de S022A.2**.

### Cambios a aplicar en Supabase SQL Editor:
```sql
-- Agregar las nuevas columnas granulares de dominio a football_shirt_details
ALTER TABLE football_shirt_details 
    ADD COLUMN product_type TEXT NOT NULL DEFAULT 'Shirt',
    ADD COLUMN shirt_version TEXT NOT NULL DEFAULT 'Home',
    ADD COLUMN authenticity_type TEXT NOT NULL DEFAULT 'Replica',
    ADD COLUMN sleeve_length TEXT NOT NULL DEFAULT 'Short Sleeve',
    ADD COLUMN sponsor TEXT,
    ADD COLUMN es_replica BOOLEAN NOT NULL DEFAULT TRUE; -- Se mantiene para compatibilidad retro
```

El script canónico `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql` debe actualizarse localmente para reflejar la versión definitiva del schema del proyecto.

---

## 12. Decisiones propuestas para S022A.2

Para estructurar de manera óptima el desarrollo y mitigar riesgos de tokens o inestabilidad, la sesión S022A.2 debe estructurarse y ejecutarse bajo las siguientes definiciones:

1. **¿Usar `shirt_version`?**  
   Sí. Se confirma como el término de dominio adecuado. El término temporal en español `version_camisa` queda formalmente descartado.
2. **¿Separar `product_type` de `shirt_version`?**  
   Sí. Son dimensiones de catálogo distintas.
3. **¿Separar `authenticity_type`?**  
   Sí. Es clave para el valor de venta del artículo vintage.
4. **¿Hace falta schema change antes de la UI de S022A.2?**  
   Sí. Los campos de dominio deben nacer estructurados en la base de datos local y Supabase. Se documenta la secuencia: S022A.2A (Schema Update manual de Pablo) → S022A.2B (Implementación del formulario de edición y creación con auto-título y resolución de IDs).
5. **¿S022A.2 puede seguir siendo local/no Woo/no AI?**  
   Sí, al 100%. S022A.2 no debe requerir APIs de WooCommerce ni de Anthropic. Lee los términos estáticos desde `lib/wc-terms-mvp.ts` y guarda localmente en Supabase.
6. **¿Qué campos exactos entran en el formulario final de S022A.2?**  
   Todos los indicados en la Sección 9 de esta auditoría, eliminando por completo cualquier entrada de IDs numéricos y permitiendo la edición mínima en la ruta `/inventory/[id]/edit`.

---

## 13. Qué queda fuera de scope

- **Sincronización a WooCommerce:** La creación real del borrador vía API queda relegada estrictamente a la sesión `S022C`.
- **Generación de sugerencias AI (Claude):** El backend para sugerencias de descripción/precio queda relegado estrictamente a la sesión `S022B` (que usará los campos limpios guardados por S022A.2).
- **Subida de fotos a Storage:** Las imágenes en el MVP se gestionan escribiendo la ruta de la carpeta local (`carpeta_local`). No se configuran buckets de Supabase en esta fase.

---

## 14. Riesgos

- **Riesgo de fragmentación en WooCommerce:** Si Pablo escribe un equipo no listado (ej: "Real Madrid F.C." en vez de "Real Madrid"), WooCommerce creará un término nuevo que romperá el Filtro Camisetas Pro en el frontend de WordPress.  
  *Mitigación:* La Server Action en Studio resolverá contra los nombres exactos definidos en `wc-terms-mvp.ts` (con normalización básica a minúsculas y trim de espacios). Si no encuentra coincidencia exacta, registrará `equipo = ""` (sin term ID), obligando a que el puente de publicación (S022C) detenga la creación y le pida a Pablo asociar el equipo en WooCommerce manualmente o corregir la entrada de texto en Studio.
- **Riesgo de pérdida de estado del formulario:** El Server Action debe retornar los valores introducidos (`values`) en el payload de error para que la UI los pinte de nuevo si la validación falla.

---

## 15. Veredicto

El veredicto final es **ADJUST_S022A2_MODEL_FIRST**.  
Se recomienda al orquestador programar la siguiente sesión como `S022A.2` enfocada en dos pasos secuenciales:
1. **Schema Update (S022A.2A):** Pablo ejecuta el script `ALTER TABLE` provisto en la Sección 11 en Supabase SQL Editor.
2. **Form Domain UX Patch (S022A.2B):** Sesión CODE de agente para programar la UI de edición, creación, autotítulo en tiempo real, validación robusta y resolución estática de term IDs.
