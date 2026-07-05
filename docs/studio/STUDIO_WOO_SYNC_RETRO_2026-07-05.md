# STUDIO_WOO_SYNC_RETRO_2026-07-05

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-07-05
**Modo:** DOCS_ONLY / CLOSE_AND_RETRO / NO_CODE / NO_DEPLOY / NO_PUSH / NO_WOO_WRITE
**HEAD de referencia:** `530cc3e` (`fix(studio): operative edit surface -- taxonomy sync UI, commercial price block, SEO inside edit, explainable brand, photo access`)
**Estado:** bloque tecnico `DONE_LOCAL`; MVP de stock manager todavia no validado.

---

## 1. Estado real al cierre

El bloque largo de Studio Woo Sync deja una base tecnica local importante:

- Catalogo Woo visible desde Studio.
- Linking Studio <-> Woo.
- Venta local y tracking manual de Vinted.
- Foundation de writes controlados Studio -> Woo implementada, con preview, confirmacion y log, pero sin prueba real ejecutada por agente.
- Contrato canonico Woo <-> Studio (`woo-studio-sync-contract.ts`).
- Rehidratacion Woo -> Studio.
- UI de sync de taxonomias.
- Bloque comercial `Precio y coste` dentro de Editar.
- SEO manual disponible dentro de Editar.
- Marca explicable.
- Acceso a fotos desde Editar.
- Validaciones tecnicas PASS en los bloques de implementacion.
- Criticos frescos adversariales sin blockers al final del ultimo bloque.

Lo que NO queda validado:

- MVP completo de stock manager.
- Push.
- Deploy.
- Writes reales a Woo desde la nueva foundation.
- La descripcion de producto como campo operativo final con paridad WordPress.

---

## 2. Por que costo demasiados tokens

La sesion gasto demasiado presupuesto porque el objetivo real no era "mapear Woo". El objetivo era que Pablo pudiera operar escenarios reales desde Studio:

1. abrir una ficha;
2. editar precio;
3. editar descripcion;
4. guardar;
5. ver diff;
6. sincronizar Woo con control.

El trabajo empezo resolviendo inconsistencias de datos campo a campo, despues se consolido en un contrato canonico y finalmente bajo a operabilidad real. El salto correcto aparecio cuando la barra de DONE dejo de ser tecnica y paso a ser un flujo de usuario.

Leccion principal: para bloques de Studio con Woo, la barra de DONE debe expresarse como escenarios operativos, no como componentes o mappers.

---

## 3. Que funciono

- Fable/Opus funcionaron mejor cuando recibieron objetivo amplio, house rules, DONE bar y critico fresco.
- El revisor adversarial antes de la prueba de Pablo encontro blockers reales y redujo microparches posteriores.
- La capa de writes controlados fue el enfoque correcto: preview, confirmacion, log y una accion = un producto.
- El contrato canonico corto la espiral de hidratacion campo a campo.
- La prueba real de Pablo fue la senal de producto que revelo el fallo de operabilidad: la pantalla existia tecnicamente, pero el flujo no estaba donde el operador lo esperaba.

---

## 4. Que no funciono

- "Inventario" y "Catalogo web" como superficies separadas no encajaron como modelo mental. Studio debe sentirse como inventario unico; Auditoria web puede existir, pero no como segundo lugar para operar el producto.
- Poner datos importantes en notas internas o paneles auxiliares no sustituye campos editables.
- El precio dentro de SEO fue un olor de modelo: el precio es dato comercial, no contenido.
- El panel SEO duplicado dentro/fuera de Editar creo ambiguedad operativa.
- Antes de implementar UI grande faltaron pantallas y escenarios operativos escritos de forma concreta.

---

## 5. Nuevo blocker: descripcion con paridad WordPress

Pablo detecta `STUDIO_PRODUCT_DESCRIPTION_EDITOR_WP_PARITY`.

La observacion es correcta: WooCommerce/WordPress no modela esto como "contenido SEO manual" duplicado. Tiene:

- `description` / `post_content`: Descripcion del producto.
- `short_description` / `post_excerpt`: Descripcion corta del producto.
- editor Visual/Texto;
- autosave/revision awareness en WP Admin.

Studio debe mapear esos campos reales, no inventar un panel paralelo con nombre interno. El siguiente bloque debe convertir el contenido SEO en una superficie de descripcion de producto con paridad Woo:

- ver contenido activo de Woo;
- editarlo desde Studio;
- generar HTML limpio con prompt ChatGPT/Claude;
- guardar draft/aprobado en Studio sin tocar Woo;
- mostrar diff Studio vs Woo;
- sincronizar a Woo solo con confirmacion.

Precio queda fuera del bloque SEO/descripcion.

---

## 6. Decisiones para el siguiente prompt

El siguiente bloque se abre como:

`STUDIO_PRODUCT_DESCRIPTION_EDITOR_WP_PARITY`

Debe ser un bloque de producto/operabilidad, no un microfix de copy.

Contrato recomendado:

- leer primero `docs/studio/STUDIO_PRODUCT_DESCRIPTION_EDITOR_WP_PARITY_BRIEF.md`;
- no implementar campos nuevos hasta confirmar donde vive el contenido aprobado actual (`ai_suggestions`, snapshot Woo, o columnas existentes);
- no tocar Woo por defecto: primero Studio local + preview/diff;
- cualquier write a Woo mantiene las house rules de `STUDIO_WOO_WRITE_SYNC_RESULT.md`;
- si hay UI visible, aplicar `STUDIO_MVP_FEATURE_DONE_GATE`;
- validar con Pablo el flujo completo antes de cerrar como DONE.

---

## 7. Barras de no-regresion

El siguiente bloque no debe romper:

- DRAFT_ONLY del bridge de creacion.
- Whitelist del write-client.
- Idempotencia por `wc_product_id`.
- Registro en `item_lifecycle_events` para cualquier write real.
- Separacion entre lectura viva Woo, draft Studio y sync confirmado.
- Precio en bloque comercial, no en SEO.
- Inventario unico como modelo mental.

---

## 8. Validacion de esta sesion

Esta sesion es documental. No requiere build.

Validaciones esperadas:

- `git diff --check`
- JSONL valido si se toca `agent_events.jsonl`
- no modificar codigo bajo `studio/`
- no llamadas a Woo/Supabase/Vercel
