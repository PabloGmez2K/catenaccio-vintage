# STUDIO_FORM_DOMAIN_UX_FIX_PLAN

Fecha: 2026-06-28
Sesión: 022A.1
Agente: Claude Code Sonnet
Modo: READ_ONLY_DIAGNOSIS / NO_CODE / NO_REMOTE_WRITE
Veredicto: **FIX_BLOCKER_FIRST_WITH_PLAN**

---

## 1. Resumen ejecutivo

S022A está técnicamente funcional (typecheck/build/lint PASS, crea `inventory_items` + `football_shirt_details`) pero Pablo no lo puede aprobar como producto. El formulario tiene **6 blockers de UX/dominio** que no son pulido cosmético: exponen IDs técnicos, pierden datos del usuario, no modelan correctamente el dominio de la tienda, y no permiten corregir errores. Avanzar a S022B con este formulario produciría `ai_suggestions` sobre datos sucios y obligaría a re-trabajo en S022C.

**Veredicto: FIX_BLOCKER_FIRST_WITH_PLAN.** S022A.2 es la siguiente sesión. S022B sigue bloqueado.

---

## 2. Estado actual de S022A

| Dimensión | Estado |
|-----------|--------|
| Técnico (typecheck/build/lint) | ✅ PASS |
| Flujo básico create → detail | ✅ FUNCIONA |
| UX/dominio | ❌ BLOCKER |
| Pablo validation | ❌ FAILED_DOMAIN_UX |
| Estado en backlog | READY_FOR_PABLO_VALIDATION → FIX_BLOCKER_FIRST |

**Archivos afectados:**
- `studio/components/ItemForm.tsx` — formulario con IDs visibles, sin Versión, sin auto-título
- `studio/app/inventory/actions.ts` — no devuelve values, no tiene updateInventoryItem
- No existe: `/inventory/[id]/edit`, `updateInventoryItem`, `wc-terms-mvp.ts`

---

## 3. Feedback de Pablo

Pablo probó el formulario y detectó estos problemas (ordenados por severidad):

| # | Problema | Severidad |
|---|----------|-----------|
| 1 | Campos "Liga (term ID WC)", "Equipo (term ID WC)", "Temporada (term ID WC)", "Marca (term ID WC)", "Jugador (term ID WC)" visibles y editables | BLOCKER ABSOLUTO |
| 2 | Al fallar la validación el formulario pierde todos los datos — hay que rellenar todo de nuevo | BLOCKER |
| 3 | No puede editar lo que acaba de crear | BLOCKER |
| 4 | Liga, Equipo, Jugador, Temporada son texto libre — pueden crearse "FC Barcelona", "Barcelona", "F.C. Barcelona" como entidades distintas | BLOCKER |
| 5 | El título del producto debe auto-generarse con patrón definido | BLOCKER |
| 6 | No hay campo Versión (Home/Away/Third/etc.) | GAP DE DOMINIO |
| 7 | Las camisetas existentes en la web no aparecen en Studio | ESPERADO — no bloquea S022A.2 |
| 8 | No entiende si el formulario está conectado a WooCommerce | CONFUSIÓN DE UX |

---

## 4. Diagnóstico de dominio

### 4.1 Causa raíz de los IDs visibles

El formulario actual (ItemForm.tsx líneas 153–289) muestra pares de campos para cada taxonomía:
```
Liga (nombre) → text input
Liga (term ID WC) → text input   ← INACEPTABLE
```

Esto ocurrió porque el schema de `football_shirt_details` almacena tanto el display (`liga_display`) como el term ID numérico (`liga`), y el formulario los expuso ambos directamente sin capa de resolución.

### 4.2 Causa raíz de la pérdida de formulario

`ItemForm.tsx` usa `useActionState` con inputs no controlados (`defaultValue` vacío o hardcoded). En React 19, `defaultValue` solo aplica en el mount inicial. Cuando el Server Action devuelve `fieldErrors`, el componente re-renderiza pero los inputs vuelven a sus defaults vacíos — el usuario pierde todo.

### 4.3 Causa raíz de la falta de edición

No fue implementada en S022A. No hay ruta `/inventory/[id]/edit` ni acción `updateInventoryItem`. S022A solo implementó create + read.

### 4.4 Falta de campo Versión

`football_shirt_details` en el schema Supabase no tiene columna `version_camisa`. El formulario tampoco la expone. Es un atributo de dominio esencial: Home/Away/Third/Goalkeeper/Training/Pre-match/Edición especial.

**Implicación:** hay dos sub-casos:
- **Sin schema change:** usar `autenticidad` como campo temporal (hacky, no recomendado)
- **Con schema change:** añadir columna `version_camisa TEXT` a `football_shirt_details`

**Recomendación:** añadir `version_camisa` como campo en `football_shirt_details`. Es una columna simple TEXT. El schema canónico (`STUDIO_SUPABASE_SCHEMA_MVP.sql`) debe actualizarse + Pablo ejecuta `ALTER TABLE football_shirt_details ADD COLUMN version_camisa TEXT;` en Supabase.

---

## 5. Relación con WooCommerce / ACF / taxonomías / SEO

### 5.1 Hallazgo crítico del probe S007 (ya documentado en DEC-14)

Los productos de Catenaccio Vintage usan **ACF meta fields**, NO `attributes[]` de WC. El Filtro Camisetas Pro lee de `meta_data`. Studio debe escribir en `meta_data`.

### 5.2 Qué campos son entidades/términos canónicos en WC

| Campo Studio | meta_data WC key | Tipo en WC | Feeds |
|-------------|-----------------|------------|-------|
| `liga` | `liga` | Term ID (pa_liga, attr id=5) | Filtro Camisetas, URL `/categoria/la-liga/` |
| `equipo` | `equipo` | Term ID (pa_equipo, attr id=4) | Filtro, URL `/equipo/fc-barcelona/`, menú |
| `temporada` | `ano_temporada` | Term ID (pa_ano, attr id=7) | Filtro, URL `/ano/2014-15/` |
| `jugador` | `jugador` | Term ID (pa_jugador, attr id=6) | Filtro, URL `/jugador/neymar-jr/` |
| `talla` | `talla` | String directo | Filtro |
| `condicion` | `condicion` | String directo | Filtro |
| `marca` | — | Diferido del payload MVP (DEC-14) | — |

### 5.3 Qué NO debe ser texto libre

- `liga`, `equipo`, `temporada`, `jugador` → entidades con URLs canónicas en la tienda
- Si se introduce "FC Barcelona" vs "Barcelona" como equipo distinto → se crean dos terms distintos en WC → el Filtro Camisetas Pro los trata como entidades distintas → URLs `/equipo/fc-barcelona/` y `/equipo/barcelona/` se bifurcan → SEO fragmentado

### 5.4 Responsabilidad de la resolución de IDs

- S022A.2: Studio guarda `equipo_display` + `equipo` (term ID si conocido, "" si desconocido)
- S022C: el bridge verifica que `equipo IS NOT NULL AND equipo != ""` antes de llamar a WC. Si no tiene term ID → STOP con error (ya documentado en `STUDIO_WC_TERM_ID_RESOLUTION_PLAN.md §6`)
- Pablo añade el term en WC Admin si falta, luego actualiza la cache local

---

## 6. Decisión sobre IDs técnicos visibles

**Pablo NUNCA debe ver ni escribir term IDs.**

### Solución técnica

Crear `studio/lib/wc-terms-mvp.ts` con:
1. Mapa `ligaOptions`: `{ label: string; termId: string }[]` — todas las ligas conocidas del probe S007
2. Mapa `equipoOptions`: `{ label: string; termId: string }[]` — equipos conocidos (Francia=129, resto sin resolver se añaden con termId: "")
3. Mapa `temporadaOptions`: `{ label: string; termId: string }[]` — temporadas conocidas (2014-15=139, resto sin termId)
4. Listas sin IDs: `marcaOptions`, `versionOptions`, `jugadorOptions` (sin term IDs — son strings directos o resuelven en S022C)

El formulario muestra solo los `label`. La Server Action hace la resolución interna:
```ts
const ligaOpt = ligaOptions.find(o => o.label === ligaDisplay)
const liga = ligaOpt?.termId ?? ""      // guarda en football_shirt_details.liga
const liga_display = ligaDisplay        // guarda en football_shirt_details.liga_display
```

Para equipos sin termId confirmado: `equipo = ""`, `equipo_display = "Real Madrid"`. S022C lo detecta y detiene antes de llamar a WC.

---

## 7. Opciones canónicas para Liga / Equipo / Jugador / Temporada / Marca / Condición / Talla / Versión

### 7.1 Liga — SELECT

Opciones del probe S007 (pa_liga, 6 términos confirmados + opción vacía):

| Label UI | Term ID | Nota |
|----------|---------|------|
| Sin liga / Selección nacional | "" | Confirmar con Pablo |
| LaLiga | 72 | ✅ Confirmado S007 |
| Premier League | 95 | ✅ Confirmado S007 |
| Serie A | 51 | ✅ Confirmado S007 |
| Eredivisie | 177 | ✅ Confirmado S007 |
| Bundesliga | ? | Pendiente resolución |
| Ligue 1 | ? | Pendiente resolución |

**Implementación MVP:** `<select>` + "Otra (no listada)" como opción de fallback con text input manual si necesario. Los IDs pendientes se completan con vacío y se resuelven en S022C.

### 7.2 Equipo — Combobox/datalist

21+ términos en pa_equipo. Solo Francia=129 está confirmado. El resto tiene nombre conocido del probe pero sin term ID.

**Implementación MVP:** `<input list="equipos-list">` + `<datalist id="equipos-list">` con todos los equipos conocidos del probe como opciones. Input libre para equipos no listados. La Server Action busca internamente en `wc-terms-mvp.ts`; si no encuentra term ID → `equipo = ""`, `equipo_display = lo que escribió Pablo`.

Lista de equipos del probe: Ajax, AC Milan, Alemania, Arsenal, AS Roma, Bayern Munich, Borussia Dortmund, Colombia, Escocia, FC Barcelona, Francia, Juventus, Lazio, Liverpool, Málaga, Manchester United, Paraguay, PSG, Paris Saint-Germain, Real Madrid + más.

**Nota PSG/Paris Saint-Germain:** pueden ser dos terms distintos. Confirmar con Pablo en S022A.2 — el formulario debe exponer ambos como opciones separadas hasta que se decida cuál usar.

### 7.3 Jugador — Input libre + datalist opcional

Los jugadores no tienen lista exhaustiva accesible sin hacer GET a WC API (pa_jugador, attr id=6 — todos los term IDs pendientes).

**Implementación MVP:** text input libre. Pablo escribe el nombre del jugador. `jugador_display` = lo que escriba. `jugador` = "" (término sin resolver). Se resolverá en S022C.

**Protección:** la Server Action sanitiza (trim, normalización básica). Pablo debe consistencia de nombres para evitar duplicados — responsabilidad editorial de Pablo.

### 7.4 Temporada — Input con pattern + datalist

Formato canónico: `YYYY-YY` (ej. 2014-15, 2001-02). Ocasionalmente: `YYYY` solo (año específico).

**Implementación MVP:** text input con `placeholder="2001-02"` + datalist de temporadas conocidas de la tienda. Term IDs: solo 2014-15=139 confirmado. Resto con termId "".

### 7.5 Marca — SELECT

Valores conocidos de la tienda (pa_marca, attr id=3, diferido del payload WC MVP):

Adidas, Nike, Umbro, Le Coq Sportif, Kappa, Lotto, Reebok, Puma, Hummel, Otra

Marca no entra en el payload WC MVP (DEC-14 §3.7 de `STUDIO_WC_TERM_ID_RESOLUTION_PLAN.md`). Se guarda en Studio solo para tracking interno. `marca` como string directo es suficiente para MVP.

### 7.6 Condición — SELECT (ya existe)

`Mint`, `Excelente`, `Muy buena`, `Buena`, `Aceptable` — string directo en WC meta_data (confirmado probe). Ya implementado correctamente en S022A. No cambiar.

### 7.7 Talla — SELECT (ya existe)

`XS`, `S`, `M`, `L`, `XL`, `XXL`, `XXXL`, `Única` — string directo en WC meta_data (confirmado probe). Ya implementado. No cambiar.

### 7.8 Versión — SELECT (campo nuevo)

Campo que alimenta el título autogenerado y es relevante para el catálogo:

| Label UI | Valor guardado | En título como |
|----------|---------------|----------------|
| Home | Home | "Home Shirt" |
| Away | Away | "Away Shirt" |
| Third | Third | "Third Shirt" |
| Goalkeeper | Goalkeeper | "GK Shirt" |
| Training | Training | "Training Shirt" |
| Pre-match | Pre-match | "Pre-Match Shirt" |
| Edición especial | Special | "Special Edition Shirt" |
| — (sin versión) | "" | "Shirt" |

**Schema change requerido:** `ALTER TABLE football_shirt_details ADD COLUMN version_camisa TEXT;`

Pablo ejecuta este ALTER en Supabase SQL Editor antes de S022A.2 CODE. No es urgente para el plan en sí, pero sí para la sesión de código.

---

## 8. Título autogenerado

### 8.1 Patrón canónico

```
[Temporada] [Equipo] [VersShirt] – [Jugador] #[Numero] – ([Talla])
```

Donde `VersShirt` es la expansión de la versión:
- Home → "Home Shirt"
- Away → "Away Shirt"
- Third → "Third Shirt"
- Goalkeeper → "GK Shirt"
- Training → "Training Shirt"
- Pre-match → "Pre-Match Shirt"
- Special → "Special Edition Shirt"
- "" → "Shirt"

### 8.2 Algoritmo (TypeScript)

```typescript
function buildAutoTitle({
  temporada, equipo, version, jugador, numero, talla
}: AutoTitleParams): string {
  const versionShirt: Record<string, string> = {
    Home: 'Home Shirt', Away: 'Away Shirt', Third: 'Third Shirt',
    Goalkeeper: 'GK Shirt', Training: 'Training Shirt',
    'Pre-match': 'Pre-Match Shirt', Special: 'Special Edition Shirt',
  }
  const shirt = version ? (versionShirt[version] ?? 'Shirt') : 'Shirt'
  const parts = [temporada, equipo, shirt].filter(Boolean).join(' ')
  const playerPart = jugador
    ? `${jugador}${numero ? ` #${numero}` : ''}`
    : null
  const tallaPart = talla ? `(${talla})` : null

  if (playerPart && tallaPart) return `${parts} – ${playerPart} – ${tallaPart}`
  if (playerPart) return `${parts} – ${playerPart}`
  if (tallaPart) return `${parts} ${tallaPart}`
  return parts
}
```

### 8.3 Casos edge

| Caso | Resultado esperado |
|------|--------------------|
| Sin jugador, sin número | `2001-02 Real Madrid Home Shirt (L)` |
| Sin versión | `2001-02 Real Madrid Shirt – Zidane #5 – (L)` |
| Selección nacional (sin liga) | `2014-15 France Away Shirt (XXL)` — igual, liga no entra en título |
| Goalkeeper | `2010-11 Chelsea GK Shirt (L)` |
| Training sin jugador | `2012-13 FC Barcelona Training Shirt (XL)` |
| Sin temporada | `Real Madrid Home Shirt – Raúl #7 – (L)` |
| Solo equipo + talla | `FC Barcelona Shirt (M)` |

### 8.4 Idioma

**Inglés.** El título es el `referencia` interno de Studio y el candidato para `titulo_seo` en WC (que Claude refinará en S022B). La tienda tiene URLs en español (`/producto/...`) pero los títulos de producto están en EN en los productos existentes (ej. "2014-15 France Away Shirt (XXL)"). Consistencia con el catálogo actual.

### 8.5 Preview y override

- El campo `referencia` muestra el título auto-generado en tiempo real (cliente)
- Pablo puede sobrescribirlo manualmente si lo necesita
- Si Pablo modifica el campo, deja de auto-actualizarse (controlled + flag `titleOverridden`)
- Botón "↺ Regenerar" para volver al auto-título
- Al guardar: `referencia` = lo que hay en el campo (auto o manual)
- No se necesita columna `titulo` separada — `referencia` cumple esa función

---

## 9. Edición de camisetas

### 9.1 Es blocker de S022A.2

Pablo crea una camiseta, la mira en `/inventory/[id]` y detecta un error. Sin edición, tendría que crear otra camiseta nueva con todos los datos otra vez. Esto contamina el inventario con duplicados y bloquea el flujo real de uso.

### 9.2 Implementación mínima

**Nuevos archivos:**
- `studio/app/inventory/[id]/edit/page.tsx` — Server Component: autenticación + carga item + carga football_shirt_details + renderiza `<ItemForm>` en modo edit

**Nueva acción:**
- `updateInventoryItem` en `actions.ts`:
  - Lee `item_id` del formData
  - Verifica que el item pertenece al usuario autenticado (`owner_id = user.id`)
  - Valida los mismos campos que createInventoryItem
  - Ejecuta `UPDATE inventory_items` + `UPDATE football_shirt_details`
  - Redirige a `/inventory/[id]`

**Cambio en ItemForm.tsx:**
- Acepta `defaultValues?: Partial<FormValues>` prop opcional
- En modo edit, usa `defaultValues` para pre-rellenar todos los campos
- Cambio de título: "Nueva camiseta" → "Editar camiseta" en modo edit
- Botón: "Guardar cambios" en vez de "Guardar camiseta"

**Enlace:**
- `/inventory/[id]` añade botón "Editar" → `/inventory/[id]/edit`

---

## 10. Preservación de formulario y validación

### 10.1 Por qué se perdió el formulario

`ItemForm.tsx` usa inputs no controlados (`<input defaultValue="">` o sin valor). En React 19, `defaultValue` solo se aplica al mount inicial del DOM. Cuando `useActionState` recibe el estado con `fieldErrors` del servidor, el componente re-renderiza pero los inputs ya montados no reciben el nuevo `defaultValue` — permanecen en el estado que el usuario dejó en el DOM.

**Pero:** en SSR/RSC + form submit, el navegador hace un POST completo. En desarrollo con `useActionState` esto puede comportarse diferente según si hay un full-page reload o no. La causa real puede ser que el Server Action con `redirect()` en el path de éxito obliga a un full-page reload, pero en el path de error el formulario se re-renderiza en el cliente y los inputs React NO persisten el valor del usuario porque React no los trackea (no controlados).

### 10.2 Solución recomendada

**Patrón: devolver values desde Server Action + formKey + defaultValue en re-mount.**

```typescript
// actions.ts — en el path de error:
if (Object.keys(fieldErrors).length > 0) {
  return {
    fieldErrors,
    formKey: Date.now(),  // cambia en cada error, fuerza re-mount
    values: {
      referencia, coste: costeRaw, precio_objetivo: precioObjetivoRaw,
      fecha_compra: fechaCompra, proveedor: str('proveedor'),
      equipo_display: str('equipo_display'), temporada_display: str('temporada_display'),
      liga_display: str('liga_display'), talla, condicion,
      jugador_display: str('jugador_display'),
      version_camisa: str('version_camisa'),
      // ... resto de campos
    }
  }
}
```

```tsx
// ItemForm.tsx
export function ItemForm() {
  const [state, formAction, isPending] = useActionState(createInventoryItem, {})
  const v = state.values ?? {}

  return (
    <form action={formAction} key={state.formKey ?? 'initial'} className="item-form">
      <input name="referencia" defaultValue={v.referencia ?? ''} ... />
      ...
    </form>
  )
}
```

El `key` en el form fuerza a React a desmontar y remontar el form completo, aplicando los `defaultValue` nuevos desde el estado.

### 10.3 Validación cliente previa

Añadir validación básica cliente en el submit handler para campos evidentemente vacíos antes de llamar al servidor. Reduce round-trips y mejora UX.

---

## 11. Productos existentes de WooCommerce

**¿Deben aparecer ya las camisetas existentes en Studio?**

**No bloquea S022A.2.** El flujo actual es Studio-first: Pablo crea camisetas nuevas en Studio → Studio las publica a WC como draft (S022C). Los 28 productos existentes en WC son el catálogo legado — se pueden importar en el futuro (S025: EXCEL_STOCK_IMPORT_MAPPING).

**Confusión de Pablo:** Pablo vio el inventario vacío y asumió que la web estaba "desconectada". La UI debe dejar claro que Studio es la nueva herramienta para añadir stock futuro, y que los productos existentes son legacy manual.

**Acción S022A.2:** añadir nota en la vista `/inventory` (o en el empty state) que explique que Studio gestiona el inventario nuevo y que los 28 productos existentes están en WooCommerce.

**Importación desde WC → Studio:** diferir a S025+. Requiere:
- GET /wc/v3/products con paginación
- Mapeo de meta_data → football_shirt_details
- Resolución inversa de term IDs a display names
- Posible creación de filas en inventory_items para cada producto existente

---

## 12. Rutas evaluadas

### Ruta 1 — Patch UI local con listas hardcoded

**Pros:** rápida, sin dependencias externas, sin credenciales WC en S022A.
**Contras:** riesgo de desactualización si Pablo añade equipos en WC. Listas incompletas para jugadores y algunos equipos.
**Veredicto:** viable como MVP si se complementa con texto libre fallback.

### Ruta 2 — Supabase canonical dictionaries

**Pros:** normalización real, multi-sesión, editable desde Studio.
**Contras:** requiere tablas nuevas (`wc_term_cache`), seed manual, schema change en producción. Demasiado para un patch UX.
**Veredicto:** buena opción long-term (S023+), no para S022A.2.

### Ruta 3 — Woo read-only canonical options

**Pros:** datos siempre actualizados, term IDs resueltos automáticamente.
**Contras:** introduce `WP_APP_*` credentials en S022A antes de S022C. Mezcla credenciales de WC con una sesión que se definió como NO_WC. Riesgo de scope creep.
**Veredicto:** correcto long-term, pero rompe el aislamiento de S022A.

### Ruta 4 — Híbrida (RECOMENDADA)

**Pros:** S022A.2 usa `wc-terms-mvp.ts` (JSON local con term IDs conocidos del probe S007 + listas hardcoded para el resto). No introduce credenciales WC. El formulario es usable con las entidades conocidas. Los IDs desconocidos se guardan como "" y se resuelven en S022C.
**Contras:** requiere mantenimiento manual de `wc-terms-mvp.ts` cuando Pablo añade nuevos equipos/jugadores en WC.
**Veredicto:** **ELEGIDA.** Bloqueo mínimo, sin credenciales nuevas, compatible con DEC-14.

---

## 13. Recomendación única para S022A.2

**Ruta 4 — Híbrida con JSON local (`wc-terms-mvp.ts`):**

1. Crear `studio/lib/wc-terms-mvp.ts` con:
   - `ligaOptions`: 7 opciones (las 6 ligas + "Sin liga / Selección") con term IDs conocidos
   - `equipoOptions`: 21+ equipos del probe, con termId confirmado solo donde se conoce
   - `temporadaOptions`: temporadas estimadas del catálogo actual (2014-15 confirmada + las que Pablo añada)
   - `marcaOptions`: lista estática de marcas comunes
   - `versionOptions`: las 7 versiones definidas en §7.8

2. Refactorizar `ItemForm.tsx`:
   - Eliminar todos los campos "term ID WC"
   - Liga → `<select>` con ligaOptions
   - Equipo → `<input list="equipos">` + `<datalist>` con equipoOptions
   - Temporada → `<input>` con pattern + datalist
   - Jugador → `<input>` texto libre
   - Marca → `<select>` con marcaOptions
   - Versión → `<select>` con versionOptions (campo nuevo)
   - Título → campo `referencia` con auto-generación en tiempo real
   - Form state: `key={state.formKey}` + `defaultValue={state.values?.campo ?? ''}`

3. Actualizar `actions.ts`:
   - Path de error devuelve `{ fieldErrors, formKey: Date.now(), values: {...} }`
   - Resolución interna: `ligaDisplay → { liga, liga_display }` desde wc-terms-mvp.ts
   - Añadir `updateInventoryItem` action

4. Crear `/inventory/[id]/edit/page.tsx` (Server Component + ItemForm en modo edit)

5. Schema change manual de Pablo: `ALTER TABLE football_shirt_details ADD COLUMN version_camisa TEXT;`

6. Actualizar `STUDIO_SUPABASE_SCHEMA_MVP.sql` (canónico) con el nuevo campo.

---

## 14. Scope exacto S022A.2 CODE

### Archivos a crear

| Archivo | Qué hace |
|---------|----------|
| `studio/lib/wc-terms-mvp.ts` | Opciones canónicas + resolución termId interno |
| `studio/app/inventory/[id]/edit/page.tsx` | Ruta edición — Server Component |
| `studio/lib/title-builder.ts` | Función pura `buildAutoTitle()` |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `studio/components/ItemForm.tsx` | Eliminar ID fields, añadir Versión, auto-título, form state preservation |
| `studio/app/inventory/actions.ts` | Devolver values en error, añadir updateInventoryItem, resolución termId |
| `studio/lib/types.ts` | Añadir `version_camisa` a FootballShirtDetails |
| `studio/app/inventory/[id]/page.tsx` | Añadir botón "Editar" → /inventory/[id]/edit |
| `studio/app/inventory/page.tsx` | Nota sobre productos legacy WC |
| `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql` | Añadir `version_camisa TEXT` a football_shirt_details |

### NO tocar en S022A.2

- `.env.local`
- Llamadas a WC API
- Llamadas a Anthropic API
- Supabase remoto (excepto el ALTER que Pablo ejecuta manualmente)
- Deploy / Vercel
- WordPress

---

## 15. Fuera de scope / Backlog

| Item | Sesión |
|------|--------|
| Sync read-only Woo→Studio (atualizar wc-terms-mvp automáticamente) | S023 |
| Importar 28 productos existentes de WC a Studio | S025 (EXCEL_STOCK_IMPORT_MAPPING) |
| Completar term IDs de equipos, temporadas y jugadores faltantes | S022C (pre-bridge) |
| Fotos locales / media_assets | post-MVP |
| Vista kanban de pipeline (12 estados) | S023+ |
| Filtros en /inventory | S023+ |
| Paginación | S023+ |
| Tabla `wc_term_cache` en Supabase (Ruta 2) | S023+ |

---

## 16. Criterio de validación de Pablo

S022A.2 se considera aprobado (PABLO_LOCAL_FORM_OK) cuando Pablo ejecuta en local:
```
cd studio && npm run dev
```

Y puede confirmar TODOS estos pasos sin error:

1. `/inventory/new` → formulario sin ningún campo "term ID", sin campos técnicos
2. Rellena: Liga (select), Equipo (datalist), Temporada, Versión (select), Talla, Condición, Coste, Precio objetivo, Fecha
3. El campo Referencia/Título se auto-completa con el patrón correcto
4. "Guardar camiseta" → redirige a `/inventory/[id]` con todos los campos visibles
5. Falla intencional: borrar Equipo, intentar guardar → el formulario conserva los otros campos
6. Corregir Equipo → guardar → OK
7. En `/inventory/[id]` → click "Editar" → formulario pre-relleno con los valores guardados
8. Cambiar Condición → "Guardar cambios" → redirige a `/inventory/[id]` con condición actualizada
9. Confirma: los campos de dominio tienen sentido, no ve ningún ID numérico

Solo después de PABLO_LOCAL_FORM_OK → desbloquear S022B.

---

## 17. Riesgos y stop criteria

| Riesgo | Mitigación | Stop si... |
|--------|------------|------------|
| `version_camisa` ALTER falla en Supabase | Pablo verifica en Dashboard antes de S022A.2 CODE | El campo no existe en la tabla → STOP código hasta que exista |
| Equipos sin term ID generan `equipo = ""` → S022C bloquea | Documentado y esperado. S022C tiene el plan de resolución | No es blocker de S022A.2 |
| PSG vs Paris Saint-Germain como duplicados en WC | Preguntar a Pablo en S022A.2 cuál es el canónico | Pablo debe decidir antes de crear camisetas de PSG |
| Temporadas con formato no estándar (solo año: "1998") | Permitir texto libre, el pattern es guía no restricción | No es stopper |
| Schema `STUDIO_SUPABASE_SCHEMA_MVP.sql` desync con Supabase remoto | SQL canónico se actualiza en S022A.2. Pablo ejecuta ALTER. | Si Pablo no puede ejecutar el ALTER → no se implementa Versión en esta sesión |

### Stop criteria de S022A.2 CODE

STOP si durante la sesión de código:
- Se necesita llamar a WC API para resolver term IDs
- Se necesita leer `.env.local`
- El scope se expande a S022B (Claude) o S022C (bridge)
- Se detecta que el schema change rompe algo inesperado

---

*Sesión 022A.1 — 2026-06-28 — Claude Code Sonnet. READ_ONLY_DIAGNOSIS / NO_CODE / NO_REMOTE_WRITE.*
