# STUDIO_MVP_SCAFFOLD_RESULT.md

Sesión: S021 — STUDIO_MVP_SCAFFOLD
Fecha: 2026-06-27
Agente: Claude Code (Sonnet)
Veredicto: APPROVE_READY_FOR_LOCAL_VISUAL_REVIEW

---

## Qué se creó

App Next.js aislada en `studio/` dentro del repo `catenaccio-vintage`.

### Estructura

```
studio/
├── .env.example              # plantilla de variables de entorno (sin valores)
├── eslint.config.mjs
├── middleware.ts             # protección de rutas /inventory/*
├── next.config.ts
├── package.json
├── tsconfig.json
├── app/
│   ├── layout.tsx            # layout raíz, importa globals.css
│   ├── page.tsx              # redirige a /inventory o /login según sesión
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts     # handler de código OAuth/magic-link de Supabase
│   ├── inventory/
│   │   ├── page.tsx         # lista de inventory_items (Server Component)
│   │   └── [id]/
│   │       └── page.tsx     # detalle de ítem (read-only, Server Component)
│   └── login/
│       └── page.tsx         # página de login con LoginForm
├── components/
│   ├── AppShell.tsx         # layout app: header sticky + nav + sign-out
│   ├── EmptyState.tsx       # estado vacío ("No hay camisetas todavía.")
│   ├── ErrorState.tsx       # estado de error sin exponer secrets
│   ├── InventoryTable.tsx   # tabla de inventario con columnas clave
│   ├── LoginForm.tsx        # magic link via Supabase OTP
│   └── StatusBadge.tsx      # badge coloreado para ItemStatus/WcSyncStatus/PhotoStatus
├── lib/
│   ├── types.ts             # InventoryItem, ItemStatus, PhotoStatus, WcSyncStatus
│   └── supabase/
│       ├── browser.ts       # createBrowserClient (cliente)
│       └── server.ts        # createServerClient (Server Components)
└── styles/
    └── globals.css          # CSS backoffice: tabla, badges, login, app shell
```

---

## Rutas disponibles

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/` | Server | Redirige a `/inventory` (sesión activa) o `/login` |
| `/login` | Client | Formulario magic link Supabase; aviso si falta .env.local |
| `/auth/callback` | Route Handler | Intercambia código OAuth por sesión |
| `/inventory` | Server | Lista de items protegida por middleware |
| `/inventory/[id]` | Server | Detalle read-only del ítem + football_shirt_details |

---

## Stack

- Next.js 15.5.19 (App Router, TypeScript strict)
- React 19
- @supabase/ssr 0.5.2 + @supabase/supabase-js 2.49.x
- Auth: Supabase magic link (OTP email)
- No Tailwind, no shadcn — CSS puro para simplicidad MVP

---

## Variables de entorno necesarias

Crear `studio/.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=<URL del proyecto catenaccio-studio>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key del proyecto catenaccio-studio>
```

**Nunca:** SUPABASE_SERVICE_ROLE_KEY en frontend.
Ver `.env.example` para la plantilla.

---

## Validaciones ejecutadas (S021)

| Validación | Resultado |
|-----------|----------|
| `npm install` | OK — 319 paquetes |
| `npm run typecheck` | PASS — 0 errores |
| `npm run build` | PASS — 7 rutas generadas |
| `npm run lint` | PASS — 0 errores ni warnings |
| `git diff --check` | OK |
| Secret scan | PASS — sin valores reales en archivos versionados |
| Scope check | PASS — solo `studio/` y docs permitidos |

### Nota sobre dependencias vulnerables

Next.js 15.5.19 incluye una dependencia transitiva de `postcss <8.5.10` con CVE moderada (XSS en stringify CSS). El fix requeriría degradar a Next.js 9.3.3 — no viable. Aceptado para MVP interno local; no afecta a la funcionalidad de auth+inventario. Revisar cuando Next.js publique un parche postcss.

---

## Qué NO se implementó (por diseño)

- Formulario de alta de camiseta → S022
- Sugerencias Claude → S022
- Botón "Crear borrador en WC" → S022
- Upload de imágenes → futuro
- Supabase Storage → futuro
- Deploy a Vercel → futuro
- Seed de datos reales → Pablo lo hará manualmente
- Workspace seed (INSERT INTO workspaces) → Pablo lo ejecutará manualmente en Supabase SQL Editor

---

## Riesgos documentados

1. **Workspace no inicializado**: Las políticas RLS usan `owner_id = auth.uid()`. Para que la vista de inventario muestre datos, el usuario de Supabase Auth debe tener filas con su UID. Pablo debe ejecutar el seed de workspace manualmente tras el primer login. El empty state es el comportamiento correcto hasta entonces.

2. **Auth callback URL**: El magic link redirige a `{origin}/auth/callback`. En local, `origin = http://localhost:3000`. En Vercel (futuro), debe configurarse como URL autorizada en Supabase Auth > URL Configuration > Redirect URLs.

3. **postcss CVE transitiva**: Ver nota en validaciones. Solo afecta builds, no el runtime de la app.

---

## Siguiente paso

S022 — STUDIO_CREATE_AND_PUBLISH:
- Formulario alta camiseta (inventory_items + football_shirt_details)
- Botón "Sugerir con Claude" (Anthropic API)
- Botón "Crear borrador en WC" (WC REST API Bridge)
