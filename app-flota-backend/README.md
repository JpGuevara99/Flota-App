# Backend (Express + Prisma + Postgres)

Este backend provee una API REST para persistir **vehículos**, **documentos** y **historial**.

## Requisitos

- Node.js 18+

## Variables de entorno

Crea un `.env` (o exporta variables) basado en `.env.example`:

- `DATABASE_URL` (Postgres/Neon): `postgresql://...?...`
- `PORT` (default `3001`)
- `CORS_ORIGIN` (default `http://localhost:8080`)

## Setup

```bash
cd app-flota-backend
npm install

# aplicar migraciones + generar cliente (en tu Postgres)
DATABASE_URL="postgresql://..." npx prisma migrate dev

# poblar datos iniciales
DATABASE_URL="postgresql://..." npm run db:seed
```

## Ejecutar

```bash
cd app-flota-backend
DATABASE_URL="postgresql://..." npm run dev
```

## Deploy (Render + Neon)

- En **Neon** crea una DB y copia el `DATABASE_URL` (con `sslmode=require`).
- En **Render** crea un **Web Service** desde este repo:
  - **Root directory**: `app-flota-backend`
  - **Build command**:
    - `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
  - **Start command**:
    - `npm run start`
  - **Environment variables**:
    - `DATABASE_URL` = (Neon)
    - `CORS_ORIGIN` = tu dominio de Vercel (ej. `https://tu-app.vercel.app`)

## Endpoints

- `GET /health`
- `GET /api/vehicles`
- `POST /api/vehicles`
- `PATCH /api/vehicles/:id`
- `DELETE /api/vehicles/:id`
- `POST /api/vehicles/:vehicleId/documents`
- `PATCH /api/vehicles/:vehicleId/documents/:documentId`
- `DELETE /api/vehicles/:vehicleId/documents/:documentId`
- `GET /api/history?limit=500`

