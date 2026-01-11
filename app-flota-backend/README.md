# Backend (Express + Prisma + SQLite)

Este backend provee una API REST para persistir **vehículos**, **documentos** y **historial**.

## Requisitos

- Node.js 18+

## Variables de entorno

Crea un `.env` (o exporta variables) basado en `.env.example`:

- `DATABASE_URL` (SQLite): `file:./prisma/dev.db`
- `PORT` (default `3001`)
- `CORS_ORIGIN` (default `http://localhost:8080`)

## Setup

```bash
cd app-flota-backend
npm install

# crear DB + migraciones + generar cliente
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev --name init

# poblar datos iniciales
DATABASE_URL="file:./prisma/dev.db" npm run db:seed
```

## Ejecutar

```bash
cd app-flota-backend
DATABASE_URL="file:./prisma/dev.db" npm run dev
```

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

