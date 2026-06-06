# Handoff — Catenaccio Vintage

Plantilla para entregar una tarea de un agente a otro dentro de la misma
sesión. Se pega como mensaje inicial del agente receptor.

---

## Contexto del handoff

- **Proyecto:** Catenaccio Vintage
- **Repo local (fuente de verdad):** C:\Projects\catenaccio-vintage
- **Agente emisor:** [AGENTE_EMISOR]
- **Agente receptor:** [AGENTE_RECEPTOR]
- **Sesión actual:** [N]
- **Fecha:** [TODAY]

## Por qué hay handoff

[Razón concreta: necesita validación visual / cambio de modelo / dominio
específico que el receptor maneja mejor. 1-3 líneas.]

## Qué se hizo hasta ahora

[Resumen corto, en pasado: qué pasos completó el emisor. Apunta a archivos
del repo en vez de pegar contenido cuando sea posible.]

## Qué debe hacer el receptor

[Tarea específica, con criterio de parada explícito. Si la respuesta es
"depende", el handoff aún no está listo.]

## Archivos relevantes

- [PATH_1]
- [PATH_2]
- (Solo los necesarios; nada más.)

## Guardrails activos

- Heredados de AGENTS.md del proyecto.
- Adicionales para esta tarea:
  - [Guardrail específico 1]
  - [Guardrail específico 2]

## Validación esperada

[Cómo sabremos que la tarea está completa: comando, captura, log, etc.]

## Formato de entrega

[Diff, captura, archivo nuevo, mensaje en chat, etc. Especifica uno.]

## Lo que NO debe hacer el receptor

- No modifica archivos fuera del scope listado.
- No introduce dependencias nuevas sin pasar por DECISIONS.md.
- No cierra la sesión sin pasar el output al orquestador.

---

**Primera acción del receptor:** confirma con una sola línea que entendiste
y arranca. No resumas reglas. No re-leas el repo entero. Trabaja sobre los
archivos relevantes listados.
