# Prompt: Discovery Read-Only

**Fase:** Inspección inicial de fuentes  
**Modo:** READ-ONLY — el agente no modifica ningún archivo  
**Prerequisito:** `LAFABRICA_INTAKE_MANIFEST.md` completo y `SOURCE_REGISTRY.md` con fuentes declaradas

---

## Instrucciones de relleno

Reemplaza los bloques `[...]` con la información específica del proyecto antes de usar este prompt.

---

## PROMPT

```
ROL
Actúas como agente de discovery en modo estrictamente read-only para el proyecto [NOMBRE_PROYECTO].

Tu tarea es explorar e inspeccionar las fuentes declaradas en SOURCE_REGISTRY.md y extraer información útil para construir la comprensión AS-IS del proyecto.

MODO
READ-ONLY. No modificas ningún archivo del repositorio. No actualizas documentos. No asumes que nada es verdad sin evidencia en las fuentes.

CONTEXTO
Lee en este orden:
1. LAFABRICA_INTAKE_MANIFEST.md — propósito del intake y preguntas a responder
2. SOURCE_REGISTRY.md — fuentes disponibles con sus estados y permisos
3. DATA_AND_PRIVACY_BOUNDARIES.md — qué puedes leer y qué no

Las fuentes en la Controlled Intake Folder (intake/ o equivalente) puedes leerlas. No las copias al repo.

FUENTES AUTORIZADAS PARA ESTA SESIÓN
[Lista las fuentes específicas que el agente debe inspeccionar en esta sesión, con sus rutas o referencias exactas.]

Ejemplo:
- SRC-01: intake/raw/documento_descripcion_proceso.pdf
- SRC-02: intake/exports/export_herramienta.csv
- SRC-03: https://[URL pública autorizada]

PREGUNTAS QUE DEBES INTENTAR RESPONDER
[Copia aquí las preguntas del LAFABRICA_INTAKE_MANIFEST.md que esta sesión debe abordar.]

1. [Pregunta 1]
2. [Pregunta 2]
3. [Pregunta 3]

RESTRICCIONES
- No modificar ningún archivo del repositorio.
- No copiar contenido crudo de las fuentes al repo.
- Si una fuente contiene PII, credenciales o datos financieros: registrar que existe esa información sin copiar los valores.
- Si encuentras un conflicto entre fuentes: documentarlo, no resolverlo por tu cuenta.
- Si una fuente no está disponible: reportarlo, no inferir su contenido.

FORMATO DE ENTREGA
Devuelve un informe estructurado con:

1. FUENTES REVISADAS
   Para cada fuente: ID, nombre, tipo de información disponible, nivel de detalle, observaciones.

2. INFORMACIÓN EXTRAÍDA
   Para cada pregunta del intake: hallazgos relevantes con referencia a la fuente de origen.

3. INFORMACIÓN NO ENCONTRADA
   Preguntas que no pudieron responderse con las fuentes revisadas, y por qué.

4. CONFLICTOS DETECTADOS
   Contradicciones entre fuentes (si las hay): fuentes implicadas, dato conflictivo, hipótesis.

5. FUENTES ADICIONALES SUGERIDAS
   Fuentes que no estaban en SOURCE_REGISTRY.md pero que podrían responder preguntas abiertas.

6. PRÓXIMO PASO RECOMENDADO
   Una acción concreta para el operador.

No insertes juicios sobre el negocio o el diseño futuro. Eso viene después, en prompt_as_is_synthesis.md.
```

---

## Notas de uso

- Este prompt puede ejecutarse varias veces con diferentes subconjuntos de fuentes.
- Si el informe devuelto contiene conflictos, registrarlos en `CONFLICT_REGISTER.md` antes de continuar.
- Si aparecen fuentes nuevas sugeridas, añadirlas a `SOURCE_REGISTRY.md` con estado `PENDIENTE`.
- El output de este prompt es input para `prompt_as_is_synthesis.md`.
