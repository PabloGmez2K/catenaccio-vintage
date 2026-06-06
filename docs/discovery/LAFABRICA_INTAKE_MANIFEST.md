# LAFABRICA_INTAKE_MANIFEST — Catenaccio Vintage

Declaración inicial del Discovery Intake. Este documento define el alcance, las fuentes disponibles, los permisos y las preguntas que el discovery debe resolver.

**Proyecto:** Catenaccio Vintage  
**Fecha de apertura:** 2026-06-06  
**Estado:** ABIERTO

---

## PROPÓSITO DEL INTAKE

Comprender el estado actual de Catenaccio Vintage antes de decidir arquitectura o iniciar implementación. Existe una carpeta local con historial del proyecto previo cuyo contenido no está inventariado. El discovery debe responder qué hay en ese legacy, qué era el proyecto, qué activos y decisiones conviene conservar, qué bloqueó el avance anterior y qué arquitectura conviene para una versión moderna. La implementación web está bloqueada hasta validar AS-IS y aprobar una opción TARGET.

---

## CONTEXTO INICIAL CONOCIDO

- Catenaccio Vintage es un proyecto que fue desarrollado en un workflow anterior y quedó bloqueado.
- Existe una carpeta local histórica en `C:\Users\USUARIO\Catenaccio Vintage` con material del proyecto previo.
- El proyecto tenía (o tiene) presencia en WordPress/Elementor. El estado exacto de producción no está verificado.
- No se ha tocado el dominio, hosting ni WordPress en esta sesión.
- El proyecto entra ahora bajo el sistema lafabrica con Discovery Intake como punto de partida.
- **Hipótesis (no confirmada):** parte del material antiguo puede reutilizarse; Next.js/Vercel podría ser un stack adecuado para la versión moderna.

---

## FUENTES DISPONIBLES

| ID | Descripción breve | Tipo | Disponible hoy |
|----|-------------------|------|----------------|
| SRC-01 | Carpeta legacy Catenaccio Vintage | carpeta local | sí |

Ver detalle completo en `SOURCE_REGISTRY.md`.

---

## PERMISOS Y SENSIBILIDAD

Ver `DATA_AND_PRIVACY_BOUNDARIES.md` para las reglas generales.

- **Puede entrar al repo:** conocimiento estructurado, saneado y validado extraído de las fuentes (descripciones, esquemas, inventarios sin datos brutos).
- **Solo en Controlled Intake Folder (fuera de Git):** archivos brutos del legacy, capturas, exports, documentos originales.
- **Prohibido en todo contexto:** PII real, credenciales, datos financieros confidenciales, archivos de configuración con valores de producción.

La carpeta legacy (`C:\Users\USUARIO\Catenaccio Vintage`) es fuente externa. Se lee en modo read-only. No se copia al repo.

---

## RESTRICCIONES DEL INTAKE

- [x] No implementar código ni nueva aplicación durante el discovery.
- [x] No copiar archivos brutos de la carpeta legacy al repo.
- [x] No tocar producción, dominio, WordPress, hosting ni Vercel.
- [x] No decidir stack ni arquitectura sin AS-IS validado.
- [x] No instalar dependencias ni crear nueva app hasta aprobar TARGET.
- [x] No analizar en profundidad la carpeta legacy en esta sesión — reservado para primera sesión read-only de discovery.
- [x] No hacer push hasta que AS-IS y TARGET estén validados.

---

## PREFERENCIAS INICIALES

- Next.js + Vercel como stack candidato para la versión moderna (preferencia inicial, no decisión cerrada).
- VS Code / Claude Code como superficie principal de trabajo.
- Antigravity para validación visual cuando exista UI.
- Trabajo en microfases con validación humana en cada hito.
- El repo es la única fuente de verdad del proyecto — no hay contexto disperso en chats externos.

---

## PREGUNTAS QUE EL DISCOVERY DEBE RESOLVER

1. ¿Qué contiene exactamente la carpeta legacy? ¿Qué tipos de archivos, estructura y volumen?
2. ¿Qué era Catenaccio Vintage como proyecto? ¿Qué ofrecía, a quién y con qué propuesta de valor?
3. ¿Qué activos (imágenes, textos, datos, URLs, decisiones) merecen conservarse en la versión moderna?
4. ¿Qué bloqueó el avance anterior? ¿Fue técnico, conceptual, de tiempo o de recursos?
5. ¿Qué funcionalidades son necesarias para una primera versión moderna viable?
6. ¿Hay presencia activa en producción (WordPress)? ¿Qué estado tiene? ¿Hay tráfico o SEO relevante?
7. ¿Conviene migración completa desde WordPress, migración parcial o reconstrucción desde cero?
8. ¿Next.js/Vercel es la arquitectura correcta dado el AS-IS, o hay razones para elegir otra opción?
9. ¿Hay datos sensibles, credenciales o PII en la carpeta legacy que deban manejarse con cuidado?
10. ¿Qué URLs, rutas o slugs deben preservarse para no romper SEO o links existentes?

---

## CRITERIO DE VALIDACIÓN HUMANA

- [ ] **Validación AS-IS:** la persona usuaria confirma que `AS_IS_UNDERSTANDING.md` refleja la realidad del proyecto tras revisar la carpeta legacy.
- [ ] **Validación TARGET:** la persona usuaria aprueba una opción en `TARGET_OPTIONS.md` antes de generar el SEED.
- [ ] **Validación de fuentes:** la persona usuaria confirma la sensibilidad y los permisos de cada fuente registrada en `SOURCE_REGISTRY.md`.

---

## CRITERIO DE SALIDA

El intake se cierra cuando:

- [ ] Todas las preguntas del discovery tienen respuesta documentada (o incógnita explícitamente aceptada).
- [ ] `AS_IS_UNDERSTANDING.md` tiene estado `VALIDADO_POR_USUARIO`.
- [ ] `TARGET_OPTIONS.md` tiene una opción marcada como `APROBADA`.
- [ ] `VALIDATION_RECORD.md` tiene al menos una entrada de validación humana para AS-IS y una para TARGET.
- [ ] El SEED generado pasa la revisión del orquestador.

---

## HISTORIAL DE CAMBIOS

| Fecha | Cambio | Quién |
|-------|--------|-------|
| 2026-06-06 | Abierto el intake. Configuración inicial del Discovery Intake. | Claude Code (setup) |
