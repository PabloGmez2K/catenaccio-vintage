# STUDIO_WC_TAXONOMY_SYNC_RESULT - S023A

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-29
**Sesion:** S023A - WC_TAXONOMY_CATEGORY_READ_SYNC
**Modo:** IMPL / READ_ONLY_WC / ADDITIVE_SUPABASE_SCHEMA / NO_WOO_WRITE / NO_PUBLISH
**Agente:** Codex
**Veredicto funcional:** APPROVE_READY_FOR_S023B

---

## 1. Resultado

S023A implementa la base tecnica para cachear en Supabase el vocabulario vivo de WooCommerce:

- `pa_equipo` (attribute id 4)
- `pa_liga` (attribute id 5)
- `pa_jugador` (attribute id 6)
- `pa_ano` (attribute id 7)
- categorias de producto WooCommerce

El sync contra WooCommerce es estrictamente read-only: solo `GET`. No hay endpoints de escritura a Woo en esta sesion.

Tras validacion manual de Pablo, S023A queda cerrado como `APPROVE_READY_FOR_S023B`.

Validacion manual confirmada:

- SQL aplicado en Supabase: PASS.
- Sync ejecutada desde Studio: PASS.
- Respuesta de sync: `ok=true`, `wc_get_called=true`, `wc_post_called=false`.
- Verificador SQL: PASS completo.
- `wc_categories`: 5 filas.
- `wc_taxonomies`: 4/4 requeridas (`pa_equipo`, `pa_liga`, `pa_jugador`, `pa_ano`).
- `wc_terms pa_equipo`: 22 filas.
- `wc_terms pa_liga`: 6 filas.
- `wc_terms pa_jugador`: 18 filas.
- `wc_terms pa_ano`: 19 filas.
- Terminos conocidos: Real Madrid -> 70 PASS; FC Barcelona -> 170 PASS; 2014-15 -> 139 PASS.

---

## 2. Archivos creados

| Archivo | Rol |
|---------|-----|
| `docs/studio/STUDIO_WC_TERM_CACHE_SCHEMA.sql` | SQL canonico para crear `wc_taxonomies`, `wc_terms`, `wc_categories` en Supabase. Lo aplica Pablo manualmente. |
| `studio/lib/wc/taxonomy-sync.ts` | Servicio server-side: lee atributos/terminos/categorias por GET y hace upsert en Supabase. |
| `studio/app/inventory/sync/route.ts` | Endpoint autenticado `POST /inventory/sync` para disparar el sync. |
| `scripts/studio/verify_wc_term_cache.sql` | Verificador SQL read-only para ejecutar tras el sync. |
| `docs/studio/STUDIO_WC_TAXONOMY_SYNC_RESULT.md` | Este resultado/runbook. |

## 3. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `studio/lib/types.ts` | Tipos de filas cacheadas: `WcTaxonomyCacheRow`, `WcTermCacheRow`, `WcCategoryCacheRow`. |
| `BACKLOG.md` | S023A queda completado como `APPROVE_READY_FOR_S023B`. |
| `CONTEXTO.md` | Append de sesion. |
| `HISTORIAL_SESIONES.md` | Append de sesion. |
| `agent_events.jsonl` | Evento JSONL de cierre. |

---

## 4. DATA_LAYER_MAPPING_GATE

**Resultado:** PASS.

| Dato | Woo source | Supabase cache | Capa runtime futura | No se modifica |
|------|------------|----------------|---------------------|----------------|
| Taxonomias `pa_*` | `GET /wc/v3/products/attributes` | `wc_taxonomies` | S023B form/bridge lee cache | atributos Woo |
| Terminos por taxonomia | `GET /wc/v3/products/attributes/{id}/terms` | `wc_terms` | S023B resuelve term ID + label | terminos Woo |
| Categorias producto | `GET /wc/v3/products/categories` | `wc_categories` | S023E selector categoria | categorias Woo |

No hay capa desconocida. No se toca payload Woo, ACF, `wp_postmeta`, companion keys, `wp_term_relationships`, Rank Math ni Filtro Camisetas Pro.

---

## 5. Como aplicar y probar

### Paso 1 - Pablo aplica SQL

En Supabase SQL Editor, ejecutar:

```sql
-- docs/studio/STUDIO_WC_TERM_CACHE_SCHEMA.sql
```

Esto solo crea tablas nuevas y politicas RLS nuevas para esas tablas. No modifica `inventory_items`, `football_shirt_details` ni tablas existentes.

### Paso 2 - Pablo dispara sync desde Studio

Con Studio corriendo y sesion autenticada:

```bash
cd studio
npm run dev
```

En otra terminal, llamar al endpoint autenticado conservando cookies de navegador o usar la herramienta HTTP que ya tenga la sesion:

```http
POST http://localhost:3000/inventory/sync
```

Respuesta esperada:

```json
{
  "ok": true,
  "summary": {
    "taxonomies": [
      { "attributeId": 4, "slug": "pa_equipo", "terms": 21 },
      { "attributeId": 5, "slug": "pa_liga", "terms": 6 },
      { "attributeId": 6, "slug": "pa_jugador", "terms": 0 },
      { "attributeId": 7, "slug": "pa_ano", "terms": 18 }
    ],
    "categories": 5,
    "wcGetCalled": true,
    "wcPostCalled": false
  }
}
```

Los counts exactos pueden variar si WooCommerce ya cambio. Lo importante es que coincidan con el vocabulario actual de Woo.

### Paso 3 - Pablo ejecuta verificador SQL

En Supabase SQL Editor:

```sql
-- scripts/studio/verify_wc_term_cache.sql
```

Confirmar PASS en:

- `wc_taxonomies_required_4_5_6_7`
- `wc_terms_pa_equipo_has_rows`
- `wc_terms_pa_ano_has_rows`
- `wc_categories_has_rows`
- `known_term_real_madrid_70`
- `known_term_fc_barcelona_170`
- `known_term_2014_15_139`

---

## 6. Que NO se toco

- No se llamo `POST`, `PUT`, `PATCH` ni `DELETE` a WooCommerce.
- No se modificaron productos WooCommerce.
- No se crearon terminos WooCommerce.
- No se crearon categorias WooCommerce.
- No se abrio WP Admin.
- No se modifico Supabase remoto desde el agente.
- No se modifico `.env.local`.
- No se toco `studio/lib/wc/client.ts`.
- No se toco `studio/lib/wc/bridge.ts`.
- No se toco `studio/lib/wc-terms-mvp.ts`.
- No se toco `studio/components/ItemForm.tsx`.
- No se publico nada.

---

## 7. Riesgos

| Riesgo | Mitigacion |
|--------|------------|
| SQL no aplicado antes de disparar sync | El endpoint devolvera error Supabase de tabla ausente. Aplicar SQL primero. |
| Credenciales WC ausentes en entorno local | El endpoint devuelve `missing_credentials` sin llamar a Woo. |
| Cookie/sesion ausente | El endpoint devuelve `auth_required` y no llama a Woo. |
| Counts cambian en Woo | Usar count real actual de Woo; no hardcodear cierre funcional a valores historicos si Woo ya cambio. |

---

## 8. Validacion local de agente

Validaciones locales seguras:

- `npm run typecheck`: PASS
- `npm run build`: PASS (8 rutas)
- `npm run lint`: PASS (0 warnings/errors; aviso de deprecacion de `next lint`)
- `git diff --check`: PASS
- JSONL: PASS (63 lineas validas)
- Secret scan: CLEAN (sin tokens/credenciales reales en archivos nuevos ni diff)

No se ejecuto sync real desde el agente. No se llamo WooCommerce.

---

## 9. Cierre y siguiente paso

Pablo confirmo las seis condiciones de cierre:

1. SQL aplicado en Supabase.
2. Sync ejecutado correctamente.
3. Verificador SQL PASS.
4. `wc_post_called=false`.
5. Ningun producto modificado.
6. Nada publicado.

S023A queda `APPROVE_READY_FOR_S023B`.

Siguiente bloque: S023B - `TERM_CACHE_BACKED_OPTIONS`. No se abre en esta sesion.
