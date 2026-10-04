# FST Assignment 2 – Prisma + Faker Seeding + Better Auth RBAC + Resend/React Email

Stack: Next.js 16 (App Router, `proxy.ts`), PostgreSQL, Prisma 6, Better Auth, Faker.js, Resend, React Email.

## 1. Prerequisites
- Node.js 20.9+ (`node -v`)
- PostgreSQL 14+ — easiest via Docker (included `docker-compose.yml`), or install Postgres locally
- A free Resend account (https://resend.com) → create an API key

## 2. Setup
```bash
# unzip, then:
cd fst-app
docker compose up -d            # starts Postgres (skip if you have your own)
cp .env.example .env            # Windows: copy .env.example .env
# edit .env: set BETTER_AUTH_SECRET (run: npx @better-auth/cli secret  or any 32+ char string),
#            RESEND_API_KEY, and later RESEND_WEBHOOK_SECRET
npm install
npx prisma migrate dev --name init   # creates tables + migration folder (also runs the seed)
```

## 3. Database CLI workflow (Part A)
```bash
npm run db:fresh     # ONE command: drops DB -> applies all migrations -> runs prisma/seed.ts
npm run db:seed      # seed only
npm run db:studio    # GUI at http://localhost:5555 (take screenshots here)
```
Seeded users all use password `Password123!`; admin is `admin@example.com`.

## 4. Run
```bash
npm run dev          # http://localhost:3000
```
- Register a new user → role MEMBER, welcome email is sent, audit + EmailLog rows written.
- Login as admin → `/admin` (users, email delivery log, audit log).
- Add a transaction ≥ ₹1000 → alert email.
- Guests (seeded, role GUEST) are read-only; non-admins visiting `/admin` are redirected.

Note: with Resend's default `onboarding@resend.dev` sender you can only email **your own Resend account address**. Register with that address to see mail arrive, or verify a domain and set `EMAIL_FROM`.

## 5. Test the protected APIs
```bash
curl -i localhost:3000/api/transactions             # 401 (no session)
# log in in the browser, copy the cookie from DevTools, then:
curl -i localhost:3000/api/admin/users -H "Cookie: <paste>"   # 200 admin / 403 others
curl -X POST localhost:3000/api/transactions -H "Cookie: <paste>" \
     -H "Content-Type: application/json" -d '{"amount":2500,"description":"test"}'
```

## 6. Resend webhook (delivery / bounce logging)
Resend can't reach localhost, so tunnel it:
```bash
npx ngrok http 3000            # or: cloudflared tunnel --url http://localhost:3000
```
Resend dashboard → Webhooks → Add endpoint `https://<tunnel>/api/webhooks/resend`, select
`email.sent, email.delivered, email.bounced, email.complained, email.delivery_delayed`.
Copy the signing secret into `RESEND_WEBHOOK_SECRET`, restart `npm run dev`.
To test a bounce, send to `bounced@resend.dev`.

## 7. File map
| Path | Purpose |
|---|---|
| `prisma/schema.prisma` | User, Session, Account, Verification, Transaction, AuditLog, EmailLog |
| `prisma/seed.ts` | Faker (en_IN) relational seeding with FK integrity + login-able users |
| `proxy.ts` | Session + RBAC gate (Next 16; rename to `middleware.ts` / export `middleware` on Next ≤15) |
| `lib/auth.ts` | Better Auth config, role field, post-signup hook |
| `lib/email.ts`, `emails/*` | Resend sender + React Email templates |
| `app/api/transactions`, `app/api/admin/users` | Session/role-checked route handlers |
| `app/dashboard/actions.ts` | Protected Server Action |
| `app/api/webhooks/resend/route.ts` | Svix-verified webhook → EmailLog |

## 8. Deliverable tips
- Screenshots: terminal output of `npm run db:fresh`, Prisma Studio tables, `/admin` page, Resend dashboard.
- Architecture note: ER diagram (User 1-N Transaction/AuditLog/EmailLog/Session/Account), flow
  Browser → proxy.ts (getSession, role check) → route/action (re-check) → Prisma → Resend → webhook → EmailLog.

## Troubleshooting
- `prisma migrate dev` can't connect → check Postgres is up and `DATABASE_URL`.
- Emails FAILED in EmailLog → bad `RESEND_API_KEY` or recipient not allowed by sandbox sender.
- Webhook 400 → wrong `RESEND_WEBHOOK_SECRET`.
