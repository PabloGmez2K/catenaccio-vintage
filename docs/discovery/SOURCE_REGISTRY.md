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
| SRC-01 | Carpeta legacy Catenaccio Vintage (raíz) | carpeta local | C:\Users\USUARIO\Catenaccio Vintage | INTERNA | sí | lectura externa / intake_folder | no | EN_LECTURA | media | alta | Fuente histórica principal. Estructura de 5 carpetas, ~510 MB (sin extraer zips). Leer en modo read-only. |
| SRC-02 | CONTEXTO_PROYECTO_CATENACCIO.md | documento (Markdown) | C:\Users\USUARIO\Catenaccio Vintage\. CORE\CONTEXTO_PROYECTO_CATENACCIO.md | INTERNA | sí | lectura externa / intake_folder | no | EN_LECTURA | alta | alta | Documento maestro del proyecto, 37KB. Contiene stack técnico completo, historial de cambios, backlog, configuraciones críticas. Última actualización: 15/03/2026. Fuente más valiosa del legacy. |
| SRC-03 | Stock e inventario de productos | carpeta + Excel | C:\Users\USUARIO\Catenaccio Vintage\Stock\ | INTERNA | sí | lectura externa / intake_folder | no | PENDIENTE | alta | alta | STOCK.xlsx (43KB, última modificación 19/04/2026) + 30 carpetas de producto Original + carpeta Réplica + carpeta DORSALES + fotos.zip (103MB) + Photos-3-001.zip (12MB). Inventario físico y fotográfico completo. |
| SRC-04 | Código custom y plugins | carpeta + archivos PHP/CSS | C:\Users\USUARIO\Catenaccio Vintage\. CORE\functions.php + Plugins\filtro-camisetas\ | INTERNA | sí | lectura externa / intake_folder | no | PENDIENTE | alta | media | functions.php tema hijo (62KB, fecha 14/03/2026). Plugin Filtro Camisetas Pro v3.0.0 (filtro-camisetas.php + assets + includes). No leer functions.php sin revisión de seguridad previa (podría contener configuración sensible). |
| SRC-05 | Assets visuales y branding | carpeta de imágenes | C:\Users\USUARIO\Catenaccio Vintage\Imágenes\ | INTERNA | sí | lectura externa / intake_folder | no | PENDIENTE | alta | media | ~30 variantes de logo (horizontal, circular, colores) en subcarpeta REBRANDING. Banners desktop/tablet/mobile. Iconos SVG métodos de pago. Imágenes de inspiración (Instagram vintage football). |
| SRC-06 | Backlogs del proyecto (Excel) | documento (Excel) | C:\Users\USUARIO\Catenaccio Vintage\. CORE\backlog_catenaccio_v3-v6.xlsx | INTERNA | sí | lectura externa / intake_folder | no | PENDIENTE | alta | media | 4 versiones del backlog (v3: 02/03/2026, v4: 14/03/2026, v5: 15/03/2026, v6: 19/04/2026). La versión v6 es la más reciente y puede contener decisiones de producto posteriores al CONTEXTO. Requiere herramienta Excel para leer. |

---

## Fuentes bloqueadas

Registra aquí las fuentes que se conocen pero no se pueden ingerir, con la razón. Esto evita re-intentar fuentes que ya se descartaron por política.

| ID | Fuente | Razón del bloqueo | Alternativa disponible |
|----|--------|-------------------|----------------------|
| SRC-BLK-01 | Credenciales OAuth Google — Nextend Social Login | Archivo de texto plano con client ID y client secret de OAuth Google: `Plugins/Nextend Social Login/usuario y clave secreta google.txt`. CONFIDENCIAL. No ingerir bajo ninguna circunstancia. | No — las credenciales deben gestionarse en el panel de Google Cloud Console directamente. Si el servicio ya no está activo, revocar las credenciales. |

---

## Notas sobre calidad y confianza

Las fuentes tienen confianza diferente según su origen:

- **Alta confianza:** fuentes primarias generadas directamente por la organización, validadas por la persona usuaria.
- **Media confianza:** fuentes de terceros o herramientas SaaS con posible lag o imprecisión.
- **Baja confianza:** fuentes secundarias, extractos de conversaciones informales, capturas sin fecha verificable.
- **Desconocida:** fuente no evaluada todavía.

La confianza de una fuente **no la convierte en verdad aprobada**. Toda información, independientemente de su confianza, requiere validación humana antes de clasificarse como `VALIDADA`.
