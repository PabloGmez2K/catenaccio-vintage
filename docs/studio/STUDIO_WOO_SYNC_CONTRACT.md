# STUDIO_WOO_SYNC_CONTRACT — Contrato canónico Woo ↔ Studio

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-07-04
**Sesión:** STUDIO_WOO_SYNC_CONTRACT_WITH_FABLE
**Código:** `studio/lib/inventory/woo-studio-sync-contract.ts` (módulo puro, sin I/O)
**Versión:** `woo_studio_sync_contract_v1` / hidratación `woo_link_hydration_v4`

Este documento y el módulo de código son la **única fuente de verdad** del mapeo
Woo ↔ Studio. Cualquier flujo que lea o escriba datos entre ambos sistemas debe
pasar por el contrato — no se añade lógica de mapeo ad-hoc en actions ni en UI.

---

## 1. Evidencia del modelo real de la tienda

- **7 taxonomías de atributo** (probe S007, `API_READONLY_PROBE_RESULT.md §4`):
  `pa_talla`(1), `pa_condicion`(2), `pa_marca`(3), `pa_equipo`(4), `pa_liga`(5),
  `pa_jugador`(6), `pa_ano`(7).
- **Los valores operativos viven en ACF `meta_data`**, no en `attributes[]`
  (hallazgo crítico S007). El Filtro Camisetas Pro lee de meta.
- `attributes[]` lo escribe el bridge de Studio desde S022C.8 (liga/equipo/año/jugador)
  y puede venir poblado en productos editados a mano.
- Claves meta con prefijo `_` son referencias de campo ACF (internas, no datos).

## 2. Mapeo de taxonomías (Woo → Studio)

| Taxonomía Woo | Attr ID | Meta key | Formato meta | Campo Studio (ID) | Campo Studio (humano) | Caché |
|---|---|---|---|---|---|---|
| `pa_liga` | 5 | `liga` | term ID o `''` | `liga` | `liga_display` | ✅ |
| `pa_equipo` | 4 | `equipo` | term ID | `equipo` | `equipo_display` | ✅ |
| `pa_ano` | 7 | `ano_temporada` | array de term ID | `temporada` | `temporada_display` | ✅ |
| `pa_jugador` | 6 | `jugador` | term ID o `''` | `jugador` | `jugador_display` | ✅ |
| `pa_talla` | 1 | `talla` | string directo | — | `talla` | ✅ **nuevo** |
| `pa_condicion` | 2 | `condicion` | string directo | — | `condicion` | ✅ **nuevo** |
| `pa_marca` | 3 | `marca` (no usado en tienda) | string/ID | `marca` | `marca_display` | ✅ **nuevo** |

La caché `wc_terms` ahora sincroniza las **7** taxonomías (`taxonomy-sync.ts`);
las 3 nuevas son best-effort (si Woo las quitara, la sync de las 4 críticas no
falla). **No requirió SQL**: el schema de `wc_taxonomies`/`wc_terms` acepta
cualquier slug y las policies ya conceden INSERT/UPDATE a `authenticated`.

### Reglas de resolución (una sola implementación: `resolveTaxonomyField`)

En orden de precedencia:

1. Localizar el atributo del producto por **ID → slug exacto → nombre normalizado**.
2. Formato `string` + meta numérico: preferir término de caché **con ese nombre
   literal** (una talla "38" no es el term ID 38); si no existe, tratar como ID.
3. **Meta string humano: es el valor** (contrato de la tienda) y gana a cualquier
   residuo numérico de atributo; el term ID se anota si la caché lo conoce.
4. Meta numérico (term ID): resolver contra `wc_terms`; si no está, usar el
   nombre humano del atributo; si tampoco, **campo pendiente con nota** — nunca
   se muestra un ID como texto humano.
5. Sin meta: opción humana del atributo, si existe.
6. Talla sin dato: inferencia del título `(XXL)` marcada con origen
   `title_inference` y nota de revisión.

Riesgo residual documentado: si un meta de formato string llega numérico, no hay
término *llamado* así en caché pero sí existe un term ID con ese número, la
resolución por ID puede acertar o equivocarse (ambigüedad inherente del dato).
En esta tienda las tallas son XS…Única y las condiciones texto, así que la
probabilidad es baja; la nota de origen queda en el snapshot.

## 3. Mapeo de meta/ACF (Woo → Studio)

| Meta Woo | Destino Studio | Formato |
|---|---|---|
| `medida_axila` | `ancho_cm` | numérico (acepta `55`, `55.0`, `55 cm`, `55,0`) |
| `medida_largo` | `largo_cm` | numérico ídem |
| `defectos` | `condicion_notas` | texto — **nuevo en v4** |
| `patrocinador` / `sponsor` | `sponsor` | texto (la tienda hoy no lo emite; preparado) |
| `descripcion_del_producto` | — (duplicado del `description` raíz) | HTML |
| `rank_math_primary_product_cat` | — (la escribe el bridge; no se importa) | — |

## 4. Producto raíz (Woo → Studio)

| Campo Woo | Destino Studio |
|---|---|
| `name` | `referencia` (título) |
| `regular_price` / `price` | `precio_publicado_web` |
| `status` + `stock_status` | `wc_status` (espejo) + estado inicial: `publish+outofstock → reservada`, `publish → publicada_web`, resto → `borrador_web` |
| `description` | Base del SEO manual (visible, **nunca auto-aprobada**) |
| `images[]` | Galería Woo visible + acción «Importar fotos de Woo a Studio» (`media_assets`, dedupe por URL, orden conservado) |
| `categories[0]` | `categoria` + `categoria_display` (resuelto contra `wc_categories`) |
| `permalink` / `id` / fechas | Snapshot de auditoría (`wc_payload_snapshot`) |

## 5. Datos Woo sin destino (no se pierden)

- **Atributos no cubiertos** por las 7 taxonomías → `unmappedAttributes`.
- **Meta keys visibles no contratadas** → `unmappedMeta` (con preview truncado);
  `rank_math_*` se agrupa en una línea; claves `_` (refs ACF) se ignoran.
- Ambos se muestran en la ficha (panel «Sincronización web» → «Datos de la web
  que Studio no usa todavía») y quedan en el snapshot. **No se inventa destino.**

## 6. Studio → Woo: readiness (implementado en `STUDIO_TO_WOO_READINESS`)

| Campo Studio | Estado | Detalle |
|---|---|---|
| Precio web | ✅ Sincronizable ahora | PUT `regular_price`, doble verificación preview vs vivo |
| Stock (dejar agotada) | ✅ Sincronizable ahora | Solo vendida/reservada; nunca despublica |
| Descripción aprobada | ✅ Sincronizable ahora | Re-verifica versión Studio y contenido web |
| Borrador → papelera | ✅ Sincronizable ahora | DELETE `force=false`, reversible, con veto |
| Título | 🔶 Solo comparación | `name` fuera de la whitelist del write-client |
| Talla/Condición/Medidas/Defectos | 🔶 Solo comparación | Requieren PUT de `meta_data` ACF (no whitelisted) |
| Equipo/Temporada/Liga/Jugador | 🔶 Mapping inverso | Term ID + meta + `attributes[]`; término debe existir (creación controlada disponible) |
| Marca | ⚠️ Decisión de producto | La tienda no guarda marca en productos; `pa_marca` existe sin uso en meta |
| Categoría | 🔶 Solo comparación | Se fija al crear el borrador; PUT `categories` no whitelisted |
| Fotos Studio → Woo | 🔶 Media sync pendiente | Attach solo en create (flag S026B) |
| Publicar/despublicar/borrado definitivo | ⛔ Bloqueado por diseño | `status` nunca viaja por PUT; sin `force=true` |

Reglas de casa intactas para todo write: una acción = un producto, preview/diff,
confirmación explícita en dos pasos, log en `item_lifecycle_events`, error
visible, sin retry automático, sin bulk.

## 7. Rehidratación (política única: `buildRehydrationDetailPatch`)

- Rellena **solo** campos vacíos, placeholders o IDs numéricos crudos.
- **Nunca** sobrescribe texto humano introducido por Pablo.
- En campos de término (equipo/temporada/liga/jugador/marca): si el valor actual
  es un residuo numérico y Woo no aporta reemplazo seguro, el residuo se limpia
  y el campo queda pendiente con nota. En campos string (talla/condición) el
  valor numérico **se conserva** — puede ser un nombre legítimo ("38") — y solo
  se sustituye cuando Woo aporta un valor humano.
- El mismo código sirve al link inicial (inserción completa) y a «Rehidratar
  desde Woo» (patch). Las notas de rehidratación se añaden **una sola vez** por
  ficha (marcador genérico, ya no se duplican al subir de versión); el detalle
  fresco de cada rehidratación va al evento `woo_rehydrated`. La línea de coste
  placeholder solo se escribe al vincular, no al rehidratar una ficha manual.
- Datos legacy hidratados con v1–v3 pueden conservar algún ID numérico visible
  hasta que Pablo pulse «Rehidratar desde Woo» (la ficha lo enmascara como
  «Pendiente de mapear» en los campos de término).

## 8. UI de verificación (ficha vinculada)

Panel «Sincronización web»:
1. Estado Woo vivo + diff operativo (precio/stock/estado/descripción) — ya existía.
2. **«Campos de catálogo Studio ↔ Web»** (nuevo): tabla campo a campo con estados
   `Igual / Distinto / Solo en la web / Solo en Studio / Pendiente de mapear / Vacío`
   y contador «N a revisar».
3. **«Datos de la web que Studio no usa todavía»** (nuevo): atributos y meta sin mapear.
4. **«Qué puede sincronizarse Studio → Web»** (nuevo): el readiness de §6 en la ficha.
5. Acciones controladas + registro — ya existían.

Paridad resumen ↔ editar cerrada:
- Talla y Condición importadas que no están en las listas canónicas se **inyectan
  como opción** en el select de edición («… · importado de Woo») en vez de
  renderizar vacío y perderse al guardar.
- Marca y Medidas ahora visibles siempre en la ficha resumen.
- Condición/Marca numéricas se muestran como «Pendiente de mapear», nunca como número.
- Marca se resuelve a term ID real contra la caché `pa_marca` al guardar el formulario.

## 9. Fotos y SEO (estado del contrato)

- **Fotos**: galería Woo visible; importación Woo→Studio local sin tocar Woo,
  dedupe por URL, orden conservado (V3). Studio→Woo: solo attach en create
  (S026B, flag). Media sync post-create = bloque futuro documentado (§6).
- **SEO/descripción**: descripción Woo visible como base y añadida al prompt
  copiado; «Usar descripción Woo como base» precarga el formulario; el contenido
  aprobado nunca se sobrescribe sin acción explícita; sync Studio→Woo de
  descripción existente con preview y re-verificación de ambos lados.

## 10. Pendiente / sin mapping (honesto)

| Qué | Estado |
|---|---|
| `product_type` / `shirt_version` / `authenticity_type` / `sleeve_length` / dorsal / parches / etiquetas | Studio-only: Woo no tiene destino estructurado (van embebidos en título/descripción SEO) |
| Marca → Woo | Sin destino en la tienda; decisión de producto pendiente |
| PUT de meta ACF (talla/condición/medidas/defectos) | Whitelist + preview en bloque futuro (S025D resto) |
| PUT de term IDs / attributes (equipo/temporada/liga/jugador) | Mapping inverso futuro; términos creables desde Studio |
| Media sync post-create | No implementado |
| Drift automático de catálogo completo | S030 |

## 11. Riesgos aceptados

- La resolución depende de la caché `wc_terms`: hasta que Pablo re-ejecute el
  sync de taxonomías, `pa_talla`/`pa_condicion`/`pa_marca` estarán vacías y los
  IDs de esas taxonomías quedarán «pendiente de mapear» (comportamiento V3).
- Un producto Woo con atributos custom no estándar cae en «sin mapear» (correcto).
- La comparación de catálogo usa lectura viva: si el GET falla, la sección no se
  muestra y las acciones quedan desactivadas (comportamiento existente).

## 12. Crítico fresco adversarial (2026-07-04/05)

Subagente independiente (misión: «demostrar que el contrato sigue siendo
inconsistente o peligroso»), sobre el working tree completo. **Veredicto:
LIMPIO — 0 blockers**, 11 reglas de casa verificadas con evidencia file:line
(sin writes nuevos a Woo, whitelist intacta, sin IDs numéricos como texto en
superficies nuevas, rehidratación no pisa manuales, no-mapeados visibles, notas
sin duplicar, paridad resumen↔editar, creación manual/Vinted/venta intactos,
sin secretos, caché segura, error_sync solo tras write real). 8 notas no
bloqueantes; corregidas en la misma sesión:

- N1: «alineados» ahora exige también catálogo limpio (además del diff operativo).
- N2: un meta string humano gana a un residuo numérico de atributo.
- N4: máscara numérica también en liga/jugador de la ficha (legacy v1–v3).
- N5a: parámetro muerto eliminado en la política de rehidratación.
- N6: taxonomías críticas primero + términos opcionales best-effort end-to-end
  (ni un GET fallido ni una colisión de caché de pa_talla/pa_condicion/pa_marca
  pueden abortar la sync de las 4 críticas).
- N7: nota de talla inferida ya no se duplica.
- N8: la línea de «coste pendiente» no se añade al rehidratar fichas manuales.

Aceptadas como riesgo residual documentado: N3 (ambigüedad inherente de un meta
string numérico, §2) y N5b/c (residuos legacy hasta rehidratar, §7).

## 13. Superficie operativa (STUDIO_OPERATIVE_EDIT_SURFACE — 2026-07-05)

Ajustes de operabilidad tras la prueba real de Pablo (sin cambiar el contrato de
datos):

- **Sync de taxonomías con UI**: panel «Taxonomías y categorías Woo» en
  Auditoría web (`/inventory/woo#sync-taxonomias`), con estado de las 7 cachés,
  botón «Sincronizar taxonomías Woo», resultado por taxonomía y errores
  saneados. `GET /inventory/sync` (la route técnica POST-only) redirige al
  panel; ya no es un destino de usuario.
- **Precio web vive en Editar**: bloque «Precio y coste» (coste + precio web +
  precio objetivo + margen estimado). El formulario SEO ya **no** fija el precio
  del item (`saveManualSeoContent` dejó de escribir `precio_publicado_web`);
  `precio_sugerido` queda solo como referencia en la sugerencia.
- **SEO dentro de Editar**: el panel de contenido SEO manual (con la descripción
  Woo viva como base) se monta también en la página Editar. El envío a Woo sigue
  siendo acción controlada del panel «Sincronización web».
- **Marca explicable**: bajo el campo Marca (Editar) y en la ficha se distingue
  «no presente en Woo» / «ID sin resolver — sincroniza y rehidrata» / «en la
  web: X» / «caché de marcas vacía» / «web ilegible ahora». El datalist de marca
  usa la caché real `pa_marca` cuando está poblada.
- **Fotos accesibles desde Editar**: bloque con contador y enlace al panel de
  fotos de la ficha (`#fotos`), donde viven subir/ordenar/importar de Woo.
- **Coste pendiente ya no bloquea el guardado**: una ficha importada con el
  placeholder técnico puede guardarse con el coste vacío (sigue «Coste
  pendiente»); vaciar el precio web avisa antes de borrar el valor guardado.
- Lectura viva de producto con timeout de 10 s (una tienda colgada no bloquea
  ficha/Editar).

## 14. Siguiente bloque recomendado

1. Pablo ejecuta el **sync de taxonomías** desde Auditoría web → «Sincronizar
   taxonomías Woo» (puebla las 3 cachés nuevas).
2. Pablo prueba: ficha vinculada → «Campos de catálogo», Rehidratar, Editar
   (precio web, condición importada, SEO con base Woo), ficha nueva vinculada
   desde Auditoría web.
3. Por fricción real: ampliar whitelist PUT a meta ACF con preview (cierra
   «Solo comparación» de talla/condición/medidas/defectos), o S030 drift.
