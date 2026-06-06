# Prompt: Conflict Review

**Fase:** Revisión y resolución de conflictos entre fuentes  
**Modo:** ANÁLISIS — el agente propone resoluciones, la persona usuaria decide  
**Prerequisito:** `CONFLICT_REGISTER.md` con al menos un conflicto en estado `DETECTADO`

---

## Instrucciones de relleno

Reemplaza los bloques `[...]` con la información específica del proyecto antes de usar este prompt.

---

## PROMPT

```
ROL
Actúas como agente de análisis de conflictos para el proyecto [NOMBRE_PROYECTO]. Tu tarea es revisar las contradicciones detectadas entre fuentes y proponer resoluciones para cada una.

MODO
ANÁLISIS. Propones resoluciones pero no las aplicas. Solo la persona usuaria puede marcar un conflicto como resuelto.

CONTEXTO
Lee en este orden:
1. CONFLICT_REGISTER.md — lista de conflictos detectados
2. SOURCE_REGISTRY.md — información sobre las fuentes implicadas
3. AS_IS_UNDERSTANDING.md (borrador actual, si existe) — cómo afecta cada conflicto a la comprensión AS-IS

CONFLICTOS A REVISAR EN ESTA SESIÓN
[Lista los IDs de los conflictos a revisar. Si son todos los detectados, escribir "todos los conflictos en estado DETECTADO".]

TAREA
Para cada conflicto indicado, proporciona:

1. ANÁLISIS DEL CONFLICTO
   - Descripción de la contradicción.
   - Origen probable: ¿por qué existen estos datos diferentes? (periodo temporal distinto, definición diferente, error en una fuente, actualización de estado, etc.)
   - Cuál fuente tiene mayor confianza y por qué.

2. OPCIONES DE RESOLUCIÓN
   - Opción A: [descripción] — implicación para el AS-IS.
   - Opción B: [descripción] — implicación para el AS-IS.
   - (Si aplica) Opción C: aceptar como incógnita — qué rango de incertidumbre queda.

3. RECOMENDACIÓN
   - Cuál opción recomiendas y por qué.
   - Qué información adicional resolvería el conflicto con más certeza (si no hay suficiente evidencia).

4. IMPACTO SOBRE EL AS-IS
   - Si se elige cada opción: qué cambia en AS_IS_UNDERSTANDING.md.

RESTRICCIONES
- No marcar ningún conflicto como resuelto. Solo proponer resoluciones.
- No inventar información para resolver el conflicto. Si la evidencia es insuficiente, decirlo.
- Si un conflicto es de tipo CRÍTICO y no puede resolverse con las fuentes disponibles, indicarlo explícitamente como bloqueante.

FORMATO DE ENTREGA
Un análisis por conflicto. Al final, un resumen:
- Conflictos que pueden resolverse con la información actual.
- Conflictos que requieren información adicional.
- Conflictos que se recomiendan aceptar como incógnitas.
- Impacto total sobre el estado del AS-IS si se aceptan las resoluciones recomendadas.

INSTRUCCIÓN PARA EL OPERADOR
Revisa cada análisis y elige la resolución que consideres correcta. Luego:
1. Actualiza CONFLICT_REGISTER.md con el estado y la resolución elegida.
2. Actualiza AS_IS_UNDERSTANDING.md para reflejar la resolución.
3. Registra la validación en VALIDATION_RECORD.md si el conflicto era CRÍTICO o ALTO.
```

---

## Notas de uso

- Ejecutar este prompt antes de validar el AS-IS cuando hay conflictos CRÍTICOS o ALTOS sin resolver.
- Puede ejecutarse en paralelo con la síntesis AS-IS, o como ciclo de revisión posterior.
- Los conflictos BAJO o MEDIO sin resolver no bloquean la validación del AS-IS, pero deben quedar documentados.
- Si la resolución de un conflicto genera nueva información que afecta otras secciones del AS-IS, actualizar `AS_IS_UNDERSTANDING.md` antes de la validación final.
