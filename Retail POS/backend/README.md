# Retail POS Backend (Node.js + Express.js)

This backend starter is scoped to **Project 1: Omnichannel Retail POS and Inventory Management System** from the uploaded project specification, adapted to plain JavaScript as requested.

## Included scope
- JWT authentication
- Role-based access control for cashier, inventory_manager, system_admin
- Stores, products, customers, promotions, tax rules
- Inventory stock and inventory ledger
- POS checkout with MongoDB transactions
- Refund flow with stock restoration
- Redis config and cache helper
- Swagger docs endpoint
- Docker setup
- Basic Jest test scaffold

## Quick start
```bash
cp .env.example .env
npm install
npm run dev
```

## Docker
```bash
docker compose up --build
```

## API docs
- `GET /api/docs`

## Important note
The original PDF specifies TypeScript for the backend stack, but this implementation intentionally uses **Node.js + Express.js without TypeScript** to match your request while keeping the backend scope aligned with Project 1.
