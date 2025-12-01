# Contributing Guide

## Initial Setup

You'll need Node.js 24+ and pnpm 10+.

- Run `pnpm install && pnpm dev:setup`.
- Set up a Postgres database locally and add the connection string to `.env` as `DATABASE_URL` or run `docker-compose up -d` to start postgres in a docker container.
- Postgres setup:

```SQL
CREATE ROLE fate WITH LOGIN PASSWORD 'echo';
CREATE DATABASE fate;
ALTER DATABASE fate OWNER TO fate;
```

- `pnpm prisma migrate dev` to create the database and run the migrations.
- You might want to run `pnpm prisma migrate reset` to seed the database with initial data.
- Run `pnpm dev` to run the example.
- Run `pnpm fate generate` to regenerate the fate client code.

## Running Tests

- When changing framework code, you need to run `pnpm build`.
- Run `pnpm test` to run all tests.
- Run `pnpm tsgo` to run TypeScript, and `pnpm vitest` to run JavaScript tests.
- If `@nkzw/fate` or `react-fate` modules cannot be resolved it means you forgot to run `pnpm build`.
