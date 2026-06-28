# STUDIO_SEO_CONTENT_RULES.md

**Estado:** Operativo  
**Sesión origen:** S022B.2  
**Fecha:** 2026-06-28  
**Uso:** Reglas canónicas de contenido SEO para camisetas en Catenaccio Studio.  
Referencia obligatoria para el ChatGPT Project "Catenaccio Vintage" antes de redactar.

---

## 1. Objetivo del contenido

Cada camiseta publicada en WooCommerce necesita contenido que cumpla tres funciones simultáneas:

- **SEO:** ser encontrado en Google por coleccionistas buscando camisetas vintage específicas.
- **Conversión:** convencer al comprador de que la camiseta es lo que busca.
- **Prudencia:** no afirmar más de lo que se puede verificar.

El contenido se redacta desde **Studio** (backoffice propio) y se publica en WooCommerce como borrador (nunca directo a publicado). El objetivo inmediato es producir **borradores consistentes** que Pablo pueda revisar y publicar con mínima edición.

---

## 2. Título WooCommerce / SEO

### Idioma

**Inglés obligatorio.** El mercado de camisetas vintage coleccionables es internacional.

### Formato canónico

```
YYYY-YY Club Version Shirt (Size)
```

Ejemplos:
- `2007-09 PSV Away Shirt (XXL)`
- `2004-05 Arsenal Home Shirt (L)`
- `1998-00 France Away Shirt (XL)`

### Con jugador y dorsal

```
YYYY-YY Club Version Shirt - Player #N (Size)
```

Ejemplo:
- `2005-06 Arsenal Match Worn Home L/S Shirt - Henry #14 (L)`

### Variantes por tipo

| Caso | Ajuste al formato |
|------|------------------|
| Manga larga | Añadir `L/S` antes de `Shirt` |
| Portero | Usar `GK Shirt` en lugar de `Shirt` |
| Selección nacional | `Club` = nombre de la selección (ej. `France`, `Spain`) |
| Sin temporada conocida | Omitir años o usar década (`1990s`) |
| Sin talla | Omitir el paréntesis final |
| Producto no es camiseta | Adaptar: `Tracksuit`, `Scarf`, `Jacket`, etc. |

### Límite de longitud

Máximo **70 caracteres** para compatibilidad SEO óptima en SERP. No exceder salvo que sea imprescindible para incluir jugador relevante.

### Claims prohibidos en el título

- No usar `Match Worn`, `Player Issue`, `Authentic`, `Original` salvo que el campo correspondiente lo indique explícitamente.
- No añadir adjetivos valorativos no verificados: `Rare`, `Iconic`, `Legendary`, `Ultra-Rare`.
- No inventar ediciones limitadas, número de fabricación ni colecciones.

---

## 3. Descripción larga

### Idioma

**Español.** El operador (Pablo) y el mercado objetivo principal son de habla hispana.

### Tono

Profesional, comercial, propio del coleccionismo de fútbol vintage. Sin hipérboles. Sin historia inventada.

### Sin HTML

La descripción larga se entrega como texto plano. Si en el futuro el flujo pide HTML, se indicará explícitamente.

### Longitud mínima

**100 palabras.** Sin límite máximo práctico, pero evitar relleno.

### Estructura recomendada

1. **Identificación** — qué camiseta es, de qué temporada y equipo.
2. **Diseño y detalles visibles** — colores, escudo, sponsor, marca/fabricante, manga, parches.
3. **Estado de conservación** — condición indicada en los datos; si hay notas de condición, incluirlas.
4. **Talla y medidas** — talla normalizada; medidas en cm si están disponibles.
5. **Personalización** — jugador, dorsal, parches especiales, etiquetas, si constan en los datos.
6. **Cierre comercial prudente** — una o dos frases que inviten a la compra sin exagerar ni prometer.

### Lo que NO debe aparecer

- Precio de coste ni márgenes.
- Proveedor o fuente de adquisición.
- Historia no verificada del objeto (partidos jugados, propietario previo, procedencia exacta).
- Datos de ubicación física o almacén.
- Notas internas del operador.
- IDs técnicos, sesiones o nombres de agentes.

### Si faltan datos

Omitir el bloque correspondiente de forma natural. No inventar ni rellenar con suposiciones.

---

## 4. Descripción corta

### Estado

Opcional en el MVP actual. No bloquea S022C.

### Criterio cuando se use

- 2 a 4 líneas.
- Resumen comercial directo: qué es, estado, talla.
- En español.
- Sin claims sensibles.
- Ejemplo: _"Camiseta alternativa del PSV Eindhoven de la temporada 2007-09 en talla XXL. Buen estado de conservación. Con etiquetas originales."_

---

## 5. Precio recomendado

### Fuente

Valor de mercado vintage estimado. No derivado del coste de adquisición.

### Niveles de confianza

| Situación | Respuesta esperada |
|-----------|-------------------|
| Hay precio objetivo indicado en los datos | Usar como referencia y ajustar si hay contexto de mercado claro |
| No hay precio objetivo pero hay datos suficientes | Estimar con rango (ej. `€45–65`) y explicar brevemente |
| Datos insuficientes para estimar | `no aplica — requiere revisión manual` |
| Camiseta con claims sensibles (match worn, player issue) | `requiere revisión manual — valor depende de verificación` |

### Prohibido

- No derivar precio de coste de compra.
- No afirmar comparables exactos sin fuente.
- No dar precios inflados por autenticidad no verificada.

---

## 6. Notas internas

### Para quién

Exclusivamente para Pablo. No son copy público y **nunca se publican en WooCommerce**.

### Contenido útil

- Dudas sobre un campo o dato (ej. _"La temporada podría ser 2006-07, revisar etiqueta"_).
- Riesgos de la ficha (ej. _"Marca no identificada, no incluir en título"_).
- Checklist de revisión antes de publicar.
- Criterios de precio si hay incertidumbre.
- Observaciones sobre estado que no son apropiadas para la descripción pública.

### Lo que NO deben incluir

- Datos de coste, proveedor, procedencia.
- Información sensible de operaciones.
- Nombres de sesiones internas o agentes (eso vive en docs/, no en notas del producto).

---

## 7. Reglas de claims sensibles

Estas reglas son **no negociables**. Aplicarlas siempre, sin excepción.

### Autenticidad

| Claim | Cuándo se puede usar |
|-------|---------------------|
| `Original` / `Replica` | Solo si el campo `authenticity_type` lo indica como `replica` (que en UI aparece como "Original retail / Fan version") |
| `Authentic` / `Player Spec` | Solo si `authenticity_type` indica `authentic` |
| `Player Issue` | Solo si `authenticity_type` indica explícitamente `player_issue` |
| `Match Worn` | Solo si `authenticity_type` indica explícitamente `match_worn` |

### Certificados y procedencia

- **No afirmar** que hay certificado de autenticidad salvo que el dato conste explícitamente.
- **No afirmar** procedencia o historial del objeto (ej. _"usada por Ronaldo"_, _"del vestuario del equipo"_) sin dato claro y verificable.
- **No añadir** frases como _"certificada como auténtica"_, _"procedente de fuente oficial"_, _"con documentación"_ si no hay campo que lo respalde.

### Rareza y coleccionismo

- No afirmar _"edición limitada"_, _"muy difícil de encontrar"_, _"rarísima"_ sin base en el campo de datos.
- Se puede describir una camiseta como _"poco habitual en este estado"_ o _"de una temporada con escasa circulación"_ si hay contexto suficiente para ello.

### Parches, etiquetas y detalles físicos

- Solo mencionar parches, etiquetas, sponsor, personalización y detalles si están indicados en los campos correspondientes (`tiene_parches`, `parches_descripcion`, `tiene_etiquetas`, `sponsor`, etc.).
- No inventar detalles físicos aunque sean _"probables"_ para esa temporada o equipo.

---

## 8. Formato de salida estándar para pegar en Studio

El agente externo (ChatGPT o Claude.ai) debe devolver **exactamente** este formato. Sin texto adicional, sin introducción, sin cierre. Solo los delimitadores y el contenido.

```
---TÍTULO WOO---
[título en inglés, máx. 70 caracteres]

---DESCRIPCIÓN LARGA---
[descripción en español, mínimo 100 palabras, texto plano]

---PRECIO RECOMENDADO---
[número en EUR, rango EUR, o "no aplica"]

---NOTAS INTERNAS---
[notas para Pablo, o "ninguna"]
```

### Por qué este formato

Studio espera este formato exacto para parsear y pre-rellenar el formulario de pegado. Si el formato cambia, el flujo manual funciona igualmente (Pablo copia y pega campo por campo), pero la experiencia es peor.

---

## 9. Checklist final antes de responder

El agente debe verificar mentalmente antes de enviar:

- [ ] Título en inglés
- [ ] Título máximo 70 caracteres
- [ ] Descripción en español
- [ ] Descripción mínimo 100 palabras
- [ ] No mencioné coste ni proveedor
- [ ] No inventé datos ausentes en los campos
- [ ] No hice claims de autenticidad no respaldados por los campos
- [ ] Precio basado en valor de mercado vintage, no en coste
- [ ] Parches/etiquetas/personalización solo si constan en los datos
- [ ] Formato de salida correcto (4 delimitadores, en orden)
- [ ] Notas internas no son copy público
- [ ] Coherencia entre talla, temporada, equipo y versión

---

## Apéndice: contexto del flujo Studio

Este documento forma parte del flujo **S022B.1 / S022B.2** de Catenaccio Studio:

1. Pablo abre la ficha de una camiseta en `/inventory/[id]`.
2. Pulsa "Copiar prompt SEO" → copia al portapapeles.
3. Pega el prompt en **ChatGPT Project "Catenaccio Vintage"** (preferido) o en Claude.ai.
4. El agente externo lee este documento y las reglas del repo antes de redactar.
5. Pablo copia el resultado, lo pega en el formulario de Studio y guarda.
6. Studio guarda en `ai_suggestions` con `status=editado_aprobado`.
7. S022C (puente WooCommerce) lee esa suggestion para crear el borrador en WC.

La API de Claude/Anthropic está **dormante** en esta fase. El agente externo siempre es una sesión manual de ChatGPT o Claude.ai.
