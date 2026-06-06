# Prompts — Discovery Intake Pack

Este directorio contiene los prompts operativos para guiar cada fase del Discovery Intake. Cada prompt está diseñado para ser usado en el LLM orquestador (ChatGPT u otro) o en Claude Code con el contexto del repo.

---

## Secuencia de uso

Los prompts siguen la secuencia del workflow de discovery. Usarlos en orden, no saltar fases.

```
1. prompt_discovery_read_only.md    ← inspeccionar fuentes sin modificar nada
2. prompt_as_is_synthesis.md        ← sintetizar comprensión AS-IS desde las fuentes
3. prompt_conflict_review.md        ← revisar y resolver conflictos entre fuentes
4. prompt_target_options.md         ← proponer opciones de diseño TARGET
5. prompt_seed_generation.md        ← convertir discovery validado en PROJECT_SEED
```

El paso 3 puede ejecutarse en paralelo con el paso 2, o como un ciclo de revisión posterior. Los pasos 4 y 5 requieren que el AS-IS esté validado.

---

## Cuándo usar cada prompt

| Prompt | Cuándo usarlo | Prerequisito |
|--------|---------------|-------------|
| `prompt_discovery_read_only.md` | Al inicio del intake, para explorar fuentes disponibles | `LAFABRICA_INTAKE_MANIFEST.md` completo y `SOURCE_REGISTRY.md` con fuentes declaradas |
| `prompt_as_is_synthesis.md` | Después de leer las fuentes principales | Al menos una fuente en estado `PROCESADA` |
| `prompt_conflict_review.md` | Cuando hay entradas en `CONFLICT_REGISTER.md` con estado `DETECTADO` | `CONFLICT_REGISTER.md` con al menos un conflicto registrado |
| `prompt_target_options.md` | Después de validar el AS-IS | `AS_IS_UNDERSTANDING.md` en estado `VALIDADO_POR_USUARIO` |
| `prompt_seed_generation.md` | Después de aprobar una opción TARGET | `TARGET_OPTIONS.md` en estado `OPCIÓN_APROBADA` |

---

## Cómo usar estos prompts

1. Abre el prompt correspondiente a la fase actual.
2. Sigue las instrucciones de relleno (secciones marcadas con `[...]`).
3. Pega el prompt completo en tu LLM orquestador o en Claude Code.
4. Revisa el output antes de incorporarlo a los documentos del pack.
5. La persona usuaria debe validar antes de avanzar a la siguiente fase.

---

## Notas

- Los prompts están en modo **leer y sintetizar**, no en modo **decidir**. Las decisiones las toma la persona usuaria.
- El agente puede proponer, estructurar y comparar. No puede aprobar ni validar por sí solo.
- Si el output de un prompt revela nueva información relevante, actualizar el `SOURCE_REGISTRY.md` y el `CONFLICT_REGISTER.md` antes de continuar.
