# Discovery Intake Pack

**Pack opcional para lafabrica · v0.4**  
**Última actualización:** 2026-06-06

---

## Qué es Discovery Intake

Discovery Intake es el flujo de lafabrica para proyectos que **no nacen de una idea limpia**, sino de una realidad existente: un negocio en marcha, una herramienta ya en uso, una historia de decisiones tomadas, fuentes heterogéneas de información y datos dispersos que deben ser comprendidos antes de poder construir algo nuevo.

En lugar de empezar con un SEED especulativo, Discovery Intake empieza por capturar y estructurar lo que ya existe, validarlo con la persona usuaria y construir un SEED desde la evidencia.

---

## Cuándo activarlo

Activa este pack cuando el proyecto cumple al menos una de estas condiciones:

- Hay un negocio, sistema o proceso **existente** que el proyecto debe entender, mejorar o reemplazar.
- Las fuentes de información son **heterogéneas**: documentos, exports, capturas, conversaciones, URLs, credenciales de herramientas SaaS.
- El **AS-IS no está documentado** y construirlo mal representaría un riesgo real.
- Las decisiones de diseño dependen de **validar hipótesis sobre la realidad actual** antes de comprometerse con un enfoque.
- La persona usuaria no tiene claro qué opciones tiene para el TARGET y necesita que el sistema las compare.
- El punto de partida es opaco: hay datos que no se pueden asumir sin evidencia.

---

## Cuándo NO activarlo

No actives este pack si:

- El proyecto es **greenfield puro**: no hay sistema previo relevante, la idea ya está clara y el SEED puede generarse directamente desde el chat de ideación.
- El nivel de comprensión del dominio ya es suficiente para generar un SEED accionable sin discovery adicional.
- El ciclo de discovery generaría más overhead documental que valor real en las primeras dos semanas de trabajo.
- Solo hay una fuente de información y no genera incertidumbre real.

> Regla práctica: si puedes responder con confianza las preguntas del `LAFABRICA_PROJECT_SEED.md` — problema real, usuario, MVP, criterios de éxito — sin discovery previo, no lo necesitas.

---

## Diferencia con el flujo greenfield actual

| Flujo greenfield | Discovery Intake |
|-----------------|-----------------|
| Idea → chat de ideación → SEED | Fuentes existentes → intake → AS-IS → TARGET_OPTIONS → SEED |
| El SEED se genera antes de ver el proyecto | El SEED se genera **después** de validar el AS-IS y aprobar una opción TARGET |
| El contexto viene del chat de ideación | El contexto viene de fuentes reales (documentos, exports, herramientas) |
| Incertidumbre asumida como hipótesis | Incertidumbre documentada y resuelta explícitamente antes de comprometerse |
| Un ciclo antes de `lafabrica new` | Varios ciclos documentados antes de `lafabrica new` |

Los dos flujos convergen en `lafabrica new`: el output de Discovery Intake **siempre** es un `PROJECT_SEED.md` implementable.

---

## Relación con Company Brain Pack

Discovery Intake y el Company Brain Starter Pack son complementarios pero distintos:

- **Company Brain Pack** (`docs/orchestrator/company_brain_pack/`): gestión operativa continua de fuentes de conocimiento en proyectos que ya están en marcha. Flujo de mantenimiento.
- **Discovery Intake Pack** (este pack): flujo de **arranque y diagnóstico** para proyectos que necesitan entender la realidad antes de diseñar el futuro. Flujo de inicio.

Un proyecto puede usar ambos: Discovery Intake para el arranque y Company Brain Pack para la operación continua posterior. Un proyecto puede usar solo Company Brain si ya tiene el AS-IS documentado y el SEED generado.

---

## Relación con la Controlled Intake Folder

La **Controlled Intake Folder** es un directorio local **fuera del repo** (o ignorado por Git) donde la persona usuaria deposita archivos brutos: exports, capturas, PDFs, documentos de referencia, credenciales de acceso.

- Los archivos en la Controlled Intake Folder son **fuentes**, no conocimiento aprobado.
- El agente local puede leerlos en modo read-only para extraer información útil.
- Nada de la Controlled Intake Folder entra al repo sin pasar por el proceso de saneamiento documentado en `DATA_AND_PRIVACY_BOUNDARIES.md`.
- El conocimiento estructurado, saneado y validado es el que queda en `docs/discovery/` del repo.

Ver `DATA_AND_PRIVACY_BOUNDARIES.md` para las reglas detalladas.

---

## Salida esperada

El output de un Discovery Intake completo es:

1. **`AS_IS_UNDERSTANDING.md`** — comprensión validada del estado actual.
2. **`TARGET_OPTIONS.md`** — opciones de diseño TARGET comparadas.
3. **`RECOMMENDED_IMPLEMENTATION_PLAN.md`** — plan por fases desde la opción aprobada.
4. **`PROJECT_SEED.md`** — SEED implementable listo para `lafabrica new`.

El SEED resultante es idéntico en forma al SEED greenfield, pero incluye el campo `ORIGEN_DEL_PROYECTO: discovery-intake` y referencias a los documentos de discovery.

---

## Límites explícitos

Discovery Intake **no incluye**:

- RAG (Retrieval-Augmented Generation) sobre las fuentes originales.
- Conectores SaaS automáticos o scraping automatizado.
- Migración automática de datos.
- Deploy o infraestructura.
- Validación de fuentes sin intervención humana.

Todo lo que requiera automatización sobre las fuentes originales se trata como trabajo futuro del proyecto hijo, no del proceso de discovery.

---

## Estructura del pack

```
discovery_intake_pack/
├── README.md                          # Este archivo
├── LAFABRICA_INTAKE_MANIFEST.md       # Declaración inicial del intake
├── SOURCE_REGISTRY.md                 # Registro de fuentes disponibles
├── CONFLICT_REGISTER.md               # Contradicciones entre fuentes
├── DATA_AND_PRIVACY_BOUNDARIES.md     # Reglas de privacidad y saneamiento
├── AS_IS_UNDERSTANDING.md             # Comprensión del estado actual
├── TARGET_OPTIONS.md                  # Opciones de diseño TARGET
├── RECOMMENDED_IMPLEMENTATION_PLAN.md # Plan por fases
├── VALIDATION_RECORD.md               # Registro de validaciones humanas
└── prompts/
    ├── README.md                      # Guía de uso de prompts
    ├── prompt_discovery_read_only.md  # Inspección de fuentes sin modificar
    ├── prompt_as_is_synthesis.md      # Síntesis del AS-IS
    ├── prompt_conflict_review.md      # Revisión de conflictos entre fuentes
    ├── prompt_target_options.md       # Propuesta de opciones TARGET
    └── prompt_seed_generation.md      # Conversión a PROJECT_SEED
```

---

## Cómo activar el pack en un proyecto

1. Copia el contenido de este directorio a `docs/discovery/` del proyecto hijo.
2. Rellena `LAFABRICA_INTAKE_MANIFEST.md` con el contexto inicial conocido.
3. Registra las fuentes disponibles en `SOURCE_REGISTRY.md`.
4. Usa los prompts de `prompts/` para guiar cada fase del discovery.
5. Valida AS-IS con la persona usuaria antes de pasar a TARGET_OPTIONS.
6. Aprueba una opción TARGET antes de generar el SEED.
7. Genera el SEED con `prompt_seed_generation.md` y ejecuta `lafabrica new`.

El pack **no se copia automáticamente** al crear proyectos con `lafabrica new`. Se activa manualmente cuando la clasificación del proyecto lo justifica.
