# Resolution-First MVP

A lightweight, resolution-first decision flow built with Next.js App Router, Prisma, and SQLite.

## Getting started

1) Install dependencies

```bash
npm install
```

2) Run migrations (creates `prisma/dev.db`)

```bash
npx prisma migrate dev --name init
```

3) Seed the database

```bash
npx prisma db seed
```

4) Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## Useful scripts

```bash
npm run prisma:migrate
npm run prisma:seed
npm run build
```

## Notes

- The seed inserts one active decision with expectations, a placeholder resolution, and post-mortem data.
- The main flow is: Dashboard → Details → Market → Resolution → Post-Mortem → Dashboard.
- The Decision Gate wizard is accessible from the header and dashboard but is not part of the main flow.
- Add expectations from the Decision Details page; new entries appear in the Expectations list and update Market and Dashboard counts.
- Resolution CSV uploads happen on the Resolution page; the app calculates uplift, compares against the threshold, and stores the outcome.

CSV format example (first row is a header, `converted` must be `0` or `1`):

```csv
user_id,converted
1,1
2,0
3,1
```
