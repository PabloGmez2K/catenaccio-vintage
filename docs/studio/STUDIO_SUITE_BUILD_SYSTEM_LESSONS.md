# STUDIO_SUITE_BUILD_SYSTEM_LESSONS - S022/S022C

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-29
**Sesion:** S022C.9 - DOCUMENT_STUDIO_BUILD_SYSTEM_LESSONS_AND_OPUS_BRIEF
**Modo:** DOCS_ONLY / NO_CODE / NO_WC_CALL / NO_DEPLOY
**Veredicto:** READY_FOR_OPUS_STRATEGY_REVIEW

---

## 1. Resumen de lo validado en S022C

S022C valido tecnicamente el puente Studio -> WooCommerce para crear borradores reales sin publicar.

Validado:
- Studio crea productos WooCommerce reales en estado `draft`.
- El puente no publica.
- `DRAFT_ONLY` funciona.
- El precio se envia correctamente desde el flujo de contenido SEO manual.
- Talla, condicion, medidas y defectos llegan al borrador.
- La categoria automatica MVP queda en `Otros Clubs` cuando aplica.
- El inventario se crea con `manage_stock: true` y `stock_quantity: 1`.
- Liga, Equipo y Ano quedan seleccionados en WP Admin tras combinar `meta_data` ACF con `attributes[]` WooCommerce.

Commit tecnico clave:
- `95b9b49 fix(studio): add Woo taxonomy attributes to draft payload`

Fallo diferido:
- `Jugador/Rivaldo` no aparecio en WP Admin. Queda para S023 como `PLAYER_TERM_RESOLUTION`.

---

## 2. Capas descubiertas

| Capa | Que contiene | Leccion |
|------|--------------|---------|
| Woo REST root fields | `name`, `status`, `regular_price`, `manage_stock`, `stock_quantity` | No basta con `meta_data`; el root payload define publicabilidad operativa. |
| Woo categories | `categories: [{ id }]` | Sin categoria explicita, el producto cae en `Sin categorizar`. |
| Woo `attributes[]` | Relaciones de taxonomia de producto | Para ACF Taxonomy con `save_terms/load_terms`, las relaciones reales importan. |
| `wp_postmeta` | Valores ACF y companion keys | El valor sin `_field_key` puede quedar invisible o incompleto para ACF. |
| ACF field keys | `_liga`, `_equipo`, `_ano_temporada`, etc. | Hay que enviar el par valor + companion key para campos ACF criticos. |
| ACF taxonomy | Liga, Equipo, Jugador, Ano | No se comporta como un simple campo meta. |
| `wp_term_relationships` | Vinculos reales producto <-> termino | Es la capa que WP Admin/ACF necesita para mostrar taxonomias seleccionadas. |
| Rank Math | Primary category y metadata SEO | No debe asumirse automatico si depende de categoria. |
| Imagenes | Media Library / pipeline futuro | Diferido; no confundir borrador tecnicamente valido con producto publicable completo. |
| Stock | `manage_stock` + `stock_quantity` | Para camisetas unicas, stock operativo es parte del contrato del borrador. |

---

## 3. Que causo la sesion sucia

La sesion avanzo, pero el diagnostico fue cambiando a medida que aparecian capas no modeladas:

- Term IDs faltantes.
- Mapa local provisional `studio/lib/wc-terms-mvp.ts`.
- ACF companion keys.
- `ano_temporada` como array, no string.
- Categorias WooCommerce.
- Stock operativo.
- Configuracion ACF Taxonomy con `save_terms/load_terms`.
- Relaciones en `wp_term_relationships`.
- `attributes[]` WooCommerce como mecanismo complementario.
- Jugador/Rivaldo pendiente.

La causa raiz no fue solo un bug de codigo. Fue un fallo de preparacion del contrato de integracion: se implemento el payload antes de mapear todas las capas donde vive cada dato.

---

## 4. Que gates faltaron

- Comparar producto bueno vs producto generado antes del primer patch.
- Revisar configuracion ACF del grupo de campos implicado.
- Mapear cada dato por capa real de persistencia.
- Definir un payload completo antes de iterar.
- Validar con fixture completo, no con pruebas parciales.
- Activar stop-loss al aparecer 2+ capas no previstas.

---

## 5. Nuevo patron obligatorio para integraciones Woo/ACF

### PRODUCT_REFERENCE_DIFF_GATE

Antes de implementar o parchear payloads Woo/ACF, comparar un producto publicado bueno contra un producto generado por Studio. La comparacion debe cubrir root fields, `meta_data`, companion keys, categorias, taxonomias, stock, imagenes y SEO.

### ACF_CONFIG_GATE

Antes de escribir a campos ACF, revisar tipo de campo, return format, `save_terms`, `load_terms`, valor unico/multiple y field key estable.

### DATA_LAYER_MAPPING_GATE

Para cada campo, documentar donde vive: Woo root field, category, `attributes[]`, `wp_postmeta`, ACF companion key, taxonomy, `wp_term_relationships`, plugin meta o Rank Math meta.

### FULL_FIXTURE_TEST_GATE

El test debe usar una camiseta completa: equipo, liga, ano, jugador si aplica, talla, condicion, medidas, defectos, categoria, precio, stock y contenido SEO.

### NO_MICROPATCH_LOOP_GATE

Si aparecen 2+ capas no previstas durante implementacion: parar, reabrir diagnostico, actualizar el mapa de datos, definir payload completo y volver a implementar una sola vez.

---

## 6. Reglas para evitar repetir

- No implementar payload Woo/ACF sin comparar antes producto referencia vs producto generado.
- No asumir que Woo REST `meta_data` hidrata ACF por completo.
- No asumir que `termId` basta para campos ACF Taxonomy.
- No depender de `wc-terms-mvp.ts` mas alla del MVP.
- No cerrar taxonomias como resueltas si solo se valido `wp_postmeta`.
- No publicar productos de prueba si contienen datos falsos usados por limitaciones temporales de IDs.
- Si aparecen 2+ capas no previstas, parar y escalar a estrategia.

---

## 7. Definicion de sesion limpia

- Objetivo unico.
- Scope cerrado.
- Fixture definido antes del codigo.
- Validacion definida antes del codigo.
- Capas de datos identificadas.
- Stop-loss aplicado.
- Maximo 1 iteracion de patch antes de reabrir diagnostico.
- Cierre documental proporcional.

---

## 8. Definicion de sesion sucia

- Fallos emergentes no previstos.
- Diagnostico que cambia varias veces.
- Microparches encadenados.
- Validacion parcial sin fixture completo.
- El agente descubre arquitectura durante implementacion.
- Cada patch aumenta complejidad en vez de reducir incertidumbre.

---

## 9. Implicacion para S023

S023 no debe empezar como implementacion directa. Antes de `STUDIO_WC_TAXONOMY_AND_CATEGORY_MANAGER`, hace falta una revision Opus Max que defina arquitectura target de terminos/categorias, reemplazo de `wc-terms-mvp.ts`, fuente de verdad de taxonomias, gestion de jugador, categorias curatoriales, imagenes, stock operativo y frontera manual vs Studio.

Siguiente paso recomendado:

`OPUS_STRATEGY_REVIEW_BEFORE_S023_IMPLEMENTATION`
