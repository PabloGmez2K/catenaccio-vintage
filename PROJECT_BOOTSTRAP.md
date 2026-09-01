# PROJECT_BOOTSTRAP.md — Catenaccio Vintage

```yaml
bootstrap_version: canonical-project-bootstrap-v1
project_name: "Catenaccio Vintage"
repository_url: "https://github.com/PabloGmez2K/catenaccio-vintage"

methodology_source:
  repository_url: "https://github.com/PabloGmez2K/lafabrica"
  branch: "main"
  bootstrap_path: "PROJECT_BOOTSTRAP.md"

entrypoints:
  orchestrator: ORCHESTRATOR.md
  builder: AGENTS.md
  decisions: DECISIONS.md
  adoption: docs/meta/LAFABRICA_ADOPTION.md

DEFAULT_ROUTING:
  CONTROL_PLANE: CHILD_PROJECT
  KNOWLEDGE_DESTINATION: CHILD_ONLY

handshake:
  remote_view_required_for_continuous_orchestration: true
  local_view_required_before_local_execution: true
```

Este archivo es un manifiesto de descubrimiento. No contiene metodología,
cierre, routing de modelos, instrucciones de implementación, decisiones de
dominio ni roadmap.

Orden de carga: PROJECT_BOOTSTRAP.md → ORCHESTRATOR.md → AGENTS.md →
documentos locales referenciados por la tarea.

CONTROL_PLANE y KNOWLEDGE_DESTINATION enrutan la sesión; nunca conceden
autonomía ni permisos de escritura. Para trabajo operativo se requiere el
contrato de sesión definido en ORCHESTRATOR.md. Las consultas generales y
CHAT_CLOSE pueden resolverse sin contrato completo si no cambian estado ni
autorizan ejecución.

Handshake mínimo:

REMOTE_VIEW:
  status: VERIFIED | PARTIAL | UNAVAILABLE
  remote_head: <hash verificado o UNKNOWN>

LOCAL_VIEW:
  local_head: <hash>
  worktree: CLEAN | DIRTY
  upstream_tracking_head: <hash o UNKNOWN>
  relation_to_remote_view: SAME | LOCAL_AHEAD | LOCAL_BEHIND | DIVERGED | UNKNOWN

La referencia upstream es evidencia local y no prueba el remoto actual. Sin
remote_head verificado, la relación es UNKNOWN.

local_head se congela como BASELINE_HEAD: la baseline aprobada de la
sesión. Nunca es el HEAD actual que avanza con commits propios.

methodology_source distingue:

repository_url: repositorio hijo;
methodology_source.repository_url: repositorio metodológico Lafábrica;
methodology_source.branch: rama remota de Lafábrica a verificar;
bootstrap_path: bootstrap resuelto dentro de Lafábrica;
ningún path relativo de Lafábrica se interpreta como path del hijo;
el estado durable de adopción vive en
docs/meta/LAFABRICA_ADOPTION.md, no en este bootstrap.

methodology_source solo descubre. No concede permisos, no ejecuta fetch/pull
y no modifica el hijo.
