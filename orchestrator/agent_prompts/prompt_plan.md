# Plan — Catenaccio Vintage

Plantilla para pedir un plan al agente implementador antes de tocar código.
El plan se revisa en el chat antes de ejecutarse.

---

**Proyecto:** Catenaccio Vintage
**Repo local:** C:\Projects\catenaccio-vintage
**Superficie principal:** claude-code
**Sesión:** [N]
**Fecha:** [TODAY]

## 1. Objetivo

[Una sola frase, accionable y medible.]

## 2. Contexto mínimo

[Lo que el agente debe saber para producir un plan sensato. Si está en el
repo, referenciar por path. Nada de pegar archivos enteros.]

## 3. Archivos relevantes

- [PATH_1]
- [PATH_2]
- (Solo los necesarios.)

## 4. Guardrails

- Heredados de AGENTS.md.
- No introducir dependencias nuevas.
- No tocar archivos fuera del scope.
- [Guardrails adicionales del proyecto, si aplican.]

## 5. Validación esperada del plan

El plan está bien si:

- Lista pasos numerados, no narrativos.
- Cada paso indica archivo afectado y tipo de cambio.
- Identifica riesgos y los enuncia explícitamente.
- Propone un criterio de parada verificable.

## 6. Criterio de parada del plan

[Cuándo debe terminar el agente de planificar y devolver el plan. Ej.: "5
minutos" o "cuando los pasos cubran todo el objetivo".]

## 7. Formato de entrega

Markdown con:

- Sección `## Plan` con pasos numerados.
- Sección `## Riesgos` con bullets.
- Sección `## Criterio de parada` con una frase.

No incluye código. El código viene después, con `prompt_implement.md`.

---

**Primera acción del agente:** confirma que entendiste el objetivo en una
línea y arranca el plan. No empieces a implementar.
