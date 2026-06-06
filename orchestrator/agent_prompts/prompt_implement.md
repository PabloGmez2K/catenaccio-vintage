# Implementación — Catenaccio Vintage

Plantilla para una sesión de implementación. Se pega como mensaje inicial
del agente implementador. La plantilla usa los siete campos estándar del
orquestador.

---

**Proyecto:** Catenaccio Vintage
**Repo local (fuente de verdad):** C:\Projects\catenaccio-vintage
**Superficie:** claude-code
**Sesión:** [N]
**Fecha:** [TODAY]

## 1. Objetivo

[Tarea concreta y medible. Una frase. Sin condicionales.]

## 2. Contexto mínimo

[Solo lo necesario. Referencia archivos del repo en vez de pegar contenido.
Si el repo ya tiene un README o un documento de diseño, apunta a él.]

## 3. Archivos relevantes

- [PATH_1]
- [PATH_2]
- (Mínimo necesario. Nada más.)

## 4. Guardrails

- Heredados de AGENTS.md del proyecto.
- No introducir dependencias externas nuevas sin entrada en DECISIONS.md.
- No tocar archivos fuera del scope listado.
- Mantener convenciones del repo (lint, formato, estructura de carpetas).
- Mensaje commit estilo Conventional: `feat:`, `fix:`, `chore:`, `docs:`.
- [Guardrails específicos de la tarea, si aplican.]

## 5. Validación esperada

[Cómo sabremos que el trabajo está bien hecho. Comando concreto, test,
captura, output esperado. Si no se puede validar, el prompt aún no está
listo.]

## 6. Criterio de parada

[Cuándo debe parar el agente. Ej.: "tests pasan y diff cabe en una pantalla"
o "objetivo conseguido + sin regresiones detectables".]

## 7. Formato de entrega

- Lista de archivos modificados o creados.
- Diff resumen.
- Mensaje commit propuesto.
- Resultado de la validación (output del comando).
- Problemas encontrados que no se resolvieron.

---

**Lo que no debes hacer:**

- No abrir scope. Si aparece una tarea adicional, anótala como ítem para
  BACKLOG y termina la actual.
- No commit-ear si el repo tiene cambios previos sin guardar del operador.
- No publicar a GitHub sin que el operador lo pida explícitamente.
- No inventar archivos. Si necesitas contenido que no está en el repo,
  pídeselo al operador.

**Primera acción:** confirma el objetivo en una línea y empieza. No expliques
el plan completo: ejecuta y reporta al final.
