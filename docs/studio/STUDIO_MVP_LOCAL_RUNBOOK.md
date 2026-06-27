# STUDIO_MVP_LOCAL_RUNBOOK.md

Guía paso a paso para lanzar y probar Catenaccio Studio en local.

Actualizado: S021 — 2026-06-27

---

## Prerequisitos

- Node.js ≥ 18 instalado (`node --version`)
- Proyecto Supabase `catenaccio-studio` existente con schema aplicado
- Credenciales Supabase: URL y anon key (disponibles en Supabase > Project Settings > API)

---

## 1. Entrar en la carpeta Studio

```bash
cd C:\Projects\catenaccio-vintage\studio
```

---

## 2. Instalar dependencias (solo primera vez)

```bash
npm install
```

---

## 3. Crear .env.local

Copiar la plantilla:

```bash
copy .env.example .env.local
```

Abrir `studio/.env.local` en un editor y rellenar los valores:

```
NEXT_PUBLIC_SUPABASE_URL=https://<tu-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Los valores están en Supabase > Project Settings > API:
- **URL**: campo "Project URL"
- **Anon key**: campo "Project API keys > anon / public"

**Nunca** usar la `service_role` key en este archivo. Solo `anon`.

El archivo `.env.local` está en `.gitignore` y nunca se versionará.

---

## 4. Lanzar en local

```bash
npm run dev
```

La app arranca en `http://localhost:3000`.

---

## 5. Probar login

1. Abrir `http://localhost:3000` en el navegador.
2. La app redirige automáticamente a `/login`.
3. Introducir el email con el que creaste la cuenta en Supabase Auth.
4. Hacer clic en "Enviar enlace".
5. Revisar el email y hacer clic en el enlace mágico.
6. El enlace redirige a `http://localhost:3000/auth/callback?code=...` y luego a `/inventory`.

### Supabase Auth — primer login

Si es la primera vez, Supabase creará el usuario automáticamente al usar magic link. El UUID del usuario quedará en `auth.users`. Apunta ese UUID — lo necesitarás para el seed del workspace.

---

## 6. Ver el inventario

Al autenticarte, la app muestra `/inventory`:

- **Con datos**: tabla con columnas Referencia, Estado, Coste, Precio web, Margen, WC, Fotos, Alta.
- **Sin datos** (MVP inicial): mensaje "No hay camisetas todavía."
- **Error de conexión**: mensaje con detalle del error (no expone secrets).

### Por qué el inventario puede estar vacío

Las políticas RLS filtran por `owner_id = auth.uid()`. Si no hay filas con tu UID en `inventory_items`, la tabla aparece vacía — eso es el comportamiento correcto.

Para insertar un item de prueba manualmente (en Supabase SQL Editor):

```sql
-- Primero crea el workspace si no existe
-- Reemplaza 'TU_AUTH_UID' con el UUID real de tu usuario Supabase
INSERT INTO workspaces (name, slug, owner_id)
VALUES ('Catenaccio Vintage', 'catenaccio-vintage', 'TU_AUTH_UID');

-- Luego inserta un item de prueba
INSERT INTO inventory_items (
  workspace_id,
  owner_id,
  referencia,
  fecha_compra,
  coste,
  status
)
SELECT
  w.id,
  'TU_AUTH_UID'::UUID,
  'Real Madrid Home 2001-02 (L)',
  '2026-06-27',
  25.00,
  'comprada'
FROM workspaces w WHERE w.slug = 'catenaccio-vintage';
```

---

## 7. Ver el detalle de un ítem

Hacer clic en la referencia de cualquier ítem en la tabla de inventario.

La vista `/inventory/[id]` muestra:
- Estado (pipeline, WC, fotos)
- Precios (coste, precio web, margen calculado)
- Detalles de camiseta si existen (football_shirt_details)
- Aviso "Vista de solo lectura — S022 añadirá edición y publicación."

---

## 8. Cerrar sesión

Hacer clic en "Salir" en el header de la app.

---

## Errores esperables

| Error | Causa | Solución |
|-------|-------|---------|
| "Configuración incompleta" en login | Faltan `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Crear/rellenar `studio/.env.local` y reiniciar `npm run dev` |
| "Error al cargar datos" en inventario | URL o anon key incorrectas, o fallo de red | Verificar valores en `.env.local` vs Supabase Project Settings |
| Inventario vacío tras login | No hay items con tu `owner_id` en la BD | Normal en MVP — insertar datos manualmente o esperar S022 |
| Error 404 en `/inventory/[id]` | UUID no existe o RLS bloquea acceso | Verificar que el ítem pertenece al usuario autenticado |
| Enlace mágico no llega | Email incorrecto o spam | Revisar carpeta de spam; verificar email en Supabase Auth > Users |
| `auth_callback_failed` en URL | El código del magic link expiró o se usó ya | Solicitar un nuevo enlace desde `/login` |

### Troubleshooting: `permission denied for table inventory_items`

Causa probable: el schema tiene RLS y policies creadas, pero faltan los `GRANT` SQL base para el rol `authenticated`.

Solucion:

1. Confirmar que el SQL canonico actualizado incluye el bloque `GRANTS - acceso SQL para rol autenticado`.
2. Si el proyecto Supabase fue creado antes de S021B, ejecutar manualmente ese bloque `GRANT` desde Supabase SQL Editor.
3. No desactivar RLS.
4. No conceder permisos a `anon` en el MVP.

Nota de seguridad: `GRANT` permite que Postgres evalue RLS; RLS sigue filtrando filas por `auth.uid() = owner_id`.

---

## Comandos útiles

```bash
# Desde studio/
npm run dev       # Modo desarrollo (hot reload)
npm run build     # Build de producción (verificar que compila)
npm run typecheck # Solo TypeScript sin build
npm run lint      # Lint sin build
```

---

## Próximo paso — S022

S022 añadirá:
- Formulario de alta de camiseta
- Integración Claude para sugerencias de descripción y precio
- Botón "Crear borrador en WooCommerce"
