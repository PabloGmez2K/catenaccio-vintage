# Studio Product Form Modeling Playbook

Estado: operativo ligero para Catenaccio Studio.
Origen: aprendizaje S022A.
Uso: antes de CODE cuando una pantalla de producto pueda fallar por vocabulario, labels, valores internos o mapping Woo pendiente.

## 1. Para que existe

- Evitar que formularios tecnicamente correctos fallen como herramienta real de operacion.
- Evitar microfix spiral en UI/producto.
- Convertir dudas de dominio en decisiones antes de CODE.

## 2. Cuando se activa

Activar `DOMAIN_PRODUCT_MODELING_GATE` antes de CODE si la tarea toca:

- formulario nuevo o edicion de producto
- taxonomias o campos de producto
- title builder
- labels visibles
- autenticidad, condicion o version
- puente WooCommerce
- UI de backoffice validada visualmente por Pablo

## 3. SPEC_BEFORE_PATCH

Antes de implementar, producir una spec breve con:

| Campo | Pregunta que debe responder |
| --- | --- |
| campo | Que representa exactamente |
| tipo de dato | string, enum, boolean, relacion, money, date, etc. |
| label visible | Que ve Pablo en la UI |
| valor interno | Que guarda Studio |
| titleLabel / SEO label | Que entra en titulo, listado o SEO |
| fuente de opciones | Lista local, Woo, manual, futura tabla |
| admite manual | Si/no y con que validacion |
| externalId / Woo termId | Mapping externo si aplica |
| si falta mapping | Bloquear, permitir draft, marcar pendiente |
| ejemplo real | Una camiseta concreta |
| caso borde | Seleccion nacional, equipo nuevo, marca no listada, sin jugador |
| NO ahora | Que queda explicitamente fuera del patch |

## 4. DOMAIN_OPTION_PATTERN

Patron conceptual de modelado, no interfaz TypeScript obligatoria:

```ts
DomainOption = {
  label: string,
  value?: string,
  titleLabel?: string,
  aliases?: string[],
  externalId?: string,
  helpText?: string,
  status?: "mapped" | "pending_mapping"
}
```

Usarlo para razonar antes de codear. Crear una abstraccion real solo si el repo ya lo pide o hay segundo uso claro.

## 5. INTERNAL VS DISPLAY VS TITLE VS EXTERNAL

- `label visible`: lo que ve Pablo.
- `value interno`: lo que guarda Studio.
- `titleLabel`: lo que entra en titulo, listado o SEO.
- `externalId`: Woo termId o equivalente futuro.

Ejemplo:

| Concepto | Valor |
| --- | --- |
| label visible | PSV Eindhoven |
| value interno | PSV Eindhoven |
| titleLabel | PSV |
| aliases | PSV |
| externalId | vacio hasta mapping |

Regla: si falta `externalId` obligatorio en la publicacion Woo futura, bloquear publicacion y mostrar mapping pendiente. No crear terminos Woo automaticamente en el MVP.

## 6. VOCABULARY_AMBIGUITY_CHECK

| Termino | Significado tecnico | Riesgo para Pablo | Label recomendado | Valor interno recomendado | Nota operativa |
| --- | --- | --- | --- | --- | --- |
| Replica | Version retail/fan original de tienda | En espanol suena a falsificacion | Original | replica si ya existe convencion | UI dice Original; interno puede mantener compatibilidad |
| Authentic | Version comercial de gama alta/player spec | Puede confundirse con "original/no falsa" | Authentic / Player spec | authentic | Aclarar con help text |
| Player Issue | Camiseta preparada para jugador | Puede sonar igual que Match Worn | Player Issue | player_issue | No implica uso en partido |
| Match Worn | Usada en partido | Alto riesgo de promesa comercial | Match Worn | match_worn | Requiere evidencia; no inventar |
| Liga | Competicion/torneo | Puede mezclar liga nacional, copa o seleccion | Liga / Competicion | liga_display o competencia | Manual permitido hasta mapping |
| Equipo | Club o seleccion | Seleccion nacional no es club | Equipo / Seleccion | equipo_display | Usar label humano, no termId |
| Leyendas | Coleccion editorial | No es liga ni equipo | Coleccion editorial | deferred | No implementar como taxonomia MVP |
| Seleccion nacional | Equipo nacional | Puede romper title builder club-first | Seleccion nacional | national_team | Caso borde obligatorio |
| Version camiseta | Home/Away/Third/GK/etc. | "Version" puede confundirse con autenticidad | Tipo de camiseta | shirt_version | Ej: Away, Home, Third, Goalkeeper |
| Producto / tipo producto | Shirt, tracksuit, scarf, etc. | Puede mezclarse con categoria Woo | Tipo de producto | product_type | Empezar simple; no sobregeneralizar |

## 7. EXAMPLE_DRIVEN_ACCEPTANCE

Antes de CODE, probar mentalmente la pantalla con:

- 2007-09 PSV Away Shirt (XXL)
- 2014-15 France Away Shirt (XXL)
- 2004-05 PSV Home Shirt (XL)
- 2005-06 Arsenal Match Worn Home L/S Shirt - Henry #14 - (L)
- producto sin jugador
- equipo nuevo no mapeado
- seleccion nacional
- marca no listada

## 8. MANUAL_ENTRY_WITH_DEFERRED_MAPPING

Regla MVP:

- Pablo puede introducir termino manual.
- Studio guarda label humano.
- `externalId` puede quedar vacio.
- No se crea termino Woo automaticamente todavia.
- El puente Woo futuro debe bloquear publicacion si falta mapping obligatorio.

## 9. UI_COPY_IS_PRODUCT_LOGIC

- La UI no debe exponer nombres de sesiones.
- La UI no debe mostrar roadmap tecnico.
- La UI no debe mencionar agentes.
- La UI no debe decir "S022B anadira..." o similar.
- Eso vive en docs/backlog, no en la app.
- El copy operativo debe ayudar a Pablo a decidir que hacer ahora.

## 10. PRODUCT_OWNER_VALIDATION_LOOP

Para UI/producto:

- typecheck/build/lint no bastan.
- `COMPLETE` requiere `PABLO_VISUAL_OK` o `PABLO_LOCAL_FORM_OK`.
- Si Pablo detecta 2+ microfixes de dominio, parar y modelar.

## 11. STOP_MICROFIX_SPIRAL

Si una sesion CODE genera mas de 2 microfixes de UI/dominio:

1. No seguir parcheando.
2. Activar `STOP_AND_MODEL_DOMAIN`.
3. Capturar blockers.
4. Producir matriz de decisiones.
5. Validar con Pablo.
6. Hacer luego un unico patch coherente.

## 12. FORM_READINESS_CHECKLIST

- Hay campos tecnicos visibles?
- Hay labels ambiguos?
- Se puede editar?
- Se puede archivar/borrar o queda explicitamente diferido?
- Se pierde el formulario al fallar validacion?
- Hay valores manuales permitidos?
- Que ocurre con terminos no mapeados?
- Los textos son operativos, no roadmap?
- Hay ejemplos reales probados?
- La ficha detalle muestra labels humanos, no valores internos?
- La lista, el detalle y el edit muestran el mismo lenguaje?

## 13. Que NO implementar todavia

- sistema real de colecciones Leyendas
- borrado/archivado si no estaba aprobado
- importacion Woo
- sincronizacion de terminos Woo
- interfaz visual compleja de taxonomias
- abstraccion generica sobredimensionada si no hay segundo uso claro
