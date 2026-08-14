# Warden

A lightweight authentication API built with Node.js, Express, and PostgreSQL — featuring email OTP verification on signup and JWT access/refresh token rotation.

## Features

- **Signup with email verification** — users register, receive a one-time password via email (Nodemailer), and verify before gaining full access
- **JWT authentication** — short-lived access tokens paired with long-lived, revocable refresh tokens
- **Secure by default** — passwords and OTPs are hashed before storage, OTPs expire and are rate-limited against brute-force attempts
- **PostgreSQL** — relational schema with proper foreign keys and cascading deletes

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | PostgreSQL (`node-pg`) |
| Email | Nodemailer |
| Auth | JWT (access + refresh tokens) |

## Schema

**users** — id, full_name, email, password_hash, is_verified, created_at, updated_at
**otps** — id, user_id (FK), otp_hash, expires_at, is_used, attempts
**refresh_tokens** — id, user_id (FK), token_hash, expires_at, revoked, created_at

See [`schema.sql`](./schema.sql) for the full DDL.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/signup` | Create a new user, send OTP to email |
| `POST` | `/verify-otp` | Verify OTP, activate account |
| `POST` | `/resend-otp` | Request a new OTP (rate-limited) |
| `POST` | `/login` | Authenticate, receive access + refresh tokens |
| `POST` | `/refresh` | Exchange refresh token for a new access token |
| `POST` | `/logout` | Revoke a refresh token |

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- An SMTP account for Nodemailer (e.g. Gmail app password, SendGrid, Mailtrap for dev)

### Setup

```bash
git clone https://github.com/<your-username>/warden.git
cd warden
npm install
```

Create a `.env` file:

```env
DATABASE_URL=postgres://user:pass@localhost:5432/warden
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

Run the schema against your database:

```bash
psql $DATABASE_URL -f schema.sql
```

Start the server:

```bash
npm run dev
```

## Design decisions

- **OTPs live in their own table**, not as columns on `users` — this preserves history for rate-limiting and avoids race conditions when a user requests multiple codes.
- **OTPs and tokens are hashed at rest** — a database leak shouldn't hand out valid credentials.
- **Refresh tokens are revocable** — logging out (or detecting a compromised token) flips `revoked = true` rather than relying on expiry alone.

## Roadmap

- [ ] Password reset flow (reusing the `otps` pattern)
- [ ] Rate limiting middleware
- [ ] Login-attempt lockout
- [ ] Docker Compose for local Postgres

## License

MIT