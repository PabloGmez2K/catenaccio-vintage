# AS_IS_UNDERSTANDING — [NOMBRE_PROYECTO]

Comprensión documentada del estado actual del proyecto/negocio/sistema. Este documento se construye a partir de las fuentes registradas en `SOURCE_REGISTRY.md` y los conflictos resueltos en `CONFLICT_REGISTER.md`.

**Solo puede avanzarse al diseño TARGET una vez que este documento esté en estado `VALIDADO_POR_USUARIO`.**

**Proyecto:** [NOMBRE_PROYECTO]  
**Fecha de última actualización:** [FECHA]  
**Estado:** [BORRADOR / EN_REVISIÓN / VALIDADO_POR_USUARIO]  
**Fuentes consultadas:** [SRC-01, SRC-02, ...]  
**Conflictos resueltos antes de esta versión:** [CONF-001, CONF-002, ... / ninguno]

---

## Hechos confirmados

[Información verificada por al menos una fuente y sin contradicciones pendientes. Cada ítem debe referenciar la fuente que lo sustenta.]

- [Hecho confirmado 1] — fuente: [SRC-XX]
- [Hecho confirmado 2] — fuente: [SRC-XX, SRC-YY]

---

## Hipótesis (requieren validación)

[Afirmaciones que parecen probables basadas en las fuentes, pero que no han sido confirmadas explícitamente por la persona usuaria o que se derivan de inferencias sobre la información disponible.]

- [Hipótesis 1]: [por qué se infiere] — **pendiente de validar**
- [Hipótesis 2]: [por qué se infiere] — **pendiente de validar**

---

## Incógnitas conocidas

[Preguntas que el discovery no pudo responder con las fuentes disponibles. Documentarlas evita que se asuman como resueltas durante el diseño TARGET.]

- [Incógnita 1]: [por qué no se pudo responder y qué impacto tiene]
- [Incógnita 2]: [por qué no se pudo responder y qué impacto tiene]

---

## Procesos actuales

[Descripción de los procesos reales documentados. Usar descripción paso a paso. No asumir eficiencia ni racionalidad — documentar lo que realmente ocurre, no lo que debería ocurrir.]

### Proceso: [Nombre del proceso]

**Disparador:** [qué inicia este proceso]  
**Pasos:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Actores:** [quiénes participan]  
**Output:** [resultado del proceso]  
**Frecuencia:** [con qué frecuencia ocurre]  
**Problemas conocidos:** [fricciones, errores frecuentes, cuellos de botella]

---

## Sistemas y herramientas actuales

[Inventario de herramientas, plataformas y sistemas que el proyecto/negocio usa hoy. No incluir herramientas deseadas o futuras — solo lo que existe.]

| Herramienta / sistema | Para qué se usa | Integrado con | Problemas conocidos |
|----------------------|-----------------|---------------|---------------------|
| [herramienta 1] | [uso] | [otros sistemas] | [problemas] |

---

## Problemas detectados

[Problemas, fricciones y puntos de dolor observados en el AS-IS. Estos son los drivers del diseño TARGET.]

| ID | Problema | Impacto | Fuente que lo evidencia | Prioridad |
|----|---------|---------|------------------------|-----------|
| PROB-01 | [descripción] | [impacto en el negocio/proyecto] | [SRC-XX] | [alta / media / baja] |

---

## Activos reutilizables

[Elementos del AS-IS que tienen valor y pueden reutilizarse en el diseño TARGET, en lugar de descartarse o reconstruirse desde cero.]

- [Activo 1]: [por qué tiene valor y cómo podría reutilizarse]
- [Activo 2]: [por qué tiene valor y cómo podría reutilizarse]

---

## Cosas que no deben asumirse

[Lista explícita de afirmaciones que podrían parecer obvias pero que las fuentes no confirman, o que la persona usuaria ha descartado explícitamente como incorrectas.]

- **No asumir:** [afirmación incorrecta o no confirmada]
- **No asumir:** [afirmación incorrecta o no confirmada]

---

## Validación

Este documento debe ser revisado y aprobado por la persona usuaria antes de que el workflow avance a `TARGET_OPTIONS.md`.

**Instrucción para la persona usuaria:**  
Lee cada sección. Para cada ítem:
- Si es correcto: no hagas nada.
- Si algo es incorrecto o incompleto: añade una nota bajo el ítem o actualiza directamente.
- Cuando hayas revisado todo: cambia el estado de este documento a `VALIDADO_POR_USUARIO` y registra la validación en `VALIDATION_RECORD.md`.

**Estado de validación:** [pendiente / aprobado por [nombre/rol] en [fecha]]
