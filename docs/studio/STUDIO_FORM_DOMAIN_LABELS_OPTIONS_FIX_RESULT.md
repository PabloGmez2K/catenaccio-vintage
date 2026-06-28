# STUDIO_FORM_DOMAIN_LABELS_OPTIONS_FIX_RESULT

Fecha: 2026-06-28
Sesión: 022A.2C
Agente: Claude Code Sonnet
Modo: LOCAL_APP_PATCH / NO_DEPLOY / NO_WC / NO_AI
Resultado: READY_FOR_PABLO_VALIDATION
Veredicto: READY_FOR_PABLO_LOCAL_FORM_OK

---

## Qué se ajustó

### Autenticidad visible

- Eliminado "Replica" como label visible en UI. Ahora la opción se llama **"Original retail / Fan version"**.
- El valor interno almacenado sigue siendo `'Replica'` para backward compatibility con registros existentes en DB.
- Nuevo campo `value?: string` en `TermOption` que desacopla label visible del valor guardado.
- El select de Autenticidad usa `value={o.value ?? o.label}` para cada option.
- Lista completa de opciones de autenticidad:
  1. Original retail / Fan version (default; valor interno: Replica; omitido en título)
  2. Deadstock / BNWT (titleLabel: Deadstock)
  3. Match Issue
  4. Match Worn
  5. No determinado (omitido en título)
  6. Official Reissue
  7. Player Issue / Authentic (titleLabel: Player Issue)
- Helper text bajo el campo: explica que "Original retail / Fan version" no significa falsa, y cuándo usar cada opción.

### Términos manuales

- **Liga**: convertido de `<select>` cerrado a `<input type="text" list="liga-list">` (datalist libre). Pablo puede elegir de la lista o escribir un valor nuevo.
- **Marca**: convertido de `<select>` a `<input type="text" list="marca-list">`. Se elimina la opción "Otra" (innecesaria con datalist libre).
- **Equipo** y **Temporada**: ya eran datalist libres; se mantienen.
- Helper text añadido en Liga, Equipo y Marca: "Si no aparece en la lista, puedes escribirlo. Studio lo guardará como pendiente de mapeo para Woo."
- Studio guarda `display` label + `termId` vacío si no hay coincidencia. No crea nada en Woo. S022C gestionará el bloqueo de publicación.

### Orden alfabético

- `ligaOptions`: alfabético, con "Sin liga / Selección nacional" fijo al inicio.
- `equipoOptions`: alfabético completo (AC Milan → West Ham United).
- `marcaOptions`: alfabético (Adidas → Under Armour); opción "Otra" eliminada.
- `condicionOptions`: alfabético (Aceptable → Muy buena).
- `productTypeOptions`: alfabético (Accessories → Tracksuit).
- `shirtVersionOptions`: alfabético (Away → Training).
- `authenticityTypeOptions`: "Original retail / Fan version" primero (default), resto alfabético.
- `tallaOptions`: orden de escala mantenido (XS → Única) — intencional, no alfabético.
- `sleeveLengthOptions`: Short Sleeve / Long Sleeve — orden convencional mantenido.

### Canonical label vs title label

- `TermOption` extendido con campos opcionales: `value?`, `titleLabel?`, `helpText?`.
- Nueva función exportada `getTitleLabel(options, input): string` en `wc-terms-mvp.ts`:
  - Busca por label, value (interno) o alias.
  - Devuelve `titleLabel` si está definido en el match; `''` significa omitir en título; `undefined` en titleLabel devuelve el input tal cual.
- Equipos con `titleLabel` definido:
  - **PSV Eindhoven** → titleLabel: `'PSV'`
  - **Paris Saint-Germain** → titleLabel: `'PSG'`
  - Bayern Munich, Manchester United: sin titleLabel (label ya es suficientemente corto).
- `ItemForm.tsx` usa `getTitleLabel(equipoOptions, equipoDisplay)` y `getTitleLabel(authenticityTypeOptions, authenticityType)` al computar el título.
- Ejemplo: `2004-05 PSV Home Shirt (XL)` ✓

### Selecciones nacionales

- Todas las selecciones del scope ya estaban en `equipoOptions`. Confirmadas:
  Alemania, Argentina, Brasil, Colombia, España, Francia, Inglaterra, Italia, Países Bajos, Paraguay, Portugal, Uruguay.
- Helper text bajo campo Liga: "Para selecciones nacionales, usa Liga = Sin liga / Selección nacional y Equipo = España, Francia, Brasil, Argentina…"
- No se añade campo `team_type`. Queda FUTURE.

### Leyendas / collections futuras

- NO implementado.
- Documentado como `FUTURE_COLLECTIONS_AND_LEGENDS_LANDINGS` en BACKLOG.md.
- Las landings tipo "Leyendas" se tratarán como colecciones/tags editoriales curadas en el futuro, no como taxonomías de Liga/Equipo.

---

## Qué NO se tocó

- Schema SQL: sin cambios.
- WooCommerce API: no tocada.
- WordPress / WP Admin: no tocado.
- Anthropic API: no tocada.
- Vercel / cPanel: no tocado.
- Supabase SQL / CLI / psql: no usado.
- .env.local: no leído ni modificado.
- service_role: no usado.
- Secretos: no expuestos.
- S022B: continúa BLOQUEADO.

---

## Archivos modificados

- `studio/lib/wc-terms-mvp.ts` — TermOption extendida, opciones reordenadas, getTitleLabel exportada
- `studio/lib/title-builder.ts` — comentario actualizado (comportamiento previo mantenido)
- `studio/components/ItemForm.tsx` — Liga/Marca → datalist, helpers, getTitleLabel en computedTitle, auth value desacoplado
- `studio/app/inventory/actions.ts` — esReplica reconoce también "Original retail / Fan version"
- `studio/styles/globals.css` — clase `.field-help` añadida

---

## Validaciones

- `npm run typecheck`: OK (0 errores)
- `npm run build`: OK (build exitoso, 8 páginas generadas)
- `npm run lint`: OK (0 warnings ni errors)
- `git diff --check`: exit 0
- JSONL: línea válida appended
- Secret scan: limpio
- Scope check: sin schema, sin Woo, sin WP, sin Anthropic, sin .env.local

---

## Validación manual de Pablo

Pendiente. Pablo debe:
1. Abrir `http://localhost:3000/inventory/new`
2. Verificar que "Replica" ya no aparece en Autenticidad; aparece "Original retail / Fan version"
3. Verificar que puede escribir una liga manual (ej: "Superliga China") y guardar
4. Verificar que puede escribir una marca manual (ej: "Errea") y guardar
5. Verificar que PSV Eindhoven genera título con "PSV" (no "PSV Eindhoven")
6. Verificar helper text bajo Liga para selecciones nacionales
7. Verificar que crear/editar sigue funcionando sin errores

---

## Siguiente paso

Pablo responde `PABLO_LOCAL_FORM_OK` o lista blockers concretos.
Si OK → S022B se desbloquea.
