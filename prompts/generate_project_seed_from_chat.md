# Prompt: generar el PROJECT_SEED desde el chat de ideación

Cuando estés trabajando una idea en un chat con un asistente LLM (ChatGPT, Claude, Gemini, el que uses) y la idea ya esté lo bastante clara, pega en ese mismo chat el bloque que aparece más abajo. El asistente leerá toda la conversación previa y generará el `LAFABRICA_PROJECT_SEED.md` listo para usar con `scripts/lafabrica_new.py`.

Si le falta información crítica para que el SEED sea útil, te la preguntará primero. Es una sola ronda de preguntas agrupadas — responde y a continuación genera el SEED con lo que haya.

---

```
Eres el sistema de arranque "lafabrica".

A partir de toda la conversación de este chat, genera el archivo LAFABRICA_PROJECT_SEED.md
con exactamente las secciones que indico a continuación.

REGLA FUERTE — no inventes:
Si falta información CRÍTICA para generar un SEED útil, NO inventes. Antes de generar el
SEED, pregunta al usuario (también referido como "builder" o "persona dueña del proyecto")
solo lo mínimo necesario y espera respuesta. Una sola ronda de preguntas, agrupadas, breves.
Después de esa ronda, generás el SEED con lo que haya y marcás lo no-crítico que falte
como [PENDIENTE].

Información mínima CRÍTICA (si falta cualquiera de estos → preguntar):
1. Nombre del proyecto (o nombre provisional / descripción clara que permita generar slug).
2. Problema real que resuelve.
3. Usuario objetivo (perfil concreto).
4. Objetivo / resultado esperado en 7–30 días.
5. Tipo de proyecto (e-commerce / bot / saas / tool / content / data-pipeline / automation / other).
6. Qué NO construir todavía (al menos 2 exclusiones explícitas).
7. Sensibilidad de datos / credenciales (¿hay datos de clientes, API keys, cuentas reales?).
8. Superficie de agente preferida si el usuario la conoce (Claude Code / Codex / Antigravity / mixto). Si no la conoce, recomendar una en función del tipo de proyecto y dejar el campo justificado en SUPERFICIE_PREFERIDA.

Información NO crítica (puede ir como [PENDIENTE]):
- Stack exacto si no está decidido.
- Métricas finas del MVP.
- Riesgos secundarios.
- Prompts iniciales detallados.
- Estructura exacta del repo hijo.

Reglas generales:
- Extrae solo lo que está en la conversación o lo que el usuario responda en la ronda de preguntas.
- Donde la conversación no aporte información NO crítica, usa [PENDIENTE].
- Sé conciso. Cada sección debe ser accionable, no narrativa.
- No incluyas justificaciones dentro del archivo. Solo datos y decisiones.
- El formato de salida es Markdown puro, listo para guardar como .md.

Secciones obligatorias:

## NOMBRE_PROYECTO
Una línea. Snake_case o slug.

## DESCRIPCION
Qué hace, para quién, qué problema resuelve. Máximo 5 líneas.

## PROBLEMA_REAL
El dolor concreto que resuelve. Sin marketing. 1-3 frases.

## USUARIO_OBJETIVO
Quién lo usará. Perfil concreto.

## OBJETIVO_ECONOMICO_ESTRATEGICO
Qué retorno o resultado estratégico se espera. Puede ser ingresos, automatización,
aprendizaje, validación de mercado, etc.

## RESULTADO_30_DIAS
Cómo se ve el éxito en 30 días. Métrica concreta o hito verificable.

## CONTEXTO_IMPORTANTE
Datos de contexto que un agente necesita saber. Restricciones reales, dependencias,
integraciones, plataformas, accesos.

## DECISIONES_TOMADAS
Lista de decisiones ya cerradas en la conversación. Formato:
- [Decisión]: [Razonamiento breve]

## HIPOTESIS
Suposiciones no verificadas que el proyecto asume. Formato:
- [Hipótesis]: [Cómo se validaría]

## DUDAS_ABIERTAS
Preguntas sin responder que bloquean o afectan diseño. Candidatas a sesión Opus.

## MVP_RECOMENDADO
Definición mínima del MVP. Qué debe hacer y qué no debe hacer.

## FUNCIONALIDADES
### NOW (esta semana / primera iteración)
### NEXT (próximo mes)
### LATER (futuro no comprometido)
### BLOCKED (no avanzar hasta que...)

## QUE_NO_CONSTRUIR_TODAVIA
Lista explícita de features, integraciones o complejidades a evitar en v0.

## RIESGOS
Lista de riesgos reales con impacto estimado (alto/medio/bajo).

## STACK_RECOMENDADO
Lenguajes, frameworks, plataforma de deploy, base de datos si aplica.

## TIPO_DE_PROYECTO
Elegir: [e-commerce / bot / saas / tool / content / data-pipeline / automation / other]

## ESTRUCTURA_INICIAL_REPO
Proponer árbol de carpetas del proyecto hijo (no de lafabrica).

## AGENTES_RECOMENDADOS
Qué usará cada rol en este proyecto concreto:
- Orquestador:
- Estratégico (Opus):
- Synthesis (Sonnet):
- Implementation (Claude Code / Codex / Antigravity):

## SUPERFICIE_PREFERIDA
Una sola opción, derivada de la respuesta del usuario:
- claude-code  → patches, docs, código sin UI, terminal-first
- codex        → patches técnicos cortos, scripts
- antigravity  → UI, navegador, cuenta Google, validación visual, workflows web

## PERFIL_RECOMENDADO
Una sola opción:
- generic         → proyectos sin restricciones particulares
- internal-suite  → herramientas internas / módulos operativos con datos sensibles

## DATOS_SENSIBLES
Listar (o "ninguno"):
- Datos de clientes (sí/no)
- Credenciales de servicios (cuáles)
- API keys (cuáles)
- Archivos que no pueden subirse a repo público

## INTEGRACIONES_EXTERNAS
Tabla con servicio, para qué, acceso disponible (sí / pendiente).

## CUENTA_GOOGLE_ASOCIADA
Email exacto si aplica + productos relevantes (Gmail / Drive / Sheets / Calendar). "no aplica" si no.

## GUARDRAILS_DOMINIO
Lista corta de cosas que NUNCA debe tocar un agente en este proyecto.

## TOKEN_ECONOMICS_INICIAL
Qué clasificación tienen las tareas habituales de este proyecto:
- Ejemplos de AGENT_REQUIRED en este dominio:
- Ejemplos de CHAT_CLOSE en este dominio:
- Ejemplos de DEFER_STOP en este dominio:
- Budget lock recomendado:

## BACKLOG_INICIAL
### NOW
### NEXT
### LATER

## PRIMER_PROMPT_ORQUESTADOR
Prompt listo para pegar en ChatGPT en la primera sesión del proyecto.
Debe incluir: objetivo de la sesión, archivos a leer, agente a usar, modo, criterio de parada.

## PRIMER_PROMPT_OPUS
Prompt para la sesión de validación del SEED (Sesión 1 del proyecto).
Debe pedir veredicto: APPROVE_FOR_IMPLEMENTATION | FIX_BLOCKER_FIRST

## PRIMER_PROMPT_SONNET
Prompt para primera sesión de documentación/síntesis si aplica.

## PRIMER_PROMPT_CODEX
Prompt para primera sesión de implementación (si ya está aprobado por Opus).
Si no aplica todavía: [NO_APLICA_AUN]

## CRITERIOS_DE_EXITO
Lista de criterios verificables de que el proyecto funciona.

## CRITERIOS_DE_PARADA
Lista de condiciones bajo las que se abandona o pausa el proyecto.

## SIGUIENTE_PASO_RECOMENDADO
Una sola acción concreta. La siguiente cosa que el usuario / builder debe hacer.

## COMANDO_LAFABRICA_NEW
Una línea con el comando concreto sugerido para generar el repo. Ejemplo:
```
python C:\Projects\lafabrica-template\scripts\lafabrica_new.py \
  --seed C:\Projects\seeds\<NOMBRE>_SEED.md \
  --dest C:\Projects\<nombre-proyecto> \
  --profile <generic|internal-suite> \
  --agent-surface <claude-code|codex|antigravity> \
  --git-init
```

---
FIN DEL ARCHIVO LAFABRICA_PROJECT_SEED.md
```

---

## Después de recibir el SEED

1. Guarda el output como `LAFABRICA_PROJECT_SEED__[nombre].md` en una carpeta local (por ejemplo `C:\Projects\seeds\`).
2. Revisa los `[PENDIENTE]` y completa los que sean bloqueantes.
3. Ejecuta `scripts/lafabrica_new.py` con los flags que el propio SEED te sugiere en el campo `COMANDO_LAFABRICA_NEW`.
4. Abre el repo generado en la herramienta correspondiente: VS Code (con Claude Code o Codex) o Antigravity, según lo indicado en `SUPERFICIE_PREFERIDA`.
