# Prompt: Opus — Sesión 1 — Validación del SEED

**Uso:** Reemplazar los `[PLACEHOLDERS]` con los valores del SEED antes de pegar en Opus.  
**Cuándo usar:** Primera sesión del proyecto, después de generar el repo desde el SEED.  
**Agente:** Claude Opus (modelo estratégico)  
**Modo:** NORMAL  
**Clasificación:** STRATEGIC_REQUIRED

---

```
Soy el usuario / builder del proyecto. Estoy arrancando Catenaccio Vintage usando el sistema lafabrica.

Objetivo de esta sesión:
Validar el LAFABRICA_PROJECT_SEED y emitir un veredicto antes de abrir sesiones de implementación.

Tu rol: Estratégico. No implementás código. No generás docs. Solo evaluás y emitís veredicto.

Archivos a leer (en este orden exacto):
1. LAFABRICA_PROJECT_SEED__Catenaccio Vintage.md — el SEED completo
2. PROJECT_BRIEF.md — descripción del proyecto
3. DECISIONS.md — decisiones ya tomadas
4. CONTEXTO.md — estado inicial

Evaluación requerida:

1. COHERENCIA INTERNA
   ¿El SEED es coherente? ¿Las decisiones son consistentes entre sí?
   ¿Hay contradicciones entre MVP_RECOMENDADO y FUNCIONALIDADES?

2. DUDAS_ABIERTAS CRÍTICAS
   De las DUDAS_ABIERTAS del SEED, ¿cuáles bloquean la implementación?
   ¿Cuáles son solo ruido y pueden dejarse para después?

3. HIPOTESIS RIESGOSAS
   ¿Qué hipótesis, si falla, destruye el proyecto?
   ¿Hay forma de validarlas antes de escribir código?

4. STACK Y ARQUITECTURA
   ¿El stack recomendado es adecuado para el proyecto?
   ¿Hay decisiones arquitectónicas que conviene tomar ahora?

5. QUE_NO_CONSTRUIR_TODAVIA
   ¿El SEED evita scope creep? ¿Hay algo que falta en la lista de exclusiones?

6. TOKEN ECONOMICS
   ¿El TOKEN_ECONOMICS_INICIAL es correcto para este dominio?
   ¿Hay clasificaciones incorrectas o faltantes?

Veredicto requerido (uno de los dos, sin "depende"):

APPROVE_FOR_IMPLEMENTATION
→ El proyecto puede arrancar. Las dudas abiertas no bloquean.
→ Documentar OPEN_QUESTIONS resueltas en DECISIONS.md.

FIX_BLOCKER_FIRST
→ Hay al menos un bloqueante que resolver antes de implementar.
→ Listar bloqueantes con prioridad y acción concreta.

Formato de entrega:
1. Veredicto en la primera línea
2. Resumen de evaluación (máximo 10 puntos)
3. OPEN_QUESTIONS resueltas (formato: decisión + razonamiento)
4. Si FIX_BLOCKER_FIRST: lista de bloqueantes con acción concreta
5. Siguiente paso recomendado (una sola acción)

Guardrails:
- No implementar nada
- No generar código
- No crear archivos nuevos
- No sugerir features fuera del SEED
- Si la duda es CHAT_CLOSE → resolverla en el output, no abrir otra sesión

Criterio de parada:
Veredicto emitido + OPEN_QUESTIONS documentadas.
No continuar hasta tener el veredicto.
```

---

## Qué hacer con el output de Opus

**Si `APPROVE_FOR_IMPLEMENTATION`:**
1. Copiar OPEN_QUESTIONS al formato de DECISIONS.md
2. Hacer commit: `strategic: opus s1 approve [project_name]`
3. Proceder con la primera sesión de implementación (Codex o Sonnet según BACKLOG.NOW)

**Si `FIX_BLOCKER_FIRST`:**
1. Anotar bloqueantes en BACKLOG.md como NOW con criterio de parada
2. Resolver bloqueantes (puede ser CHAT_CLOSE o nueva sesión Opus según complejidad)
3. Volver a esta sesión una vez resueltos
