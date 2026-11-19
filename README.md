# PROJECT X — All Social Media Hub

Dashboard web multi-user untuk shortcut platform sosial, manajemen tautan, dan fondasi integrasi akun.

## Struktur proyek

- `apps/web` — Next.js dashboard
- `services/api` — Cloudflare Workers API
- `packages/database` — Neon PostgreSQL schema

Deployment target: Cloudflare Pages dan Cloudflare Workers.

> Jangan commit DATABASE_URL, .dev.vars, .env.local, atau kredensial API.

Status: repository initialization. Source application will be committed separately before production deployment.
