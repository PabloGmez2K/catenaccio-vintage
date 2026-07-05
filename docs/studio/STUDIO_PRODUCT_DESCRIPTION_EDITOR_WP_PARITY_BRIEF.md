# STUDIO_PRODUCT_DESCRIPTION_EDITOR_WP_PARITY_BRIEF

**Bloque propuesto:** `STUDIO_PRODUCT_DESCRIPTION_EDITOR_WP_PARITY`
**Tipo:** PRODUCT_OPERABILITY_FIX / UI + DATA MODELING / CONTROLLED_SYNC
**Estado:** brief para la siguiente sesion; no implementado en este cierre.
**Motivo:** Pablo detecta que Studio duplica "Contenido SEO Manual" mientras WooCommerce ya tiene campos reales de descripcion.

---

## 1. Problema

En WooCommerce existe una superficie clara:

- **Descripcion del producto**: `description` / `post_content`.
- **Descripcion corta del producto**: `short_description` / `post_excerpt`.
- Editor Visual/Texto.
- Avisos de autosave/revision cuando WP detecta contenido mas reciente.

En Studio, el contenido vive como "Contenido SEO Manual" dentro y fuera de Editar. Ese modelo ya no sirve como superficie operativa final porque:

- duplica la experiencia;
- mezcla descripcion, SEO y precio;
- no expresa que Woo es el canal web real;
- no deja claro que contenido esta activo en Woo y cual es draft/aprobado en Studio.

---

## 2. Outcome

Studio gestiona la descripcion del producto como Woo:

- `post_content` / `description`;
- `post_excerpt` / `short_description`;
- awareness de autosave/revision o, como minimo, documentacion explicita del comportamiento;
- modo Visual/Text o equivalente seguro;
- HTML limpio;
- prompt ChatGPT/Claude para mejorar descripcion;
- contenido activo Woo visible;
- draft/aprobado Studio visible;
- preview/diff;
- sync controlado a Woo;
- sin duplicar "Contenido SEO Manual" fuera de Editar;
- precio fuera de SEO.

---

## 3. DONE_BAR

El bloque esta DONE solo si Pablo puede completar este flujo:

1. Abrir una ficha vinculada.
2. Entrar en Editar.
3. Ver un bloque llamado **Descripcion del producto**.
4. Ver la descripcion activa de Woo.
5. Editar HTML/texto en Studio.
6. Copiar un prompt con contexto de camiseta y descripcion actual.
7. Pegar el resultado HTML limpio.
8. Guardar en Studio sin tocar Woo.
9. Ver diff Studio vs Woo.
10. Sincronizar a Woo solo con confirmacion explicita.
11. Ver resultado/success/error/log.
12. Confirmar que el bloque duplicado "Contenido SEO Manual" desaparece o queda reconvertido.
13. Confirmar que precio vive en `Precio y coste`, no en SEO.

---

## 4. Modelo de datos a revisar antes de CODE

Antes de implementar, leer y decidir:

- Donde vive hoy la sugerencia aprobada (`ai_suggestions`).
- Como se distingue draft vs aprobado.
- Si `description` y `short_description` necesitan columnas propias o se pueden representar con registros existentes sin ambiguedad.
- Como se conserva la descripcion activa Woo en snapshot sin tratarla como fuente editable local.
- Que evento se registra al guardar draft/aprobado y al sync real.

No usar `notas_internas` como sustituto de campos editables.

---

## 5. UX requerida

Pantalla principal: Editar ficha.

Estados obligatorios:

- Empty: no hay descripcion Woo ni contenido Studio.
- Loading: lectura Woo lenta o pendiente.
- Success: guardado Studio OK y/o sync Woo OK.
- Error: fallo de lectura, fallo de guardado Studio, fallo de sync Woo.
- Dirty state: contenido local modificado sin guardar.
- Diff state: Studio distinto de Woo.

Controles esperados:

- textarea/editor para HTML limpio;
- vista previa renderizada o modo Visual/Text equivalente;
- boton "Copiar prompt";
- campo para pegar resultado;
- guardar en Studio;
- accion separada de sync a Woo con confirmacion;
- log visible de ultima accion.

---

## 6. Reglas de sincronizacion

Si se toca Woo:

- una accion = un producto;
- GET fresco antes de escribir;
- re-verificacion de preview contra contenido vivo;
- whitelist explicita (`description` y, si se aprueba, `short_description`);
- confirmacion inline, no `confirm()` nativo;
- evento en `item_lifecycle_events`;
- error visible y saneado;
- sin bulk;
- sin publicar/despublicar;
- sin retry automatico.

Si no se implementa el write en el primer bloque, dejar el sync como disabled/next-step honesto y cerrar solo cuando la barra acordada lo permita.

---

## 7. Prompt HTML recomendado

El prompt copiado debe pedir:

- HTML limpio compatible con WordPress/WooCommerce;
- sin scripts, iframes, estilos inline complejos ni clases inventadas;
- estructura simple (`p`, `ul`, `li`, `strong`, `em`, `h2` si aplica);
- descripcion en espanol orientada a venta;
- no inventar claims de autenticidad, match worn, player issue o rareza si no estan en los datos;
- mantener tono Catenaccio Vintage;
- devolver solo el HTML final y, si se solicita, una descripcion corta separada.

---

## 8. Riesgos

- Autosave/revision de WordPress: si no se puede leer via API en este bloque, documentar claramente el limite y no fingir paridad total.
- HTML inseguro: sanitizar o restringir tags antes de guardar/sincronizar.
- Duplicidad con `ai_suggestions`: migrar/reconvertir UI con cuidado para no perder contenido aprobado.
- Drift: Woo puede cambiar entre lectura y sync; abortar si cambia el contenido vivo.
- Producto no vinculado: mostrar estado claro, no acciones de sync.

---

## 9. Validacion requerida

Tecnica:

- typecheck;
- lint;
- build;
- `git diff --check`;
- secret scan razonable.

Visual/operativa:

- Pablo o Antigravity prueba una ficha vinculada en desktop y movil si el bloque toca responsive.
- Pablo confirma `PABLO_PRODUCT_DESCRIPTION_EDITOR_OK` solo tras guardar Studio, ver diff y ejecutar o revisar el sync controlado segun el alcance final.
