# STUDIO_WC_TERM_ID_RESOLUTION_PLAN — Resolución de Term IDs WooCommerce

Plan para descubrir y cachear los IDs de términos de atributos WC necesarios para el payload del bridge.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-27  
**Sesión:** 020 — STUDIO_WC_BRIDGE_CONTRACT  
**Modo:** DOCS_ONLY  
**Depende de:** `API_READONLY_PROBE_RESULT.md §4`, `STUDIO_WC_PAYLOAD_SPEC.md §3.2`, `STUDIO_WC_BRIDGE_CONTRACT.md`

---

## 1. Contexto — modelo de datos real de Catenaccio

**Hallazgo crítico de S007 (probe):** los productos de Catenaccio usan ACF meta fields con **term IDs** de WooCommerce como valores string. No usan `attributes[]` de WC.

El bridge escribe en `meta_data`:
- `liga` → term ID de `pa_liga` (attribute id=5) como string, o `""` para selecciones sin liga
- `equipo` → term ID de `pa_equipo` (attribute id=4) como string
- `ano_temporada` → term ID de `pa_ano` (attribute id=7) como string
- `jugador` → term ID de `pa_jugador` (attribute id=6) como string, o `""` si no aplica
- `talla` → string directo (no term ID)
- `condicion` → string directo (no term ID)

---

## 2. Attribute IDs confirmados (probe S007)

| Slug WC | Nombre WC | Attribute ID | Confirmado |
|---------|----------|-------------|------------|
| `pa_talla` | Talla | **1** | ✅ S007 |
| `pa_condicion` | Condición | **2** | ✅ S007 |
| `pa_marca` | Marca | **3** | ✅ S007 |
| `pa_equipo` | Equipo | **4** | ✅ S007 |
| `pa_liga` | Liga | **5** | ✅ S007 |
| `pa_jugador` | Jugador | **6** | ✅ S007 |
| `pa_ano` | Año | **7** | ✅ S007 |

Endpoint para confirmar o actualizar:
```
GET /wp-json/wc/v3/products/attributes
```

---

## 3. Term IDs conocidos (parcialmente resueltos en probe S007)

### 3.1 pa_liga (attribute id=5) — 6 términos

| Nombre liga | Term ID | Confirmado |
|-------------|---------|------------|
| Bundesliga | ? | Pendiente resolver |
| Eredivisie | **177** | ✅ S007 |
| LaLiga | **72** | ✅ S007 |
| Ligue 1 | ? | Pendiente resolver |
| Premier League | **95** | ✅ S007 |
| Serie A | **51** | ✅ S007 |

Endpoint:
```
GET /wp-json/wc/v3/products/attributes/5/terms
```

### 3.2 pa_equipo (attribute id=4) — 21+ términos

| Nombre equipo | Term ID | Confirmado |
|--------------|---------|------------|
| Francia | **129** | ✅ S007 (producto 1792) |
| Ajax | ? | Listado en probe, ID pendiente |
| AC Milan | ? | Listado en probe, ID pendiente |
| Alemania | ? | Pendiente |
| Arsenal | ? | Pendiente |
| AS Roma | ? | Pendiente |
| Bayern Munich | ? | Pendiente |
| Borussia Dortmund | ? | Pendiente |
| Colombia | ? | Pendiente |
| Escocia | ? | Pendiente |
| FC Barcelona | ? | Pendiente |
| Juventus | ? | Pendiente |
| Lazio | ? | Pendiente |
| Liverpool | ? | Pendiente |
| Málaga | ? | Pendiente |
| Manchester United | ? | Pendiente |
| Paraguay | ? | Pendiente |
| PSG / Paris Saint-Germain | ? | Pendiente (¿son el mismo term?) |
| Real Madrid | ? | Pendiente |
| + otros | ? | Pendiente |

Endpoint:
```
GET /wp-json/wc/v3/products/attributes/4/terms?per_page=100
```

### 3.3 pa_ano (attribute id=7) — términos pendientes

| Temporada | Term ID | Confirmado |
|-----------|---------|------------|
| 2014-15 | **139** | ✅ S007 (producto 1792) |
| Resto | ? | Pendiente resolver |

Endpoint:
```
GET /wp-json/wc/v3/products/attributes/7/terms?per_page=100
```

### 3.4 pa_jugador (attribute id=6) — términos pendientes

Todos los term IDs de jugadores están pendientes de resolver.

Endpoint:
```
GET /wp-json/wc/v3/products/attributes/6/terms?per_page=100
```

### 3.5 pa_condicion (attribute id=2) — strings directos, no term IDs

**Importante:** en el modelo de datos real, `condicion` se almacena como **string directo** en `meta_data` (ej. `"Excelente"`), no como term ID. Confirmado en probe (producto 1792: `"condicion": "Excelente"`).

No se necesita resolver term IDs para `condicion`.

Valores conocidos de la tienda: `"Excelente"`, `"Muy buena"`, `"Buena"`, `"Aceptable"`. Confirmar con Pablo si hay más valores en uso.

### 3.6 pa_talla (attribute id=1) — strings directos, no term IDs

Igual que `condicion`: el campo `talla` en `meta_data` usa **string directo** (`"XXL"`, `"L"`, `"M"`, etc.), no term ID. Confirmado en probe.

No se necesita resolver term IDs para `talla`.

### 3.7 pa_marca (attribute id=3) — diferido

`marca` no aparece en el mapeo `meta_data` de los productos existentes (no está en el probe). Se omite del payload MVP. Puede añadirse en S023+ si Pablo lo requiere.

---

## 4. Plan de resolución de term IDs pendientes

### 4.1 Cuándo ejecutar

**Durante la sesión `WC_API_WRITE_ACCESS_TEST`** (S020-test), inmediatamente antes de ejecutar el test de escritura:

1. Llamar `GET /wc/v3/products/attributes` → confirmar IDs 1-7 siguen igual.
2. Llamar `GET /wc/v3/products/attributes/5/terms` → resolver Bundesliga y Ligue 1.
3. Llamar `GET /wc/v3/products/attributes/4/terms?per_page=100` → resolver los 21+ equipos.
4. Llamar `GET /wc/v3/products/attributes/7/terms?per_page=100` → resolver todas las temporadas.
5. Llamar `GET /wc/v3/products/attributes/6/terms?per_page=100` → resolver todos los jugadores.

### 4.2 Cómo registrar los resultados

Actualizar la tabla de este documento con los IDs confirmados. Además, el bridge service debe tener un mecanismo de cache local en Studio:

**Opción A (MVP recomendada):** Tabla de configuración en Supabase (read-only para el bridge):
```sql
-- Solo lectura desde el bridge. Poblar manualmente al resolver term IDs.
CREATE TABLE wc_term_cache (
  attribute_slug  TEXT NOT NULL,  -- 'pa_liga', 'pa_equipo', etc.
  term_id         INTEGER NOT NULL,
  term_name       TEXT NOT NULL,  -- nombre legible para mostrar en UI
  PRIMARY KEY (attribute_slug, term_id)
);
```

**Opción B (alternativa MVP):** JSON estático versionado en el repo del bridge (`lib/wc-terms.json`). Simple, sin Supabase. Actualizar cuando cambien los terms en WC.

**Decisión para S021:** elegir Opción A o B según complejidad. Opción B es más simple para MVP.

---

## 5. Cache de display names en `football_shirt_details`

Los campos `liga_display`, `equipo_display`, `temporada_display`, `jugador_display` en `football_shirt_details` son una cache del nombre legible correspondiente al term ID almacenado. Sirven para renderizar la UI de Studio sin hacer un GET a WC en cada pantalla.

| Campo term ID | Campo display | Ejemplo |
|--------------|--------------|---------|
| `football_shirt_details.liga` = `"72"` | `football_shirt_details.liga_display` = `"LaLiga"` | |
| `football_shirt_details.equipo` = `"129"` | `football_shirt_details.equipo_display` = `"Francia"` | |
| `football_shirt_details.temporada` = `"139"` | `football_shirt_details.temporada_display` = `"2014-15"` | |
| `football_shirt_details.jugador` = `""` | `football_shirt_details.jugador_display` = `""` | |

Al guardar un ítem en Studio, el bridge debe rellenar tanto el term ID como el display name. El display name viene de la cache local (Opción A/B de §4.2).

---

## 6. Términos faltantes — política MVP

**En MVP el bridge NO crea términos nuevos automáticamente en WooCommerce.**

Si un item en Studio tiene un valor (ej. un equipo) para el que no existe term ID en WC:

1. **STOP con error validación:**
   ```
   VALIDATION_ERROR: term_not_found — equipo "Sparta Praha" no tiene term ID en WC.
   Requiere alta manual en WooCommerce Admin (Productos → Atributos → pa_equipo → Añadir nuevo término).
   ```
2. El item permanece en estado anterior (no avanza en el pipeline).
3. `wc_error` registra el mensaje.
4. **Pablo añade el término manualmente** en WP Admin → Productos → Atributos → pa_equipo.
5. El bridge actualiza la cache local con el nuevo term ID.
6. Pablo reintenta crear el borrador desde Studio.

**Razón de no auto-crear:** crear terms en WC automáticamente puede producir duplicados (ej. "PSG" vs "Paris Saint-Germain") y romper la taxonomía del Filtro Camisetas Pro.

---

## 7. Casos especiales

### 7.1 Selecciones nacionales — liga vacía

Las selecciones nacionales (Francia, Alemania, España, etc.) no juegan en ninguna liga de club. El campo `liga` debe ser `""` (string vacío) en `meta_data`.

**Identificación en Studio:** si `football_shirt_details.liga IS NULL OR liga = ''` → enviar `"liga": ""`.

No enviar `"liga": null` — WC puede rechazarlo o comportarse diferente. Usar string vacío.

**Ejemplo confirmado en probe:** producto 1792 (Francia 2014-15) → `liga = ""`, `equipo = "129"`.

### 7.2 Jugador vacío

Si la camiseta no tiene un jugador específico asociado (ej. camiseta genérica de equipo sin dorsal) → enviar `"jugador": ""`.

No es un error. Es el estado normal para la mayoría de camisetas.

### 7.3 PSG vs Paris Saint-Germain

El probe muestra `"PSG"` y `"Paris Saint-Germain"` como dos términos distintos en `pa_equipo`. Pueden ser el mismo equipo con dos entradas duplicadas, o dos entradas intencionadas (ej. distintas épocas o distintos tipos de camiseta).

**Acción:** al resolver los term IDs de pa_equipo, confirmar con Pablo cuál usar. Usar solo uno en Studio. Registrar la decisión en este documento.

### 7.4 Temporadas — formato

Las temporadas en WC son términos del tipo `"2014-15"`, `"2001-02"`, etc. Al resolver `pa_ano` terms, el campo `term_name` debe guardarse en ese formato para que Studio pueda mostrarlos correctamente.

---

## 8. Qué validar contra `API_READONLY_PROBE_RESULT.md`

Antes de implementar el bridge (S021):

| Validación | Fuente |
|-----------|--------|
| Attribute IDs 1-7 siguen igual | `GET /wc/v3/products/attributes` |
| pa_equipo id=129 sigue siendo "Francia" | `GET /wc/v3/products/attributes/4/terms` |
| pa_ana id=139 sigue siendo la temporada correcta | `GET /wc/v3/products/attributes/7/terms` |
| pa_liga id=72 sigue siendo "LaLiga" | `GET /wc/v3/products/attributes/5/terms` |
| Los 28 productos siguen teniendo meta_data (no attributes[]) | `GET /wc/v3/products/1792` |

---

*Sesión 020 — 2026-06-27 — Claude Code (Sonnet). DOCS_ONLY / NO_REMOTE_WRITE.*
