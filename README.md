# Sistema de lealtad

Aplicación Next.js para sincronizar clientes, pedidos y pagos desde fakeapi.dev,
calcular puntos con corte fijo al 30 de abril de 2026 y ofrecer panel interno y
portal de clientes.

## Ejecución local

```bash
pnpm install
pnpm dev
```

La base PostgreSQL debe tener las tablas usadas por `lib/services/syncService.js`,
`users`, `orders`, `payments`, `point_movements`, `rewards`, `redemptions`,
`internal_users`, `roles`, `permissions`, `role_permissions` y `api_tokens`.
Ejecuta `pnpm exec node scripts/seed-admin.js` después de crear el rol administrador.

## Variables de entorno

```env
DATABASE_URL=
FAKE_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
CRON_SECRET=
```

Las variables se consumen únicamente en el servidor. Nunca publiques `.env.local`.

## Flujos disponibles

- Personal interno: `/auth/login` y `/dashboard`.
- Recompensas: `/admin/rewards`.
- Portal de clientes: `/client/login` y `/client`.
- Endpoints de validación: `/api/fidelizacion/*`, con `Authorization: Bearer <token>`.
- Cron diario: `/api/sync/cron`, protegido con `CRON_SECRET`.

El portal crea una sesión HTTP-only para el cliente; el `clientId` nunca se acepta
desde el navegador para cambiar contraseña o canjear.

## Decisiones técnicas

- PostgreSQL conserva datos sincronizados y el historial de puntos.
- La sincronización reemplaza solo movimientos derivados de la fuente (`pago`,
  `reembolso` y `bono_orden_entregada`), preservando canjes y haciendo el proceso
  repetible.
- Los canjes bloquean cliente y recompensa dentro de una transacción para evitar
  saldo negativo y sobreventa de stock.
- Las imágenes se guardan en Supabase Storage; la base solo conserva la URL.

## Modelo de datos

```mermaid
erDiagram
  users ||--o{ orders : places
  users ||--o{ payments : makes
  users ||--o{ point_movements : owns
  users ||--o{ redemptions : creates
  rewards ||--o{ redemptions : redeemed
  internal_users }o--|| roles : has
  roles }o--o{ permissions : grants
```

## Arquitectura

```mermaid
flowchart LR
  UI[Panel y portal Next.js] --> API[Route handlers]
  API --> DB[(PostgreSQL)]
  API --> Storage[Supabase Storage]
  Cron[Vercel Cron] --> Sync[Sincronizador]
  Sync --> Fake[fakeapi.dev]
  Sync --> DB
  Evaluator[Evaluador] -->|Bearer token + CORS| API
```