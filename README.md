# PadelHub SaaS

Plataforma multi-tenant para administrar complejos deportivos, disponibilidad de canchas, reservas y pagos.

## Stack

- Next.js, TypeScript y Tailwind CSS
- NestJS, REST y Socket.IO
- PostgreSQL, Prisma y Redis
- pnpm Workspaces y Turborepo
- Mercado Pago OAuth por complejo

## Desarrollo local

Requisitos: Node.js 20.9+, Corepack y Docker Desktop.

```bash
corepack enable
pnpm install
Copy-Item .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/api
- Health: http://localhost:3001/api/health

Cada complejo conecta su cuenta de Mercado Pago mediante OAuth Authorization Code. PadelHub cifra los tokens y crea los cobros usando la cuenta del complejo. La reserva se confirma mediante webhook verificado, nunca solamente por el retorno del navegador.
