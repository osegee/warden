# Warden 🛡️

A production-ready authentication REST API built with Node.js, Express, and PostgreSQL. Warden handles the full authentication lifecycle including registration, email verification, login, password reset, and session management.

https://warden-femi.onrender.com

---

## Features

- User registration with email OTP verification
- Secure login with JWT access and refresh tokens
- Cookie-based authentication (httpOnly, secure, sameSite)
- Password hashing with bcrypt (12 salt rounds)
- OTP hashing with SHA-256
- Refresh token rotation with device tracking (IP + User-Agent)
- Forgot password and reset password flow
- Resend OTP support for both email verification and password reset
- Logout with token revocation
- Brute-force protection (max 3 OTP attempts)
- OTP expiry (10 minutes)
- Transaction-safe DB operations (atomic user + OTP creation)
- Morgan request logging (dev/combined by environment)
- Helmet security headers
- CORS support
- Rate limiting ready

---

## Tech Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Runtime          | Node.js v24+                     |
| Framework        | Express.js                       |
| Database         | PostgreSQL                       |
| ORM              | Raw SQL via `pg` (node-postgres) |
| Authentication   | JWT (jsonwebtoken)               |
| Password Hashing | bcrypt                           |
| OTP Hashing      | Node.js crypto (SHA-256)         |
| Email            | Nodemailer + Brevo SMTP          |
| Environment      | dotenv                           |
| Logging          | Morgan                           |
| Security         | Helmet, CORS                     |
| Dev Server       | Nodemon                          |

---

## Project Structure

```
warden/
├── src/
│   ├── config/
│   │   ├── db.js            # PostgreSQL pool + connectDB
│   │   └── migrate.js       # Database migration runner
│   ├── controllers/
│   │   └── auth.controller.js  # All auth route handlers
│   ├── middlewares/         # Auth guards, rate limiting
│   ├── models/
│   │   ├── user.js          # User DB queries
│   │   ├── otp.js           # OTP DB queries
│   │   └── token.js         # Refresh token DB queries
│   ├── routes/
│   │   └── auth.routes.js   # Auth route definitions
│   ├── utils/
│   │   ├── email.js         # Nodemailer transporter + sendOtpEmail
│   │   ├── hash.js          # bcrypt hashPassword + comparePassword
│   │   ├── jwt.js           # signAccessToken, signRefreshToken, verifyToken
│   │   └── otp.js           # generateOtp + hashOtp
│   └── validators/          # Zod input validation schemas
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

---

## Database Schema

### `users`

| Column      | Type         | Notes                       |
| ----------- | ------------ | --------------------------- |
| id          | UUID         | Primary key, auto-generated |
| username    | VARCHAR(50)  | Not null                    |
| email       | VARCHAR(255) | Unique, not null            |
| password    | TEXT         | bcrypt hashed               |
| is_verified | BOOLEAN      | Defaults to false           |
| created_at  | TIMESTAMPTZ  | Defaults to NOW()           |
| updated_at  | TIMESTAMPTZ  | Defaults to NOW()           |

### `otp_codes`

| Column     | Type        | Notes                              |
| ---------- | ----------- | ---------------------------------- |
| id         | UUID        | Primary key                        |
| user_id    | UUID        | FK → users(id)                     |
| code       | TEXT        | SHA-256 hashed OTP                 |
| purpose    | ENUM        | `verify_email` or `reset_password` |
| attempts   | INTEGER     | Defaults to 0, max 3               |
| is_used    | BOOLEAN     | Defaults to false                  |
| expires_at | TIMESTAMPTZ | 10 minutes from creation           |
| created_at | TIMESTAMPTZ | Defaults to NOW()                  |

### `refresh_tokens`

| Column     | Type        | Notes                  |
| ---------- | ----------- | ---------------------- |
| id         | UUID        | Primary key            |
| user_id    | UUID        | FK → users(id)         |
| token      | TEXT        | Full JWT refresh token |
| is_revoked | BOOLEAN     | Defaults to false      |
| ip_address | TEXT        | Client IP              |
| user_agent | TEXT        | Client device info     |
| expires_at | TIMESTAMPTZ | 7 days from creation   |
| created_at | TIMESTAMPTZ | Defaults to NOW()      |

---

## API Endpoints

Base URL: `/api/v1/auth`

| Method | Endpoint           | Description                  | Auth Required |
| ------ | ------------------ | ---------------------------- | ------------- |
| POST   | `/register`        | Register new user + send OTP | No            |
| POST   | `/login`           | Login + set auth cookies     | No            |
| POST   | `/verify-email`    | Verify email with OTP        | No            |
| POST   | `/resend-otp`      | Resend OTP (verify or reset) | No            |
| POST   | `/forgot-password` | Request password reset OTP   | No            |
| POST   | `/reset-password`  | Reset password with OTP      | No            |
| POST   | `/logout`          | Logout + revoke token        | Yes           |
| POST   | `/refresh-token`   | Get new access token         | Yes           |
| DELETE | `/delete-account`  | Delete user account          | Yes           |

---

## Request & Response Examples

### POST `/register`

```json
// Request
{
  "username": "osegie",
  "email": "osegie@gmail.com",
  "password": "securepass123"
}

// Response 201
{
  "success": true,
  "message": "Registration successful, check your email for OTP"
}
```

### POST `/login`

```json
// Request
{
  "email": "osegie@gmail.com",
  "password": "securepass123"
}

// Response 200 (sets httpOnly cookies)
{
  "success": true,
  "message": "User login successful"
}
```

### POST `/verify-email`

```json
// Request
{
  "email": "osegie@gmail.com",
  "otp": "482910"
}

// Response 200
{
  "success": true,
  "message": "Email verification successful"
}
```

### POST `/forgot-password`

```json
// Request
{
  "email": "osegie@gmail.com"
}

// Response 200
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### POST `/reset-password`

```json
// Request
{
  "email": "osegie@gmail.com",
  "otp": "193847",
  "newPassword": "newsecurepass456"
}

// Response 200
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/warden

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Brevo SMTP
BREVO_SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SENDER_EMAIL=your_brevo_login@smtp-relay.brevo.com
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=Warden <your@email.com>
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Brevo account (for email)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/warden.git
cd warden

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
node src/config/migrate.js

# Start development server
npm run dev
```

### Scripts

```bash
npm run dev    # Start with nodemon (development)
npm start      # Start with node (production)
npm run migrate # Run database migrations
```

---

## Security Considerations

- Passwords hashed with bcrypt at 12 salt rounds
- OTP codes hashed with SHA-256 before storage
- JWT tokens stored in httpOnly cookies (not localStorage)
- Separate secrets for access and refresh tokens
- Refresh tokens stored in DB and revoked on logout
- OTP brute-force protection (3 attempts max)
- OTP expiry (10 minutes)
- Helmet.js for secure HTTP headers
- CORS configured with credentials support
- Environment-based cookie security (secure flag in production)

---

## Author

**Osegie** — Backend Developer  
GitHub: [@osegee](https://github.com/osegee)

---

## License

MIT
