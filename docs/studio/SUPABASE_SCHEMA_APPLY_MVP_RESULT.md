# SUPABASE_SCHEMA_APPLY_MVP_RESULT

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-27
**Sesion:** 020C - SUPABASE_SCHEMA_APPLY_MVP
**Proyecto Supabase:** catenaccio-studio
**Modo:** SUPABASE_SCHEMA_APPLY_MVP / CONTROLLED_REMOTE_DB_WRITE / NO_APP_CODE
**Veredicto:** STOP_MANUAL_APPLY_REQUIRED

---

## 1. Resultado

El schema MVP de Catenaccio Studio fue validado localmente de forma estatica, pero no fue aplicado por Codex porque no existe una via local segura ya configurada:

- Supabase CLI: no disponible localmente.
- `psql`: no disponible localmente.
- No se pidieron ni imprimieron tokens, database password, connection strings, anon key ni service role key.
- `.env.local` no fue abierto ni modificado.

Resultado SQL remoto: **NOT_EXECUTED_BY_CODEX**.

El metodo requerido para continuar es aplicacion manual por Pablo en Supabase Dashboard:

1. Abrir Supabase -> Project `catenaccio-studio` -> SQL Editor -> New query.
2. Copiar el contenido completo de `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`.
3. Ejecutar `Run` una sola vez.
4. Devolver solo `success` o el nombre del error visible, sin claves ni connection strings.
5. Si el apply pasa, ejecutar `scripts/studio/verify_supabase_schema_mvp.sql` y devolver solo filas PASS/FAIL.

---

## 2. Validacion local del SQL canonico

Archivo revisado: `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`.

Resumen esperado detectado:

| Objeto | Conteo |
|--------|--------|
| Enums | 7 |
| Tablas | 6 |
| Indices `CREATE INDEX` | 18 |
| Vistas | 1 (`inventory_margins`) |
| RLS enabled | 6 tablas |
| Policies | 6 |

Objetos esperados:

- Enums: `item_status`, `photo_status`, `ai_suggestion_status`, `wc_sync_status`, `vinted_status`, `sale_channel`, `lifecycle_trigger`.
- Tablas: `workspaces`, `inventory_items`, `football_shirt_details`, `ai_suggestions`, `item_lifecycle_events`, `media_assets`.
- Vista: `inventory_margins`.
- RLS/policies: policy owner por tabla con `auth.uid() = owner_id`.

Checks estaticos:

- No se detectaron `DROP TABLE`, `DROP TYPE`, `DROP SCHEMA`, `TRUNCATE` ni `DELETE FROM`.
- No hay seed activo: el seed de `workspaces` esta comentado y contiene placeholder documental.
- `owner_id` existe en las tablas principales.
- RLS esta habilitado para las 6 tablas principales.
- No se detectaron credenciales reales en el SQL canonico.

---

## 3. Cleanup WooCommerce test product

Pablo confirmo manualmente: producto test ID `1853` eliminado manualmente.

Estado documentado: **COMPLETED_MANUAL_CLEANUP**.

Codex no ejecuto `DELETE` por API ni toco WooCommerce en esta sesion.

---

## 4. Verificacion realizada

Realizada en esta sesion:

- Preflight git limpio y sincronizado.
- Lectura proporcional de BACKLOG, CONTEXTO, HISTORIAL 019/020/020B, DEC-13/DEC-14, AGENTS, ORCHESTRATOR y documentos Studio relevantes.
- Revision estatica del SQL canonico.
- Creado SQL read-only de verificacion post-apply: `scripts/studio/verify_supabase_schema_mvp.sql`.

No realizada:

- Apply remoto en Supabase.
- Verificacion remota de tablas/enums/vista/RLS.
- Seed de workspace.

---

## 5. Que no se toco

- WordPress.
- WooCommerce.
- Productos WC, salvo documentar el cleanup manual ya confirmado por Pablo.
- Pedidos, clientes, pagos.
- Plugins, temas, cPanel.
- Vercel.
- App Next.js.
- `.env.local`, `.env` ni credenciales.
- SQL canonico `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`.

---

## 6. Siguiente paso

Pablo aplica manualmente `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql` en Supabase SQL Editor y devuelve el resultado visible.

Si el apply y la verificacion read-only pasan, cerrar el gate con `APPROVE_READY_FOR_S021_MVP_SCAFFOLD` y abrir S021 - `STUDIO_MVP_SCAFFOLD`.

---

## Manual apply confirmation - 2026-06-27

- Applied by: Pablo, manually in Supabase SQL Editor.
- Canonical SQL: `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`.
- Apply result: SUCCESS.
- Verify script: `scripts/studio/verify_supabase_schema_mvp.sql`.
- Verify result: OPERATOR_CONFIRMED_PASS.
- Evidence: Pablo reported "Todo ha pasado"; screenshot showed apply success and indexes check `18 / PASS`.
- Secrets shared: NO.
- Agent executed SQL: NO.
- Status: APPROVE_READY_FOR_S021_MVP_SCAFFOLD.
