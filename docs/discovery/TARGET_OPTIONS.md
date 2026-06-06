# TARGET_OPTIONS — [NOMBRE_PROYECTO]

Opciones de diseño TARGET para el proyecto. Este documento se genera **después** de que `AS_IS_UNDERSTANDING.md` tenga estado `VALIDADO_POR_USUARIO`.

Su propósito es comparar alternativas de forma neutral, no vender una solución. La persona usuaria elige y aprueba una opción; solo entonces se genera el plan de implementación.

**Proyecto:** [NOMBRE_PROYECTO]  
**Fecha:** [FECHA]  
**Basado en AS-IS validado:** [FECHA de validación del AS-IS]  
**Estado:** [BORRADOR / EN_REVISIÓN / OPCIÓN_APROBADA]  
**Opción aprobada:** [OPCIÓN-N o "ninguna todavía"]

---

## Problema principal a resolver

[Una sola frase que describe el problema central que el TARGET debe resolver. Debe derivarse directamente de los problemas detectados en `AS_IS_UNDERSTANDING.md`.]

---

## Criterios de evaluación

[Qué factores importan para elegir entre opciones. Específicos de este proyecto. Ejemplos comunes:]

- Velocidad de implementación (time-to-value).
- Costo de mantenimiento a largo plazo.
- Dependencia de herramientas externas.
- Reversibilidad: ¿qué tan fácil es cambiar de opción si no funciona?
- Capacidad del equipo para operar la solución.
- Riesgo de migración de datos.

---

## Opciones

### OPCIÓN-1 — [Nombre descriptivo]

**Qué resuelve:**  
[Descripción de qué problema/s resuelve esta opción y cómo.]

**Descripción técnica o estructural:**  
[Cómo funciona la opción. Sin exceso de detalle — suficiente para comparar.]

**Trade-offs:**

| Ventaja | Desventaja |
|---------|-----------|
| [ventaja 1] | [desventaja 1] |
| [ventaja 2] | [desventaja 2] |

**Riesgos:**
- [Riesgo 1]: [probabilidad / impacto / mitigación posible]
- [Riesgo 2]: [probabilidad / impacto / mitigación posible]

**Dependencias:**
- [Qué requiere esta opción: herramientas, accesos, infraestructura, conocimiento]

**Costo / fricción estimada:**  
[Estimación relativa: bajo / medio / alto. No un número exacto — una escala para comparar.]

**Reversibilidad:**  
[¿Qué tan fácil es deshacer esta opción si no funciona? ¿Qué se pierde?]

**Recomendación del agente:**  
[Si el agente tiene una posición clara, expresarla aquí. Si no, decirlo explícitamente.]

---

### OPCIÓN-2 — [Nombre descriptivo]

**Qué resuelve:**  
[...]

**Descripción técnica o estructural:**  
[...]

**Trade-offs:**

| Ventaja | Desventaja |
|---------|-----------|
| [...] | [...] |

**Riesgos:**
- [...]

**Dependencias:**
- [...]

**Costo / fricción estimada:**  
[...]

**Reversibilidad:**  
[...]

**Recomendación del agente:**  
[...]

---

### OPCIÓN-3 — [Nombre descriptivo] _(opcional)_

[Añadir si hay una tercera opción relevante. Máximo cuatro opciones en total para que la comparación sea manejable.]

---

## Tabla resumen comparativa

| Criterio | OPCIÓN-1 | OPCIÓN-2 | OPCIÓN-3 |
|----------|----------|----------|----------|
| Velocidad de implementación | [bajo/medio/alto] | [...] | [...] |
| Costo de mantenimiento | [...] | [...] | [...] |
| Reversibilidad | [...] | [...] | [...] |
| Dependencias externas | [...] | [...] | [...] |
| Riesgo global | [...] | [...] | [...] |
| Recomendación | [✓ / — / —] | [...] | [...] |

---

## Opciones descartadas

[Opciones que se consideraron y se descartaron antes de escribir este documento, con la razón. Documentarlas evita re-debatirlas.]

| Opción descartada | Razón |
|-------------------|-------|
| [opción] | [razón] |

---

## Instrucción para la persona usuaria

Lee las opciones y el resumen comparativo. Elige una opción o indica ajustes que necesitas antes de decidir.

Cuando hayas decidido:
1. Cambia el estado de este documento a `OPCIÓN_APROBADA`.
2. Escribe el nombre de la opción aprobada en el campo `Opción aprobada` de la cabecera.
3. Registra la aprobación en `VALIDATION_RECORD.md`.
4. El agente generará `RECOMMENDED_IMPLEMENTATION_PLAN.md` basándose en la opción aprobada.

**La aprobación de una opción TARGET es irreversible dentro de esta iteración del discovery.** Si más adelante se quiere cambiar la opción, se abre una nueva iteración.
