# LAFABRICA_PROJECT_SEED — Catenaccio Vintage

## NOMBRE_PROYECTO
Catenaccio Vintage

## DESCRIPCION
Proyecto de Discovery Intake para recuperar, entender y modernizar Catenaccio Vintage dentro del workflow de lafabrica. El objetivo inicial no es implementar una nueva web, sino comprender el estado actual del proyecto, sus fuentes, decisiones, activos, bloqueos y oportunidades antes de decidir la arquitectura de implementación.

## PROBLEMA_REAL
Catenaccio Vintage quedó bloqueado porque fue desarrollado con un workflow anterior y con contexto disperso. Antes de continuar, el proyecto necesita entrar en un sistema IA-first gobernado por repo, orquestador, fuentes registradas y decisiones trazables.

## USUARIO_OBJETIVO
El builder del proyecto, que necesita recuperar el contexto completo de Catenaccio Vintage, decidir una arquitectura moderna y continuar el desarrollo con agentes IA de forma ordenada.

## OBJETIVO_ECONOMICO_ESTRATEGICO
Validar si Catenaccio Vintage debe relanzarse como proyecto web/negocio moderno y definir una ruta de implementación que reduzca fricción, evite repetir el bloqueo anterior y permita trabajar con previews, agentes y control de versiones.

## RESULTADO_30_DIAS
Tener el AS-IS de Catenaccio Vintage validado, las fuentes principales registradas, una opción TARGET aprobada y un PROJECT_SEED implementable para iniciar la reconstrucción o migración técnica.

## CONTEXTO_IMPORTANTE
Este proyecto nace desde Discovery Intake. Existe una carpeta local histórica en:
C:\Users\USUARIO\Catenaccio Vintage

Esa carpeta es fuente externa/legacy y no debe copiarse directamente al repo como conocimiento aprobado. Primero debe registrarse, analizarse en modo read-only, sanearse y validarse. Las fuentes brutas deben vivir en una Controlled Intake Folder ignorada por Git o leerse desde su ubicación externa.

## DECISIONES_TOMADAS
- Usar lafabrica como sistema operativo del proyecto.
- Empezar con Discovery Intake, no con implementación directa.
- Registrar la carpeta legacy como fuente externa.
- No tocar producción, dominio, WordPress, hosting ni Vercel hasta validar AS-IS y TARGET.
- Tratar Next.js/Vercel como preferencia inicial posible, no como decisión cerrada.
- Usar VS Code / Claude Code como superficie principal inicial.
- Usar Antigravity más adelante si hay validación visual o UI.

## HIPOTESIS
- Catenaccio Vintage puede beneficiarse de una migración hacia un stack más moderno y compatible con el workflow de lafabrica.
- Next.js/Vercel podría encajar, pero debe confirmarse tras revisar el AS-IS.
- Parte del material antiguo puede reutilizarse si se sanea y estructura correctamente.

## DUDAS_ABIERTAS
- Qué contiene exactamente la carpeta legacy.
- Qué parte del proyecto actual está en WordPress/Elementor.
- Qué URLs, contenidos, assets y decisiones deben conservarse.
- Qué funcionalidades son necesarias para una primera versión moderna.
- Si conviene migración completa, migración parcial o reconstrucción desde cero.

## MVP_RECOMENDADO
**Hace:**
- Crear repo local gobernado por lafabrica.
- Activar Discovery Intake Pack.
- Registrar fuentes disponibles.
- Crear Controlled Intake Folder ignorada por Git.
- Analizar fuentes en modo read-only.
- Documentar AS-IS, conflictos, TARGET_OPTIONS y plan recomendado.

**No hace:**
- No implementa la nueva web.
- No despliega en Vercel.
- No modifica WordPress ni dominio.
- No copia fuentes brutas al repo.
- No decide stack final sin AS-IS validado.

## FUNCIONALIDADES
### NOW
- Activar Discovery Intake Pack en el repo.
- Crear Source Registry inicial.
- Crear Controlled Intake Folder ignorada por Git.
- Registrar la carpeta legacy como fuente externa.
- Preparar primera sesión read-only de discovery.

### NEXT
- Sintetizar AS-IS.
- Revisar conflictos.
- Preparar TARGET_OPTIONS.
- Validar arquitectura recomendada.

### LATER
- Generar SEED implementable final.
- Implementar nueva base técnica.
- Validar visualmente.
- Preparar despliegue si procede.

### BLOCKED
- Implementación técnica bloqueada hasta validar AS-IS y TARGET.

## QUE_NO_CONSTRUIR_TODAVIA
- Nueva web en Next.js.
- Deploy en Vercel.
- Migración automática de WordPress.
- Importación masiva de archivos.
- RAG o conectores SaaS.
- Automatizaciones avanzadas.
- Cambios en dominio, hosting o producción.

## RIESGOS
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Copiar archivos brutos al repo | Alto | Usar Controlled Intake Folder ignorada por Git |
| Decidir stack antes de entender el proyecto | Alto | Validar AS-IS antes de TARGET |
| Repetir el bloqueo anterior | Alto | Microfases, validación y stop-loss |
| Perder SEO o activos útiles | Medio | Crear inventario antes de migrar |
| Sobredocumentar sin avanzar | Medio | Discovery con criterio de salida claro |

## STACK_RECOMENDADO
- Lenguaje: Pendiente de discovery
- Framework: Pendiente de discovery
- Deploy: Preferencia inicial Vercel, pendiente de validar
- Base de datos: Pendiente de discovery

## TIPO_DE_PROYECTO
hibrido

## ORIGEN_DEL_PROYECTO
discovery-intake

## ESTRUCTURA_INICIAL_REPO
docs/discovery/
intake/  # ignorado por Git
orchestrator/
docs/assets/  # solo assets saneados si procede

## AGENTES_RECOMENDADOS
- ChatGPT: orquestador operativo.
- Claude Code Sonnet/Opus: discovery, documentación y decisiones de arquitectura.
- Antigravity: validación visual cuando exista UI.
- Codex: opcional, solo para patches técnicos acotados.

## SUPERFICIE_PREFERIDA
claude-code

## PERFIL_RECOMENDADO
internal-suite

## DATOS_SENSIBLES
Puede haber fuentes privadas, documentos internos, capturas, datos comerciales, credenciales o exports. No copiar fuentes brutas al repo. Usar intake/ ignorado por Git o carpeta externa.

## GUARDRAILS_DOMINIO
- No tocar producción.
- No tocar dominio.
- No modificar WordPress/Elementor sin autorización explícita.
- No decidir arquitectura sin AS-IS validado.
- No copiar fuentes brutas al repo.
- No meter PII, credenciales ni datos privados.

## TOKEN_ECONOMICS_INICIAL
No abrir sesiones de implementación si todavía no existe AS-IS validado. Toda sesión debe producir avance verificable: fuente registrada, AS-IS mejorado, conflicto resuelto, TARGET comparado o SEED generado.

## BACKLOG_INICIAL
### NOW
- Activar Discovery Intake Pack.
- Registrar fuentes iniciales.
- Crear Controlled Intake Folder.
- Preparar prompt read-only de discovery.

### NEXT
- Sintetizar AS-IS.
- Validar AS-IS.
- Preparar TARGET_OPTIONS.

### LATER
- Generar SEED implementable final.
- Iniciar implementación técnica.

### BLOCKED
- Implementación web bloqueada hasta aprobar TARGET.

## CRITERIOS_DE_EXITO
- Fuentes principales registradas.
- AS-IS validado por la persona usuaria.
- TARGET_OPTIONS comparadas.
- Opción TARGET aprobada.
- SEED implementable generado.

## CRITERIOS_DE_PARADA
- Si no se puede identificar la fuente principal del proyecto antiguo.
- Si aparecen datos sensibles sin política clara de manejo.
- Si el discovery deriva en implementar sin validar AS-IS.
- Si el proyecto intenta decidir stack por preferencia antes de revisar evidencia.

## LEGACY_ASSETS
# No declarar todavía. Las fuentes legacy se registrarán en SOURCE_REGISTRY.md.
# Los assets solo se copiarán al repo cuando estén saneados y aprobados.

## PRIMER_PROMPT_ORQUESTADOR
Actúa como orquestador operativo de Catenaccio Vintage. Este proyecto entra por Discovery Intake. Tu primera prioridad no es implementar, sino ayudar a registrar fuentes, validar AS-IS, detectar conflictos y preparar TARGET_OPTIONS. No autorices implementación técnica hasta que AS-IS esté validado y una opción TARGET esté aprobada.
