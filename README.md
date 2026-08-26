# Warden 🛡️

An authentication REST API built with Node.js, Express, and PostgreSQL. Warden handles the full authentication lifecycle including registration, email verification, login with cookie-based JWT, password reset, token rotation, and account deletion.

**Live API:** `warden-seven-nu.vercel.app`

---

## Features

- User registration with email OTP verification
- Secure login with JWT access and refresh tokens
- Cookie-based authentication (httpOnly, secure, sameSite)
- Password hashing with bcrypt (12 salt rounds)
- OTP hashing with SHA-256
- Refresh token rotation with device tracking (IP + User-Agent)
- Forgot password and reset password flow
- Resend OTP for both email verification and password reset
- Logout with token revocation
- Account deletion with password confirmation
- Brute-force protection (max 3 OTP attempts)
- OTP expiry (10 minutes)
- Transaction-safe DB operations (atomic user + OTP creation)
- ON DELETE CASCADE for clean account deletion
- Auth middleware for protected routes
- Morgan request logging (dev/combined by environment)
- Helmet security headers
- CORS support

---

## Tech Stack

| Layer     | Technology               |
| --------- | ------------------------ |
| Runtime   | Node.js v24+             |
| Framework | Express.js               |
| Database  | PostgreSQL (Neon)        |
| Hosting   | Vercel (API) + Neon (DB) |

---

## Project Structure

```
warden/
├── src/
│   ├── config/
│   │   ├── db.js               # PostgreSQL pool + connectDB
│   │   └── migrate.js          # Database migration runner
│   ├── controllers/
│   │   └── auth.controller.js  # All auth route handlers
│   ├── middlewares/
│   │   └── auth.middleware.js  # JWT protect middleware
│   ├── models/
│   │   ├── user.js             # User DB queries
│   │   ├── otp.js              # OTP DB queries
│   │   └── token.js            # Refresh token DB queries
│   ├── routes/
│   │   └── auth.routes.js      # Auth route definitions
│   ├── utils/
│   │   ├── email.js            # Brevo HTTP API email sender
│   │   ├── hash.js             # bcrypt hashPassword + comparePassword
│   │   ├── jwt.js              # signAccessToken, signRefreshToken, verifyToken
│   │   └── otp.js              # generateOtp + hashOtp
│   └── validators/             # Zod input validation schemas
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

---

## API Endpoints

Base URL: `/api/v1/auth`

| Method | Endpoint           | Description                        | Auth Required |
| ------ | ------------------ | ---------------------------------- | ------------- |
| POST   | `/register`        | Register new user + send OTP       | No            |
| POST   | `/login`           | Login + set auth cookies           | No            |
| POST   | `/verify-email`    | Verify email with OTP              | No            |
| POST   | `/resend-otp`      | Resend OTP (verify or reset)       | No            |
| POST   | `/forgot-password` | Request password reset OTP         | No            |
| POST   | `/reset-password`  | Reset password with OTP            | No            |
| POST   | `/logout`          | Logout + revoke refresh token      | Yes           |
| POST   | `/refresh-token`   | Get new access + refresh tokens    | No            |
| DELETE | `/delete-account`  | Delete account (requires password) | Yes           |

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

// Response 200 — sets httpOnly cookies
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

### POST `/resend-otp`

```json
// Request
{
  "email": "osegie@gmail.com",
  "purpose": "verify_email"
}

// Response 200
{
  "success": true,
  "message": "OTP sent successfully"
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

### POST `/refresh-token`

```json
// No body needed — reads refreshToken from cookie

// Response 200 — sets new cookies
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

### DELETE `/delete-account`

```json
// Request (requires auth cookie)
{
  "password": "securepass123"
}

// Response 200
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Environment Variables

Create a `.env` file in the root:

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

# Brevo Email API
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_brevo_sender@email.com
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Brevo account (free tier works)

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
npm run dev      # Start with nodemon (development)
npm start        # Start with node (production)
npm run migrate  # Run database migrations
```

---

## Authentication Flow

```
Register → OTP sent to email
        ↓
Verify email with OTP
        ↓
Login → access token (15min) + refresh token (7days) set as httpOnly cookies
        ↓
Access token expires → hit /refresh-token → new tokens issued (rotation)
        ↓
Logout → refresh token revoked + cookies cleared
```

---

## Security Considerations

- Passwords hashed with bcrypt (12 salt rounds)
- OTP codes hashed with SHA-256 before storage
- JWT tokens stored in httpOnly cookies (not localStorage)
- Separate secrets for access and refresh tokens
- Refresh token rotation — old token revoked on each refresh
- Refresh tokens stored in DB with IP + User-Agent tracking
- OTP brute-force protection (3 attempts max)
- OTP expiry (10 minutes)
- ON DELETE CASCADE — clean deletion of all user data
- Helmet.js for secure HTTP headers
- CORS configured with credentials support
- Environment-based cookie security (secure flag in production)

---

## Author

**Osegie** — Backend Developer  
GitHub: [@osegee](https://github.com/osegee)
