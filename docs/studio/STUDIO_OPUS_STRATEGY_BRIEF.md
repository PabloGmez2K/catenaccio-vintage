# STUDIO_OPUS_STRATEGY_BRIEF - Before S023

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-29
**Sesion:** S022C.9 - DOCUMENT_STUDIO_BUILD_SYSTEM_LESSONS_AND_OPUS_BRIEF
**Modo:** DOCS_ONLY / NO_CODE / NO_WC_CALL / NO_DEPLOY
**Veredicto:** READY_FOR_OPUS_STRATEGY_REVIEW

---

## 1. Por que Opus Max esta justificado

Opus Max esta justificado porque el siguiente bloque ya no es un microfix.

S022C valido el puente Studio -> WooCommerce, pero tambien mostro que la integracion Studio/Woo/ACF depende de decisiones arquitectonicas:

- Donde vive la fuente de verdad de taxonomias y categorias.
- Como reemplazar el mapa provisional `wc-terms-mvp.ts`.
- Como crear, sincronizar y cachear terminos reales.
- Que queda manual en MVP y que entra en Studio.
- Como evitar nuevas sesiones de patch y prueba sobre capas emergentes.

La tarea de Opus no es implementar. Es definir S023-S030 con arquitectura, gates y criterios de validacion antes de seguir construyendo.

Objetivo operativo: pasar de "patch y probar" a software engineering dentro de Catenaccio Studio.

---

## 2. Estado actual

Estado validado:
- S022C queda tecnicamente validado.
- Studio crea borradores reales WooCommerce.
- El puente no publica.
- `DRAFT_ONLY` funciona.
- `attributes[] + meta_data ACF` queda validado para Liga, Equipo y Ano.
- Precio, talla, condicion, medidas, defectos, categoria e inventario quedan validados en borrador.

Pendiente:
- Jugador/Rivaldo no aparecio: requiere `PLAYER_TERM_RESOLUTION`.
- Imagenes siguen pendientes.
- Categorias curatoriales quedan pendientes: Leyendas, Nuevo, Otros Clubs, Selecciones.
- Taxonomias reales quedan pendientes: creacion/sync/cache de terminos Woo.
- `studio/lib/wc-terms-mvp.ts` es provisional y debe reemplazarse.
- Productos de prueba creados con datos temporales no deben publicarse si contienen datos falsos de equipo/temporada.

---

## 3. Preguntas que Opus debe responder

1. Debe Studio usar WooCommerce como fuente viva para taxonomias y categorias?
2. Debe existir un sync/cache local de terminos?
3. Como se reemplaza `wc-terms-mvp.ts`?
4. Como se gestionan nuevos equipos, jugadores, anos y ligas?
5. Como se gestionan categorias: Otros Clubs, Leyendas, Nuevo, Selecciones?
6. Que queda manual en MVP y que entra en Studio?
7. Cuando se publica desde Studio y cuando se publica desde WP Admin?
8. Como se gestionan imagenes?
9. Como se disena el stock operativo?
10. Como se conectan landings SEO y arquitectura de catalogo?
11. Que productos existentes deben corregirse o ignorarse?
12. Que datos necesita una fixture completa para validar cada fase?

---

## 4. Roadmap provisional

### S023 - Taxonomy/Category Manager

Sync/read de taxonomias Woo, creacion controlada de terminos, reemplazo de `wc-terms-mvp.ts`, `PLAYER_TERM_RESOLUTION` y selector de categorias curatoriales.

### S024 - Product Draft Completeness

SKU/referencia, validacion con fixture completa, batch-PATCH de borradores incompletos si procede y preflight antes de crear borrador.

### S025 - Image Pipeline

Fuente local, subida a WP Media Library o Storage intermedio, orden, imagen principal, asignacion a producto y validacion visual obligatoria.

### S026 - Stock Operations

Estados Studio, unidades unicas, reservas, sincronizacion tras venta y Vinted/manual tracking.

### S027 - Rank Math/SEO Metadata

Title, description, focus keyword, primary category, metadata Rank Math y frontera Studio/manual.

### S028 - Landing Architecture

Landings por equipo/liga/ano/jugador, colecciones editoriales, Leyendas, Selecciones, rutas canonicas y filtros.

### S029 - Published Product Sync

Sync de estado Woo -> Studio, publicado/vendido/stock y drift detection entre Studio y Woo.

### S030 - Controlled Publish Flow

Publish desde Studio vs WP Admin, preflight de publicabilidad, confirmacion Pablo y rollback manual.

---

## 5. Entregable esperado de Opus

Opus debe entregar:

- TARGET architecture de Studio/Woo/ACF.
- Roadmap por fases S023-S030.
- Gates por sesion.
- Superficie recomendada por bloque: Codex, Sonnet, Antigravity u Opus.
- Que NO implementar todavia.
- Criterios de validacion por fase.
- Fixture canonical para pruebas de borrador publicable.
- Stop-loss: cuando parar y replantear.

---

## 6. Criterios de calidad para S023+

- No empezar CODE sin `PRODUCT_REFERENCE_DIFF_GATE`.
- No escribir payload sin `ACF_CONFIG_GATE`.
- No crear manager de terminos sin `DATA_LAYER_MAPPING_GATE`.
- No cerrar con fixture parcial.
- No depender de mapas temporales salvo como compatibilidad migratoria explicitamente marcada.
- No publicar desde Studio hasta que Opus lo apruebe como fase futura.

---

## 7. Recomendacion

Veredicto recomendado:

`READY_FOR_OPUS_STRATEGY_REVIEW`

Siguiente accion:

Abrir una sesion Opus Max estrategica antes de implementar S023.
