# DATA_AND_PRIVACY_BOUNDARIES — Discovery Intake

Reglas de privacidad y saneamiento para proyectos que usan el Discovery Intake Pack. Este documento define qué puede y qué no puede entrar al repositorio, y bajo qué condiciones.

**Válido para:** cualquier proyecto que active el Discovery Intake Pack.  
**Relación con:** `docs/orchestrator/company_brain_pack/DATA_SECURITY_AND_PRIVACY_POLICY.md` (reglas generales para proyectos Company Brain).

---

## Controlled Intake Folder

La **Controlled Intake Folder** es un directorio local **fuera del repositorio** o declarado en `.gitignore`, donde la persona usuaria deposita materiales brutos para el discovery.

**Convención de ruta por defecto:**
```
intake/          ← dentro del repo, en .gitignore
  raw/           ← archivos originales sin procesar
  exports/       ← exports de herramientas externas
  captures/      ← capturas de pantalla, PDFs, imágenes
  notes/         ← notas informales del operador
```

O bien, fuera del repo:
```
C:\Projects\<proyecto>-intake\   ← directorio hermano del repo, nunca comitteado
```

**Reglas de la Controlled Intake Folder:**

1. Todos los archivos en `intake/` o en el directorio externo son **fuentes, no conocimiento aprobado**.
2. El agente puede leerlos en modo read-only para extraer información.
3. Ningún archivo de la Controlled Intake Folder se copia al repo sin pasar por el proceso de saneamiento.
4. Si se usa `intake/` dentro del repo, debe estar en `.gitignore` desde el primer commit.

---

## Fuentes originales fuera de Git por defecto

La regla general es:

> **Las fuentes originales no entran al repo. Lo que entra al repo es el conocimiento estructurado extraído de esas fuentes.**

Ejemplos de lo que **no entra al repo**:
- El PDF original de una factura, aunque sea de ejemplo.
- El export CSV de una herramienta interna con datos reales.
- Una captura de pantalla con información de clientes o empleados.
- Un documento Word con texto no revisado.

Ejemplos de lo que **sí puede entrar al repo**, tras saneamiento:
- Un fragmento anonimizado que ilustra la estructura de un proceso.
- Un esquema de datos sin valores reales.
- Una descripción textual de lo que contenía una fuente, sin los datos en sí.

---

## Proceso de saneamiento

Antes de copiar cualquier información al repo, el agente (o la persona usuaria) debe:

1. **Identificar** qué información de la fuente es relevante para el discovery.
2. **Clasificar** si contiene PII, credenciales, datos financieros o información confidencial.
3. **Anonimizar o abstraer** los datos sensibles: reemplazar nombres, valores y referencias específicas por genéricos.
4. **Documentar** qué se tomó de la fuente y qué se omitió, en el `SOURCE_REGISTRY.md`.
5. **Registrar** el estado de la fuente como `PROCESADA` en el registro.

El saneamiento lo hace una persona humana o un agente bajo supervisión directa de la persona usuaria. **No se acepta saneamiento automático sin revisión humana.**

---

## Prohibiciones estrictas

Bajo ninguna circunstancia puede entrar al repositorio (ni siquiera en ramas privadas):

- **PII real:** nombres completos de clientes o empleados, direcciones, teléfonos, emails, DNI/NIE, números de cuenta.
- **Credenciales:** contraseñas, tokens de API, claves SSH, secrets de servicios.
- **Datos financieros confidenciales:** facturas reales con importes, estados financieros internos, precios de proveedores no públicos.
- **Información médica o legal:** cualquier dato protegido por regulaciones de privacidad.
- **Archivos de configuración con valores de producción:** `.env`, `config.production.json`, equivalentes.

Estas prohibiciones aplican **incluso si el repositorio es privado**. La seguridad no se delega en la visibilidad del repo.

---

## Reglas para datos específicos

### PII (Información de Identificación Personal)
- No ingerir PII real en ningún caso.
- Si una fuente contiene PII, extraer solo la estructura (campos disponibles, tipos de datos) sin los valores.
- Usar datos ficticios para ejemplos cuando sea necesario.

### Credenciales y secretos
- Nunca copiar credenciales al repo ni a la Controlled Intake Folder dentro del repo.
- Si el discovery requiere probar acceso a un sistema, usar un entorno de prueba o credenciales temporales que se revocan tras el discovery.
- Las credenciales viven en el gestor de contraseñas del operador, no en el sistema de archivos del proyecto.

### Facturas y datos financieros
- Las facturas reales nunca entran al repo.
- Se puede documentar la **estructura** de una factura (campos, formato) sin los valores.
- Los rangos de precios o categorías de gasto (sin valores exactos) pueden documentarse si son necesarios para el diseño.

### Datos de terceros (clientes, proveedores, socios)
- Solo se puede documentar información que sea pública o que haya sido expresamente autorizada.
- Información de clientes o proveedores que no sea pública requiere autorización explícita antes de ingresarse.

---

## Human-in-the-loop

Ninguna validación de datos puede ser 100% automática. El Discovery Intake requiere intervención humana en:

1. **Clasificar la sensibilidad** de cada fuente (ver `SOURCE_REGISTRY.md`).
2. **Aprobar el saneamiento** de información antes de que entre al repo.
3. **Validar el AS-IS** documentado antes de avanzar a TARGET.
4. **Aprobar el TARGET** antes de generar el SEED.

El agente puede proponer, extraer y estructurar. La persona usuaria aprueba y autoriza.

---

## Relación con DATA_SECURITY_AND_PRIVACY_POLICY.md

`docs/orchestrator/company_brain_pack/DATA_SECURITY_AND_PRIVACY_POLICY.md` define las reglas generales para proyectos de tipo Company Brain en operación continua.

Este documento (`DATA_AND_PRIVACY_BOUNDARIES.md`) extiende esas reglas para la fase de Discovery Intake, con énfasis en:
- La Controlled Intake Folder como punto de entrada controlado.
- El proceso de saneamiento previo a la ingestión al repo.
- La separación entre fuentes originales y conocimiento estructurado.

Cuando un proyecto usa ambos packs, este documento prevalece durante la fase de discovery. Tras el cierre del discovery, aplica el documento general del Company Brain Pack.
