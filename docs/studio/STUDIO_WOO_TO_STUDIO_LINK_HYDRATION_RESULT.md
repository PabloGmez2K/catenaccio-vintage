# STUDIO_WOO_TO_STUDIO_LINK_HYDRATION_RESULT

**Sesion:** WOO_TO_STUDIO_LINK_HYDRATION_FIX  
**Fecha:** 2026-07-04  
**Agente:** Codex  
**Modo:** FIX_BLOCKER_FIRST / LOCAL_ONLY / WOO_GET_ONLY / NO_WOO_WRITE / NO_DEPLOY / NO_PUSH  
**Resultado:** DONE local, pendiente prueba de Pablo con Woo product #1792 o equivalente.

## Diagnostico

El blocker estaba en `linkWooProductToStudio`: al vincular un producto Woo existente se creaba una ficha Studio con `coste=0`, `photo_status=sin_hacer`, estado inicial demasiado optimista para `publish + outofstock`, y detalles de camiseta casi vacios. El GET de listado ya traia titulo, estado, stock, precio e imagen; faltaba usar el GET de detalle para `meta_data`, categorias, atributos y descripcion.

El segundo bug estaba en `buildWooDiff` / `WooSyncPanel`: el panel mostraba filas `Distinto`, pero el mensaje "Studio y la web estan alineados" solo miraba si habia acciones automatizadas disponibles. Si la diferencia era informativa/manual, el copy limpio seguia apareciendo.

## Cambios

- `fetchWooProductDetail` ahora parsea `categories`, `attributes` y `meta_data`.
- `linkWooProductToStudio` hidrata la ficha con titulo, precio web, estado Woo, stock, imagen web, categorias/atributos/meta resumidos en `wc_payload_snapshot` y notas internas.
- El estado inicial para `publish + outofstock` pasa a `reservada`, no a venta activa normal.
- Talla se infiere del titulo solo si viene clara como `(XXL)` y queda anotada como inferida.
- `coste=0` se mantiene solo como placeholder tecnico por schema; la UI lo muestra como `Coste pendiente` y no calcula margen con ese valor.
- La ficha separa `Fotos Studio` de `Imagen web disponible desde Woo`.
- El preflight matiza el caso de imagen web disponible.
- `WooSyncPanel` ya no muestra "alineados" si hay cualquier diferencia real; muestra una decision pendiente para stock/estado.
- La auditoria web muestra antes de vincular que se importara: titulo, precio, estado, stock, enlace Woo, imagen web si existe, categorias/atributos si vienen.

## Critico Fresco

Checklist adversarial ejecutado tras el patch:

- Campos inventados: PASS. No se inventan equipo/temporada/condicion; solo se usa `meta_data`/atributos o talla clara del titulo.
- Margen ficticio: PASS. Coste pendiente no calcula margen.
- Stock alignment falso: PASS. `hasDifferences` bloquea el copy limpio y muestra decision manual.
- Preflight enganoso: PASS. Imagen web no sustituye fotos Studio.
- Imagen web ignorada: PASS. Se muestra miniatura/enlace si el GET vivo la devuelve.
- Producto agotado activo normal: PASS. Import `publish + outofstock` queda en `reservada` con nota de revision.
- Woo writes accidentales: PASS. La auditoria sigue usando solo GET Woo + writes Supabase locales.
- Creacion manual de camisetas: PASS tecnico por typecheck/build; no se tocaron `createInventoryItem` ni `ItemForm`.
- UI movil: PASS tecnico. Se reutilizan componentes/estilos existentes; no hubo redisenio.

## Validacion

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS (9 rutas)
- `git diff --check`: PASS
- Secret scan razonable sobre diff/archivos nuevos: CLEAN (solo nombres de env vars en codigo existente de cliente Woo; sin valores)

## Prueba Para Pablo

Producto recomendado: Woo product #1792 (`2014-15 France Away Shirt - (XXL)`), publicado y agotado, precio web EUR 45.00.

Pasos:

1. Ejecutar `cd studio && npm run dev`.
2. Ir a `/inventory/woo`, localizar el producto #1792 y pulsar `Vincular a Studio`.
3. Abrir la ficha creada.

Debe verse:

- Precio web EUR 45.00.
- Coste como pendiente, sin margen ficticio.
- Estado Studio no activo normal si Woo esta agotado.
- Sincronizacion web con decision pendiente si Studio/Web divergen.
- Fotos Studio separadas de la imagen web disponible.
- Notas internas con origen Woo y datos importados/resumidos.

No debe pasar:

- No debe ejecutarse ningun write a Woo.
- No debe crearse una ficha vacia sin datos Woo utiles.
- No debe aparecer "alineados" cuando stock/status difieren.
- No debe mostrarse coste EUR 0.00 como dato real.

## Riesgos

- La hidratacion depende de lo que Woo exponga en `meta_data`, `categories` y `attributes`; si un producto antiguo no tiene esos campos, Studio lo deja pendiente.
- La categoria se copia desde Woo si viene en el producto; no se inventa mapping.
- La imagen web se referencia desde Woo; no se copia a Supabase ni a Fotos Studio.
- `reservada` se usa como estado seguro para `publish + outofstock` porque el schema no tiene `requiere_revision`.

## No Tocado

Woo writes, Supabase remoto, SQL, Vercel, `.env.local`, deploy y push.

## V2 - Rehidratacion Tras Prueba Real

**Continuacion:** WOO_TO_STUDIO_LINK_HYDRATION_FIX_V2
**Fecha:** 2026-07-04
**Resultado:** DONE local, pendiente prueba Pablo.

Pablo valido el commit inicial `be88a08` como PARTIAL. La ficha nueva ya no estaba vacia, pero el formulario mostraba `170` como Equipo y `172` como Temporada. Causa raiz: V1 copio los term IDs de `meta_data` (`equipo`, `ano_temporada`) a `football_shirt_details.equipo/temporada` y dejo `*_display` vacio; la pagina de edicion hacia fallback de `*_display` a los campos ID, asi que el input humano interpretaba esos numeros como texto nuevo.

Cambios V2:

- Nuevo helper `studio/lib/inventory/woo-hydration.ts` para resolver Woo detail GET hacia datos Studio.
- IDs numericos de `pa_equipo`, `pa_ano`, `pa_liga`, `pa_jugador` se resuelven contra `wc_terms`; si no resuelven, no se muestran como texto humano y queda nota pendiente.
- Caso documentado por repo: `pa_equipo` ID `170` -> `FC Barcelona`; `pa_ano` ID `172` -> `2000-01`.
- `linkWooProductToStudio` reutiliza el helper V2; no copia IDs crudos a campos display.
- Nueva accion `rehydrateItemFromWoo`: GET Woo + Supabase local only. Corrige fichas ya vinculadas con placeholders o IDs numericos sin sobreescribir campos humanos completados manualmente.
- `WooSyncPanel` muestra accion confirmada `Rehidratar desde Woo`; el copy explicita que no modifica Woo.
- Edicion de item: el coste pendiente importado desde Woo se muestra vacio con placeholder/help text, no como `0` real.
- Detalle/edicion dejan de hacer fallback visible de Equipo/Temporada a IDs numericos.

Validacion V2:

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS (9 rutas)
- `git diff --check`: PASS
- Secret scan sobre diff/archivos nuevos: CLEAN

No tocado en V2: Woo writes, Supabase remoto, SQL, Vercel, `.env.local`, deploy, push, storefront.

## V3 - Campos Woo Utiles, SEO Base y Fotos Web

**Continuacion:** WOO_TO_STUDIO_LINK_HYDRATION_FIX_V3
**Fecha:** 2026-07-04
**Resultado:** DONE local, pendiente prueba Pablo.

Pablo valido V2 como "mucho mejor", pero la ficha importada seguia incompleta: faltaban condicion/marca, medidas ACF, descripcion Woo como base del flujo SEO y una via operativa para fotos web.

Cambios V3:

- `WooProductDetail` conserva ahora la galeria Woo completa (`images[]` con id/src/name/alt/position), no solo la primera imagen.
- `woo-hydration.ts` sube a `woo_link_hydration_v3` e hidrata nuevos campos:
  - `pa_condicion`/atributo condicion -> `football_shirt_details.condicion` si Woo trae nombre humano.
  - `pa_marca`/atributo marca -> `marca_display` si Woo trae nombre humano.
  - `medida_axila` -> `ancho_cm`.
  - `medida_largo` -> `largo_cm`.
- Si condicion/marca llegan solo como ID numerico y sin nombre de atributo, quedan pendientes con nota; nunca se muestran IDs como texto humano.
- `Rehidratar desde Woo` rellena marca/condicion/medidas solo si el campo local esta vacio/placeholdereado; no pisa valores manuales.
- `ManualSeoPanel` muestra "Descripcion actual de Woo" de forma segura, la incluye al copiar el prompt SEO, y permite precargarla en el formulario como base. No crea contenido aprobado ni sobrescribe SEO manual existente.
- `ItemImagesPanel` muestra "Fotos actuales en Woo" como galeria y anade accion local "Importar fotos de Woo a Studio".
- `importWooImagesToStudio` hace GET Woo + insert local en `media_assets`; evita duplicados por URL, conserva orden, no borra fotos Studio existentes y no toca Woo ni Storage remoto.

Critico fresco V3:

- `pa_condicion` ignorada: corregido si Woo trae option/nombre; si solo trae ID, queda pendiente con nota.
- `pa_marca` ignorada: corregido si Woo trae option/nombre; si solo trae ID, queda pendiente con nota.
- Medidas ACF ignoradas: corregido con normalizacion numerica (`55`, `55.0`, `55 cm`, `55,0`).
- Descripcion Woo ignorada: corregido como base visible/pre-cargable en SEO manual, sin aprobar automaticamente.
- Fotos Woo visibles pero no accionables: corregido con galeria + import local a `media_assets`.
- Sobrescritura de manuales: rehydrate solo rellena vacios/placeholders; SEO Woo no se guarda sin accion de Pablo.
- Woo writes accidentales: no se anaden PUT/POST/DELETE Woo; las nuevas acciones son GET Woo + Supabase local.

Validacion V3:

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS (9 rutas)
- `git diff --check`: PASS
- Secret scan sobre diff/archivos nuevos: CLEAN

No tocado en V3: Woo writes, Supabase remoto por agente, SQL, Vercel, `.env.local`, deploy, push, storefront.

## V4 - Contrato canonico (STUDIO_WOO_SYNC_CONTRACT)

**Continuacion:** STUDIO_WOO_SYNC_CONTRACT_WITH_FABLE
**Fecha:** 2026-07-04
**Resultado:** la hidratacion deja de ser logica propia y pasa a consumir el contrato canonico.

La hidratacion sube a `woo_link_hydration_v4` y se reconstruye sobre
`studio/lib/inventory/woo-studio-sync-contract.ts` (fuente unica de mapeo
Woo ↔ Studio). Ver `docs/studio/STUDIO_WOO_SYNC_CONTRACT.md` para el contrato
completo. Cambios frente a V3:

- Resolucion de las 7 taxonomias reales (`pa_talla`/`pa_condicion`/`pa_marca`
  incluidas) contra la cache `wc_terms`, ampliada sin SQL en `taxonomy-sync.ts`
  (las 3 nuevas son best-effort: no pueden romper la sync de las 4 criticas).
- `defectos` (ACF) se hidrata a `condicion_notas`; `patrocinador`/`sponsor` a
  `sponsor`; `marca` guarda tambien su term ID cuando la cache lo conoce.
- Atributos y meta Woo sin destino se recogen estructuradamente
  (`unmappedAttributes`/`unmappedMeta`), visibles en el panel de sincronizacion
  y persistidos en el snapshot — ya no viven solo en una linea de notas.
- La politica "rellenar solo vacios/placeholders, nunca pisar manuales" se
  extrae a `buildRehydrationDetailPatch` (funcion pura compartida por link y
  rehidratacion). Las notas de rehidratacion ya no se duplican al subir de
  version (marcador generico).
- Valor numerico en taxonomias de formato string (una talla "38") se interpreta
  primero como nombre literal de termino y solo despues como term ID — evita
  corromper datos por colision de IDs.
- Paridad resumen ↔ editar: talla/condicion importadas fuera de las listas
  canonicas se inyectan como opcion en el select de edicion; marca y medidas
  visibles siempre en la ficha; marca se resuelve contra `pa_marca` al guardar.
- Panel «Sincronizacion web»: nueva tabla «Campos de catalogo Studio ↔ Web»
  (Igual/Distinto/Solo en la web/Solo en Studio/Pendiente de mapear), seccion de
  datos Woo sin mapear y contrato de readiness Studio → Web.
