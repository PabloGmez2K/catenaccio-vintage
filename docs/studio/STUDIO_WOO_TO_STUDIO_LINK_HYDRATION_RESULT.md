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
