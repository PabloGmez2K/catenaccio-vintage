# STUDIO_WC_WRITE_ACCESS_TEST_PLAN — Plan de Test de Escritura WC API

Plan controlado para verificar que el bridge puede crear un producto borrador en WooCommerce. **No ejecutar en esta sesión (S020). Ejecutar en S020-test con Pablo presente.**

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-27  
**Sesión:** 020 — STUDIO_WC_BRIDGE_CONTRACT (diseño del test, no ejecución)  
**Modo:** DOCS_ONLY — test NO ejecutado en esta sesión  
**Depende de:** `STUDIO_WC_BRIDGE_CONTRACT.md`, `STUDIO_WC_PAYLOAD_SPEC.md`, `API_READONLY_PROBE_RESULT.md`  
**Nombre del test:** `WC_API_WRITE_ACCESS_TEST`

---

## 1. Propósito

Verificar que:
1. El usuario `catenaccio-studio-agent` (rol `shop_manager`) tiene permisos para `POST /wc/v3/products`.
2. El payload de Studio crea correctamente un producto con `status=draft`.
3. Los campos `meta_data` (liga, equipo, etc.) se almacenan correctamente y son visibles en WP Admin.
4. El bridge puede leer el `id` de respuesta y registrarlo.
5. No se publican productos accidentalmente.
6. El producto de prueba puede eliminarse limpiamente.

---

## 2. Precondiciones (todas deben cumplirse antes de ejecutar)

| Precondición | Cómo verificar | Responsable |
|-------------|---------------|------------|
| `.env.local` con `WP_SITE_URL`, `WP_APP_USER`, `WP_APP_PASSWORD` configurados | `cat .env.local | grep WP_` (no imprimir en chat) | Pablo |
| Credenciales de `catenaccio-studio-agent` activas (Application Password válida) | `GET /wp-json/wp/v2/users/me` responde 200 | Agente |
| Term IDs de pa_equipo, pa_ano resueltos (al menos 2-3 para el test) | Tablas de `STUDIO_WC_TERM_ID_RESOLUTION_PLAN.md` actualizadas | Agente |
| Bridge service implementado (Next.js Server Action o script temporal) | S021 scaffold presente | Agente |
| Pablo disponible para verificar en WP Admin y hacer cleanup | — | Pablo |
| No hay tareas pendientes de email transaccional activas | PATTERN-08 check | Agente |

---

## 3. Producto de prueba — datos

El producto de prueba debe ser **inequívocamente identificable** como test y no confundirse con un producto real.

```json
{
  "name": "[STUDIO TEST] Catenaccio Bridge Draft — DELETE ME",
  "type": "simple",
  "status": "draft",
  "regular_price": "1",
  "description": "<p>[STUDIO TEST] Este producto es una prueba de integración del puente Catenaccio Studio → WooCommerce. Fue creado automáticamente en la sesión WC_API_WRITE_ACCESS_TEST. BORRAR después de verificar. No publicar.</p>",
  "short_description": "",
  "stock_status": "instock",
  "manage_stock": false,
  "meta_data": [
    { "key": "liga",                    "value": "72" },
    { "key": "equipo",                  "value": "129" },
    { "key": "ano_temporada",           "value": "139" },
    { "key": "talla",                   "value": "L" },
    { "key": "condicion",               "value": "Excelente" },
    { "key": "jugador",                 "value": "" },
    { "key": "descripcion_del_producto","value": "<p>[STUDIO TEST] Prueba de integración. BORRAR.</p>" }
  ]
}
```

**Valores usados:**
- `liga=72` → LaLiga (confirmado en probe)
- `equipo=129` → Francia (confirmado en probe — se usa como dummy de test, no importa la coherencia)
- `ano_temporada=139` → temporada 2014-15 (confirmado en probe)
- `regular_price="1"` → precio simbólico para evitar confusión con productos reales
- `status=draft` → borrador, invisible para clientes

---

## 4. Request esperada

```
POST https://catenacciovintage.com/wp-json/wc/v3/products
Authorization: Basic [base64(WP_APP_USER:WP_APP_PASSWORD)]
Content-Type: application/json

{ver payload de §3}
```

---

## 5. Response esperada (HTTP 201 — PASS)

```json
{
  "id": <integer>,
  "name": "[STUDIO TEST] Catenaccio Bridge Draft — DELETE ME",
  "status": "draft",
  "type": "simple",
  "regular_price": "1",
  "meta_data": [
    { "id": <int>, "key": "liga",                    "value": "72" },
    { "id": <int>, "key": "equipo",                  "value": "129" },
    { "id": <int>, "key": "ano_temporada",           "value": "139" },
    { "id": <int>, "key": "talla",                   "value": "L" },
    { "id": <int>, "key": "condicion",               "value": "Excelente" },
    { "id": <int>, "key": "jugador",                 "value": "" },
    { "id": <int>, "key": "descripcion_del_producto","value": "<p>[STUDIO TEST] Prueba..." }
  ],
  ...
}
```

---

## 6. Verificaciones post-test (antes de cleanup)

| Verificación | Cómo | PASS si |
|-------------|------|---------|
| Producto existe en WP Admin | Pablo abre WP Admin → Productos → Borradores | Aparece con nombre "[STUDIO TEST]..." |
| Status es draft | WP Admin → ver producto | Status = "Borrador" / "Draft" |
| `regular_price` correcto | WP Admin → ver producto | Precio = €1,00 |
| `meta_data.liga` = "72" | API: `GET /wc/v3/products/{id}` → `meta_data` | key=liga, value="72" |
| `meta_data.equipo` = "129" | API: `GET /wc/v3/products/{id}` → `meta_data` | key=equipo, value="129" |
| `meta_data.talla` = "L" | API: `GET /wc/v3/products/{id}` → `meta_data` | key=talla, value="L" |
| Producto NO visible en tienda pública | Navegar a `catenacciovintage.com/tienda/` | No aparece en listado |
| No se enviaron emails transaccionales | Revisión rápida en WP Admin → Logs o cuentas de email | Sin emails |
| `wc_product_id` registrado en Studio (futuro) | Supabase → inventory_items | Campo poblado con el ID |

---

## 7. Paso a paso del test

1. **Agente:** preparar el payload de prueba (§3 de este documento).
2. **Agente:** verificar precondiciones (credenciales activas, term IDs listos).
3. **Agente:** ejecutar `POST /wc/v3/products` con el payload de prueba.
4. **Agente:** registrar el `id` de respuesta.
5. **Agente:** ejecutar `GET /wc/v3/products/{id}` → confirmar que el producto existe y status=draft.
6. **Agente:** reportar a Pablo: "Borrador creado con ID {id}. Por favor verifica en WP Admin."
7. **Pablo:** verifica en WP Admin → Productos → Borradores.
8. **Pablo:** confirma que los campos se ven correctamente.
9. **Agente + Pablo:** ejecutar verificaciones de §6.
10. **Pablo:** eliminar el producto de prueba (ver §8 cleanup).
11. **Agente:** confirmar que el producto ya no existe → `GET /wc/v3/products/{id}` → 404.
12. **Agente:** registrar resultado del test (PASS/FAIL) en `agent_events.jsonl`.

---

## 8. Cleanup del producto de prueba

**Método preferido (manual — seguro):**
1. Pablo abre WP Admin → Productos.
2. Busca "[STUDIO TEST]" en el buscador de productos.
3. Selecciona el producto → Mover a papelera.
4. Opcionalmente: Papelera → Eliminar permanentemente.

**Método alternativo (API — solo si Pablo lo autoriza explícitamente en la sesión de test):**
```
DELETE https://catenacciovintage.com/wp-json/wc/v3/products/{id}?force=false
```
- `force=false` → mover a papelera (no elimina permanentemente). Preferido.
- `force=true` → eliminar permanentemente. Solo si Pablo lo autoriza explícitamente.

**Acción del agente:** no ejecutar el DELETE automáticamente. Esperar confirmación explícita de Pablo. Si Pablo prefiere hacerlo manualmente desde WP Admin, no ejecutar nada.

---

## 9. Criterio PASS / FAIL

### PASS — `WC_API_WRITE_ACCESS_TEST_PASSED`

Se emite PASS si se cumplen **todos** los criterios:
- HTTP 201 en el POST
- `status=draft` en la response
- `id` presente y es un integer positivo
- `meta_data` contiene todos los campos enviados con sus valores correctos
- Pablo confirma que el producto es visible en WP Admin como borrador
- El producto NO es visible en la tienda pública
- No se dispararon emails transaccionales
- Cleanup completado (producto eliminado)

**Consecuencia de PASS:** S021 desbloqueado — implementar bridge real.

### FAIL — `WC_API_WRITE_ACCESS_TEST_FAILED`

Se emite FAIL si cualquiera de estos ocurre:
- HTTP 401 / 403 → problema de autenticación o permisos insuficientes
- HTTP 422 → payload inválido (ver errores en `STUDIO_WC_BRIDGE_ERROR_HANDLING.md`)
- HTTP 500 → error de servidor WC
- `status` en response no es `"draft"` → bug crítico, escalate
- `meta_data` no contiene los campos enviados → problema de ACF/WC compat
- Producto visible en tienda pública → STOP inmediato, diagnóstico urgente

**Consecuencia de FAIL:** diagnosticar según `STUDIO_WC_BRIDGE_ERROR_HANDLING.md`. No proceder a S021 hasta resolver.

---

## 10. Stop conditions — abortar el test si...

| Condición | Acción |
|-----------|--------|
| Credenciales no disponibles (`.env.local` incompleto) | STOP — Pablo configura primero |
| HTTP 200 en POST (no 201) | STOP — investigar respuesta |
| `status=publish` en response | STOP CRÍTICO — diagnóstico urgente, no continuar |
| Response contiene campos de pago o pedido inesperados | STOP — revisar payload |
| Emails enviados a clientes | STOP CRÍTICO — PATTERN-08, escalate a Pablo |
| Pablo no puede verificar en WP Admin | DEFER — reprogramar con Pablo presente |

---

## 11. Qué registrar en Studio si el test fuera real

Si el test se ejecutara con un item real de Studio (en lugar del dummy), los campos a actualizar en Supabase serían:

```
inventory_items.wc_product_id     = <id de response>
inventory_items.wc_status         = 'borrador_creado'
inventory_items.wc_draft_created_at = now()
inventory_items.wc_last_sync_at   = now()
inventory_items.wc_error          = NULL
inventory_items.wc_payload_snapshot = {payload enviado sin secretos}
inventory_items.status            = 'borrador_web'
```

Evento en `item_lifecycle_events`:
```json
{
  "event_type": "wc_sync_ok",
  "from_status": "pendiente_descripcion",
  "to_status": "borrador_web",
  "triggered_by": "agente",
  "payload": { "wc_product_id": <id>, "http_status": 201 }
}
```

---

*Sesión 020 — 2026-06-27 — Claude Code (Sonnet). DOCS_ONLY / NO_REMOTE_WRITE. Test NO ejecutado en esta sesión.*
