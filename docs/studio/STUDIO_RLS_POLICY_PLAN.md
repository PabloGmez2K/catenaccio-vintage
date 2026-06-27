# STUDIO_RLS_POLICY_PLAN — Catenaccio Studio

Plan de Row Level Security para el proyecto Supabase de Catenaccio Studio.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-27  
**Sesión:** 019 — STUDIO_DATA_MODEL  
**Estado:** PLAN — aplicar al crear el proyecto Supabase real (S021)  
**SQL:** `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`

---

## 1. Threat model (MVP)

Catenaccio Studio es una **app interna de un único usuario (Pablo)**. No es una tienda pública. No hay acceso de terceros.

| Actor | Acceso legítimo | Riesgo a mitigar |
|-------|----------------|-----------------|
| Pablo (autenticado) | Todo su workspace | Ninguno en MVP |
| Visitante anónimo | Ninguno | Acceso no autorizado al inventario y precios de coste |
| Otro usuario autenticado | Ninguno (no hay otros usuarios en MVP) | Acceso cruzado a datos de Pablo si se añaden usuarios en el futuro |
| Servicio backend (Next.js) | Todo (service_role) | Exposición accidental de `service_role` key en cliente frontend |
| Agente / script de S020 | Todo (service_role en servidor) | Mismo riesgo que el punto anterior |

**Principio de mínimo privilegio:**
- El cliente frontend de Next.js usa la `anon key` — solo ve lo que RLS permite a `auth.uid()`.
- El backend de Next.js (Server Actions / API routes) puede usar `service_role` para operaciones de sync WC — nunca exponer esta key al cliente.
- La `service_role` key bypassea RLS. Por eso NUNCA debe estar en el bundle del cliente (`NEXT_PUBLIC_*`).

---

## 2. Políticas MVP (single owner — Pablo)

Todas las tablas usan la misma política: `auth.uid() = owner_id`.

```sql
-- Cada tabla tiene RLS habilitado:
ALTER TABLE workspaces              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_shirt_details  ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_lifecycle_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets            ENABLE ROW LEVEL SECURITY;

-- Política FOR ALL (SELECT + INSERT + UPDATE + DELETE):
CREATE POLICY pol_workspaces_owner
    ON workspaces FOR ALL
    USING (auth.uid() = owner_id);

-- ... (igual para todas las tablas — ver SQL completo)
```

**Por qué `FOR ALL` y no por operación:**  
En MVP, Pablo hace todo. No hay usuarios de solo lectura, no hay roles. Una política `FOR ALL` es más simple y correcta para un sistema de un solo actor.

**Cuándo dividir por operación:**  
Si en una fase futura se añaden collaborators (otro vendedor que puede ver pero no editar), dividir en `USING` (SELECT) y `WITH CHECK` (INSERT/UPDATE/DELETE) separados por rol.

---

## 3. Qué no exponer al cliente (anon key)

La `anon key` de Supabase solo puede ver lo que RLS permite. Dado que RLS requiere `auth.uid() = owner_id`, un usuario no autenticado ve exactamente **nada** en cualquier tabla.

| Dato | Visible al anon | Visible a Pablo autenticado |
|------|----------------|----------------------------|
| Inventario | ❌ 0 filas | ✅ Todo su workspace |
| Costes | ❌ | ✅ |
| Márgenes | ❌ | ✅ |
| Sugerencias IA | ❌ | ✅ |
| Eventos lifecycle | ❌ | ✅ |
| Fotos locales | ❌ (paths locales en DB) | ✅ |
| wc_payload_snapshot | ❌ | ✅ |

**Nota sobre precios:** los precios de coste son datos sensibles del negocio. RLS los protege ante cualquier acceso no autenticado. Si en el futuro se añade un storefront público con Supabase, los precios de coste **nunca** deben estar en tablas accesibles públicamente — usar una vista separada con solo `precio_publicado_web`.

---

## 4. service_role boundaries

El backend de Next.js (Server Actions, API Routes) puede usar `SUPABASE_SERVICE_ROLE_KEY` para:
- Operaciones de sync con WooCommerce (S020): crear producto draft, actualizar wc_status.
- Insertar `item_lifecycle_events` generados por el agente.
- Guardar `ai_suggestions` generadas por Claude (llamada desde el servidor).
- Subir fotos a Supabase Storage en el futuro.

**Reglas:**
1. `SUPABASE_SERVICE_ROLE_KEY` = variable de entorno **server-side** únicamente. Nunca `NEXT_PUBLIC_*`.
2. El cliente frontend de Next.js usa `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — estas son seguras de exponer.
3. Pablo autentica en el cliente con Supabase Auth (email/contraseña o Magic Link) → el cliente recibe un JWT de sesión que es el que identifica `auth.uid()` en RLS.

---

## 5. Variables de entorno futuras (sin valores)

Para el proyecto Supabase real (S021). Los valores los gestiona Pablo en Vercel Dashboard y `.env.local` local.

```
# Supabase — público (seguro para NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase — server-side únicamente (NUNCA NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=

# WooCommerce — server-side únicamente (DEC-9)
WP_SITE_URL=
WP_APP_USER=
WP_APP_PASSWORD=

# Claude API — server-side únicamente
ANTHROPIC_API_KEY=
```

**Regla:** si alguna vez ves `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` o `NEXT_PUBLIC_ANTHROPIC_API_KEY` en el código → es un bug de seguridad crítico. Parar y corregir antes de cualquier deploy.

---

## 6. Evolución futura de RLS (no implementar en MVP)

### Fase 3 — colaboradores de solo lectura

Si Pablo quiere que otro vendedor vea el catálogo sin poder editarlo:

```sql
-- Tabla de membresía (no en MVP)
CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id),
    user_id      UUID REFERENCES auth.users(id),
    role         TEXT NOT NULL DEFAULT 'viewer',  -- 'owner', 'editor', 'viewer'
    PRIMARY KEY (workspace_id, user_id)
);

-- Política SELECT ampliada para miembros
CREATE POLICY pol_inventory_viewer
    ON inventory_items FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
        )
    );
```

### Fase 4 — marketplace multi-owner (PEND-2)

Cada vendedor ve solo su propio workspace. La política `auth.uid() = owner_id` ya lo garantiza. Lo que cambia en Fase 4 es que `owner_id` puede ser el UUID de otro vendedor, no solo Pablo.

---

## 7. Qué validar en Supabase al crear el proyecto (S021)

1. Activar **Supabase Auth** con proveedor Email. Crear cuenta de Pablo.
2. Confirmar que las tablas tienen `ENABLE ROW LEVEL SECURITY`.
3. Probar como Pablo autenticado: `SELECT * FROM inventory_items` → debe devolver 0 filas (workspace aún vacío) sin error de permisos.
4. Probar como anónimo (sin JWT): `SELECT * FROM inventory_items` → debe devolver 0 filas (RLS bloquea).
5. Confirmar que `SUPABASE_SERVICE_ROLE_KEY` bypass funciona desde un script server-side (test de inserción de workspace seed).
6. Confirmar que `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` **no existe** en ningún archivo del proyecto.

---

## 8. Nota S021B - GRANTs SQL para authenticated

La review local S021 descubrio que tener RLS habilitado y policies owner-based no basta si el rol SQL no tiene privilegios base sobre las tablas. El sintoma observado en `/inventory` fue:

`permission denied for table inventory_items`

Solucion canonica:

- Mantener RLS activo.
- Mantener las policies owner-based con `auth.uid() = owner_id`.
- Conceder a `authenticated` los privilegios SQL base necesarios sobre schema, tablas y vista.
- No conceder permisos a `anon` en el MVP.

Interpretacion de seguridad: `GRANT` da acceso SQL base para que Postgres pueda evaluar RLS; no abre datos por si solo. El aislamiento de filas sigue definido por RLS y `owner_id`.

---

*Sesión 019 — 2026-06-27 — Claude Code (Sonnet). Modo LOCAL_SCHEMA_DESIGN_ONLY / NO_REMOTE_WRITE.*
