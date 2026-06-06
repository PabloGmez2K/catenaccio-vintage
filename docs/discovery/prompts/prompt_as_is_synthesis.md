# Prompt: AS-IS Synthesis

**Fase:** Síntesis del estado actual  
**Modo:** SÍNTESIS — el agente propone el contenido de AS_IS_UNDERSTANDING.md  
**Prerequisito:** Al menos una fuente en estado `PROCESADA`; informe de `prompt_discovery_read_only.md` disponible

---

## Instrucciones de relleno

Reemplaza los bloques `[...]` con la información específica del proyecto antes de usar este prompt.

---

## PROMPT

```
ROL
Actúas como agente de síntesis para el proyecto [NOMBRE_PROYECTO]. Tu tarea es construir el borrador de AS_IS_UNDERSTANDING.md a partir de los hallazgos del discovery.

MODO
SÍNTESIS. No inventas ni especulas. Solo documentas lo que las fuentes evidencian. Lo que no está en las fuentes se marca como hipótesis o incógnita.

CONTEXTO
Lee en este orden:
1. LAFABRICA_INTAKE_MANIFEST.md — propósito del intake y preguntas a responder
2. SOURCE_REGISTRY.md — estado de cada fuente
3. CONFLICT_REGISTER.md — conflictos detectados y su estado de resolución
4. [Informe(s) de prompt_discovery_read_only.md de esta sesión]

INFORMACIÓN DISPONIBLE
[Pega aquí el informe completo del prompt_discovery_read_only.md, o referencia el archivo donde está guardado.]

RESTRICCIONES
- Separar explícitamente: hechos confirmados / hipótesis / incógnitas.
- Cada hecho confirmado debe referenciar la fuente que lo sustenta (SRC-XX).
- Los conflictos no resueltos en CONFLICT_REGISTER.md deben reflejarse como incógnitas, no como hechos.
- No incluir datos PII, credenciales ni valores financieros confidenciales.
- No diseñar el TARGET todavía. Este documento es solo AS-IS.
- Si la información es insuficiente para documentar un aspecto relevante, documentar la incógnita en lugar de inventar.

TAREA
Produce el contenido completo de AS_IS_UNDERSTANDING.md usando la estructura de la plantilla. Rellena todas las secciones con la información disponible:

1. Hechos confirmados (con referencia a fuentes)
2. Hipótesis (con justificación de por qué se infieren)
3. Incógnitas conocidas (con impacto estimado)
4. Procesos actuales (descripción paso a paso de lo documentado)
5. Sistemas y herramientas actuales (inventario)
6. Problemas detectados (tabla con impacto)
7. Activos reutilizables
8. Cosas que no deben asumirse

FORMATO DE ENTREGA
Devuelve el contenido listo para pegar en AS_IS_UNDERSTANDING.md. Usa la estructura exacta de la plantilla del pack.

Al final, añade una sección de notas para el operador:
- Qué aspectos del AS-IS tienen baja confianza y deberían revisarse con más fuentes.
- Qué preguntas del LAFABRICA_INTAKE_MANIFEST.md quedaron sin respuesta.
- Conflictos pendientes que impiden marcar este documento como completo.

INSTRUCCIÓN PARA EL OPERADOR
El borrador que genero no es el AS-IS final. Debes revisarlo, corregir lo que sea incorrecto y validarlo antes de avanzar a TARGET_OPTIONS.
```

---

## Notas de uso

- Después de recibir el borrador, la persona usuaria lo revisa en `AS_IS_UNDERSTANDING.md`.
- Cuando el AS-IS esté aprobado, cambiar el estado a `VALIDADO_POR_USUARIO` y registrar en `VALIDATION_RECORD.md`.
- Si la revisión genera cambios sustanciales, reevaluar los conflictos en `CONFLICT_REGISTER.md`.
- Solo tras la validación humana se puede usar `prompt_target_options.md`.
