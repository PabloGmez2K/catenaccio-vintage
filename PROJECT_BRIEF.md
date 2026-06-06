# PROJECT_BRIEF — Catenaccio Vintage

Descripción del proyecto. Generado desde el SEED. No editar — los cambios van en DECISIONS.md.

**Tipo:** hibrido  
**Fecha de arranque:** 2026-06-06  
**SEED de origen:** catenaccio-vintage_SEED.md

---

## Descripción

Proyecto de Discovery Intake para recuperar, entender y modernizar Catenaccio Vintage dentro del workflow de lafabrica. El objetivo inicial no es implementar una nueva web, sino comprender el estado actual del proyecto, sus fuentes, decisiones, activos, bloqueos y oportunidades antes de decidir la arquitectura de implementación.

## Problema real

Catenaccio Vintage quedó bloqueado porque fue desarrollado con un workflow anterior y con contexto disperso. Antes de continuar, el proyecto necesita entrar en un sistema IA-first gobernado por repo, orquestador, fuentes registradas y decisiones trazables.

## Usuario objetivo

El builder del proyecto, que necesita recuperar el contexto completo de Catenaccio Vintage, decidir una arquitectura moderna y continuar el desarrollo con agentes IA de forma ordenada.

## Objetivo económico / estratégico

Validar si Catenaccio Vintage debe relanzarse como proyecto web/negocio moderno y definir una ruta de implementación que reduzca fricción, evite repetir el bloqueo anterior y permita trabajar con previews, agentes y control de versiones.

## Resultado esperado en 30 días

Tener el AS-IS de Catenaccio Vintage validado, las fuentes principales registradas, una opción TARGET aprobada y un PROJECT_SEED implementable para iniciar la reconstrucción o migración técnica.

## Contexto importante

Este proyecto nace desde Discovery Intake. Existe una carpeta local histórica en:
C:\Users\USUARIO\Catenaccio Vintage

Esa carpeta es fuente externa/legacy y no debe copiarse directamente al repo como conocimiento aprobado. Primero debe registrarse, analizarse en modo read-only, sanearse y validarse. Las fuentes brutas deben vivir en una Controlled Intake Folder ignorada por Git o leerse desde su ubicación externa.

---

## MVP — qué hace y qué no hace

**Hace:**
- Crear repo local gobernado por lafabrica.
- Activar Discovery Intake Pack.

**No hace (explícito):**
- No implementa la nueva web.
- No despliega en Vercel.

---

## Qué no construir todavía

- Nueva web en Next.js.
- Deploy en Vercel.
- Migración automática de WordPress.
- Importación masiva de archivos.
- RAG o conectores SaaS.
- Automatizaciones avanzadas.
- Cambios en dominio, hosting o producción.

---

## Stack

- Lenguaje: Pendiente de discovery
- Framework: Pendiente de discovery
- Deploy: Preferencia inicial Vercel, pendiente de validar
- Base de datos: Pendiente de discovery

---

## Riesgos iniciales

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Copiar archivos brutos al repo | _(completar)_ | _(completar)_ |
| Decidir stack antes de entender el proyecto | _(completar)_ | _(completar)_ |

---

*Este documento es un snapshot. Los cambios de rumbo van en DECISIONS.md, no aquí.*
