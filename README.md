# Warden

Warden is a lightweight authentication API built with Node.js, Express, PostgreSQL, and JWT-based cookie auth. 

## Overview

- Base URL: `http://localhost:5000` for local development
- Public routes: `/` and `/health`
- Auth API prefix: `/api/v1/auth`

## Stack

- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- Auth: JWT (access + refresh tokens)
- Email delivery: Brevo / SMTP
- Validation: Zod

## Local setup

```bash
git clone https://github.com/osegee/warden.git
cd warden
npm install
cp .env.example .env
npm run dev
```

## Environment variables

```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL=******host:5432/dbname

JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=no-reply@example.com
EMAIL_FROM=Your App <no-reply@example.com>
```

## Database schema

![warden ERD](./warden-ERD.png)
