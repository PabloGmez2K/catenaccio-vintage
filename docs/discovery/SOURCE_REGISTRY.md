# SOURCE_REGISTRY — Catenaccio Vintage

Registro centralizado de fuentes disponibles para el Discovery Intake. Cada fuente declarada aquí debe tener un permiso explícito antes de ser ingerida.

**Proyecto:** Catenaccio Vintage  
**Última actualización:** 2026-06-06

---

## Estados de ingestión

| Estado | Significado |
|--------|-------------|
| `PENDIENTE` | Declarada, no procesada todavía |
| `EN_LECTURA` | El agente está extrayendo información |
| `PROCESADA` | Información extraída y disponible en `docs/discovery/` |
| `BLOQUEADA` | No se puede ingerir por restricción de privacidad o acceso |
| `DESCARTADA` | No aporta información relevante o duplica otra fuente |
| `VALIDADA` | La información extraída fue confirmada por la persona usuaria |

## Niveles de sensibilidad

| Nivel | Descripción |
|-------|-------------|
| `PÚBLICA` | Información pública, sin restricciones |
| `INTERNA` | Solo para el equipo del proyecto, no publicar |
| `PRIVADA` | No entra al repo; solo en Controlled Intake Folder |
| `CONFIDENCIAL` | Datos personales, credenciales o financieros; nunca en ningún repo |

---

## Registro de fuentes

| ID | Fuente | Tipo | Ubicación / acceso | Sensibilidad | Permiso explícito | Almacenamiento permitido | Entra en Git | Estado | Confianza | Prioridad | Notas |
|----|--------|------|-------------------|--------------|-------------------|--------------------------|--------------|--------|-----------|-----------|-------|
| SRC-01 | Carpeta legacy Catenaccio Vintage | carpeta local | C:\Users\USUARIO\Catenaccio Vintage | INTERNA | sí | lectura externa / intake_folder | no | PENDIENTE | media | alta | Fuente histórica principal del proyecto. Leer en modo read-only. No copiar archivos brutos al repo. |

---

## Fuentes bloqueadas

Registra aquí las fuentes que se conocen pero no se pueden ingerir, con la razón. Esto evita re-intentar fuentes que ya se descartaron por política.

| ID | Fuente | Razón del bloqueo | Alternativa disponible |
|----|--------|-------------------|----------------------|
| SRC-BLK-01 | [descripción] | [razón] | [sí: describirla / no] |

---

## Notas sobre calidad y confianza

Las fuentes tienen confianza diferente según su origen:

- **Alta confianza:** fuentes primarias generadas directamente por la organización, validadas por la persona usuaria.
- **Media confianza:** fuentes de terceros o herramientas SaaS con posible lag o imprecisión.
- **Baja confianza:** fuentes secundarias, extractos de conversaciones informales, capturas sin fecha verificable.
- **Desconocida:** fuente no evaluada todavía.

La confianza de una fuente **no la convierte en verdad aprobada**. Toda información, independientemente de su confianza, requiere validación humana antes de clasificarse como `VALIDADA`.
