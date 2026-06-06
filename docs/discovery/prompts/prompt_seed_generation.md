# Prompt: Seed Generation

**Fase:** Generación del PROJECT_SEED desde el discovery validado  
**Modo:** GENERACIÓN — el agente produce el SEED; el orquestador lo revisa antes de ejecutar `lafabrica new`  
**Prerequisito:** `TARGET_OPTIONS.md` en estado `OPCIÓN_APROBADA`; `AS_IS_UNDERSTANDING.md` en estado `VALIDADO_POR_USUARIO`

---

## Instrucciones de relleno

Reemplaza los bloques `[...]` con la información específica del proyecto antes de usar este prompt.

---

## PROMPT

```
ROL
Actúas como agente de generación del PROJECT_SEED para el proyecto [NOMBRE_PROYECTO]. Tu tarea es convertir el discovery validado en un SEED implementable listo para `lafabrica new`.

MODO
GENERACIÓN. Produces el SEED completo. No puedes aprobar el SEED — eso lo hace la persona usuaria.

CONTEXTO
Lee en este orden:
1. templates/LAFABRICA_PROJECT_SEED.md — estructura exacta que debe tener el SEED
2. AS_IS_UNDERSTANDING.md — comprensión validada del estado actual
3. TARGET_OPTIONS.md — opción aprobada y su descripción
4. RECOMMENDED_IMPLEMENTATION_PLAN.md — fases del plan (si ya está generado)
5. LAFABRICA_INTAKE_MANIFEST.md — restricciones, preferencias y criterios de salida

OPCIÓN TARGET APROBADA
[Copia aquí el nombre y la descripción de la opción aprobada en TARGET_OPTIONS.md.]

RESTRICCIONES DEL PROYECTO
[Copia las restricciones del LAFABRICA_INTAKE_MANIFEST.md relevantes para el SEED.]

TAREA
Genera el SEED completo usando la plantilla `templates/LAFABRICA_PROJECT_SEED.md`. Rellena todos los campos con información del discovery:

- NOMBRE_PROYECTO: derivado del slug del proyecto.
- DESCRIPCION: qué hace el proyecto, para quién, qué problema resuelve (directamente del AS-IS).
- PROBLEMA_REAL: el problema central documentado en el AS-IS validado.
- USUARIO_OBJETIVO: identificado en el AS-IS.
- OBJETIVO_ECONOMICO_ESTRATEGICO: extraído del LAFABRICA_INTAKE_MANIFEST.md.
- RESULTADO_30_DIAS: primer hito verificable del RECOMMENDED_IMPLEMENTATION_PLAN.md.
- CONTEXTO_IMPORTANTE: restricciones y datos clave del AS-IS que el agente de implementación necesita saber.
- DECISIONES_TOMADAS: decisiones tomadas durante el discovery (opción TARGET, descarte de alternativas).
- HIPOTESIS: hipótesis que quedaron del AS-IS y deben validarse durante la implementación.
- DUDAS_ABIERTAS: incógnitas aceptadas del AS-IS que no se resolvieron en el discovery.
- MVP_RECOMENDADO: derivado de la opción TARGET aprobada y la Fase 3 del plan.
- FUNCIONALIDADES: NOW/NEXT/LATER/BLOCKED derivados del RECOMMENDED_IMPLEMENTATION_PLAN.md.
- QUE_NO_CONSTRUIR_TODAVIA: límites explícitos de la opción TARGET y del LAFABRICA_INTAKE_MANIFEST.md.
- RIESGOS: tabla de riesgos de la opción TARGET, con mitigaciones.
- STACK_RECOMENDADO: derivado de la opción TARGET y los activos reutilizables del AS-IS.
- TIPO_DE_PROYECTO: clasificación según el dominio.
- ORIGEN_DEL_PROYECTO: discovery-intake (obligatorio para proyectos generados por este flujo).
- ESTRUCTURA_INICIAL_REPO: estructura de carpetas coherente con el stack y el tipo de proyecto.
- AGENTES_RECOMENDADOS: extraídos de las preferencias del LAFABRICA_INTAKE_MANIFEST.md.
- SUPERFICIE_PREFERIDA: según las herramientas disponibles del operador.
- PERFIL_RECOMENDADO: generic o internal-suite, según la sensibilidad de los datos.
- DATOS_SENSIBLES: datos del AS-IS que requieren atención en el repo generado.
- GUARDRAILS_DOMINIO: restricciones específicas del dominio, derivadas del AS-IS.
- TOKEN_ECONOMICS_INICIAL: ejemplos concretos del dominio descubierto.
- BACKLOG_INICIAL: NOW con los ítems de la Fase 1-2 del plan.
- CRITERIOS_DE_EXITO: derivados del LAFABRICA_INTAKE_MANIFEST.md criterio de salida.
- CRITERIOS_DE_PARADA: derivados del RECOMMENDED_IMPLEMENTATION_PLAN.md.
- PRIMER_PROMPT_ORQUESTADOR: prompt listo para pegar en ChatGPT con el contexto del discovery.

NOTA OBLIGATORIA
El SEED debe incluir una referencia al origen del discovery:

> Este SEED fue generado a partir de Discovery Intake. Los documentos de origen están en:
> - docs/discovery/AS_IS_UNDERSTANDING.md
> - docs/discovery/TARGET_OPTIONS.md
> - docs/discovery/VALIDATION_RECORD.md

RESTRICCIONES
- No inventar datos que no estén en los documentos del discovery.
- No asumir stack o herramientas que no aparezcan en el AS-IS o en las preferencias del MANIFEST.
- No incluir PII, credenciales ni datos financieros confidenciales en el SEED.
- No generar el comando `lafabrica new` todavía — solo el SEED.

FORMATO DE ENTREGA
SEED completo en formato Markdown, listo para guardar como `C:\Projects\seeds\[slug]_SEED.md`.

Al final, añade una lista de verificación para el operador:
- Campos que requieren revisión manual por ser derivados de inferencias.
- Hipótesis del AS-IS que el SEED hereda y que el operador debe decidir si aceptar.
- Stack o decisiones técnicas que requieren confirmación antes de ejecutar `lafabrica new`.

INSTRUCCIÓN PARA EL OPERADOR
Revisa el SEED. Cuando esté aprobado:
1. Guárdalo como C:\Projects\seeds\[slug]_SEED.md.
2. Registra la aprobación en VALIDATION_RECORD.md con estado SEED_APROBADO.
3. Ejecuta: lafabrica new [slug]
```

---

## Notas de uso

- El SEED generado siempre tiene `ORIGEN_DEL_PROYECTO: discovery-intake` y referencias a los documentos del pack.
- Si el SEED requiere cambios sustanciales durante la revisión, regenerar antes de guardar.
- Una vez ejecutado `lafabrica new`, el discovery está cerrado. Registrar en `VALIDATION_RECORD.md` con estado `DISCOVERY_CERRADO`.
- Los documentos del pack (AS-IS, TARGET, VALIDATION_RECORD) se copian a `docs/discovery/` del proyecto generado para trazabilidad.
