# Prompt: Target Options

**Fase:** Propuesta de opciones de diseño TARGET  
**Modo:** DISEÑO — el agente propone opciones, la persona usuaria elige  
**Prerequisito:** `AS_IS_UNDERSTANDING.md` en estado `VALIDADO_POR_USUARIO`

---

## Instrucciones de relleno

Reemplaza los bloques `[...]` con la información específica del proyecto antes de usar este prompt.

---

## PROMPT

```
ROL
Actúas como agente de diseño para el proyecto [NOMBRE_PROYECTO]. Tu tarea es proponer opciones de diseño TARGET comparables a partir del AS-IS validado.

MODO
DISEÑO. Propones opciones sin imponer una. La persona usuaria elige. No diseñas la implementación todavía — solo las opciones de alto nivel entre las que elegir.

CONTEXTO
Lee en este orden:
1. AS_IS_UNDERSTANDING.md — comprensión validada del estado actual
2. LAFABRICA_INTAKE_MANIFEST.md — preferencias iniciales y restricciones del proyecto
3. CONFLICT_REGISTER.md — incógnitas aceptadas que afectan el diseño

RESTRICCIONES DEL PROYECTO
[Copia aquí las restricciones relevantes del LAFABRICA_INTAKE_MANIFEST.md: presupuesto, tiempo, dependencias externas, preferencias tecnológicas, etc.]

CRITERIOS DE EVALUACIÓN
[Copia o adapta los criterios de evaluación del TARGET_OPTIONS.md: qué factores son más importantes para la persona usuaria.]

TAREA
A partir de los problemas detectados en el AS-IS, propón entre 2 y 4 opciones de diseño TARGET. Para cada opción:

1. Nombre descriptivo y breve (no genérico: "Opción A" no vale; "Migración progresiva con API" sí).
2. Qué problema/s resuelve y cómo.
3. Descripción estructural o técnica de alto nivel (suficiente para comparar, sin diseño detallado).
4. Trade-offs: ventajas e inconvenientes concretos.
5. Riesgos principales con probabilidad e impacto estimados.
6. Dependencias externas (herramientas, accesos, personas, infraestructura).
7. Costo/fricción relativa (bajo/medio/alto) comparada con las demás opciones.
8. Reversibilidad: qué tan fácil es deshacer esta opción si no funciona.
9. Tu recomendación y justificación.

Al final, una tabla comparativa de todas las opciones por los criterios de evaluación.

RESTRICCIONES DE DISEÑO
- No diseñar la implementación detallada. Eso viene en RECOMMENDED_IMPLEMENTATION_PLAN.md tras la aprobación.
- No asumir que los activos reutilizables del AS-IS funcionan perfectamente — considerar el costo de adaptarlos.
- No incluir RAG, conectores SaaS automáticos, migración automática de datos ni deploy entre las opciones, salvo que el LAFABRICA_INTAKE_MANIFEST.md lo autorice explícitamente.
- Si una opción requiere información que no está en el AS-IS, decirlo. No inventar.

FORMATO DE ENTREGA
Contenido listo para pegar en TARGET_OPTIONS.md. Usa la estructura exacta de la plantilla del pack.

Al final, añade una sección de notas para el operador:
- Qué información adicional mejoraría la comparación.
- Qué incógnitas del AS-IS afectan más la elección.
- Cuál es tu primera preferencia y por qué.

INSTRUCCIÓN PARA EL OPERADOR
Revisa las opciones. Si ninguna encaja, dime qué ajustes necesitas. Cuando hayas elegido, cambia el estado de TARGET_OPTIONS.md a OPCIÓN_APROBADA y registra en VALIDATION_RECORD.md.
```

---

## Notas de uso

- Si la persona usuaria rechaza todas las opciones, añadir sus comentarios al `LAFABRICA_INTAKE_MANIFEST.md` como preferencias adicionales y regenerar las opciones.
- Si se añaden restricciones nuevas durante la revisión, registrarlas en el MANIFEST antes de regenerar.
- La aprobación de una opción TARGET es el desbloqueante para `prompt_seed_generation.md`.
- Las opciones descartadas deben registrarse en la sección correspondiente de `TARGET_OPTIONS.md`.
