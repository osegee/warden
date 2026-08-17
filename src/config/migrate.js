import "dotenv/config";
import { pool } from "./db.js";

const migrate = async () => {
  try {
    await pool.query(`
      DO $$ BEGIN 
      CREATE TYPE otp_purpose AS ENUM('verify_email', 'reset_password');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(
      `CREATE TABLE IF NOT EXISTS users(
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) NOT NULL,
      email VARCHAR(225) UNIQUE NOT NULL,
      password TEXT NOT NULL, 
      is_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS otp_codes(
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      code TEXT NOT NULL,
      purpose otp_purpose NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      is_used BOOLEAN NOT NULL DEFAULT false,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS refresh_tokens(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        token TEXT NOT NULL, 
        ip_address TEXT NOT NULL,
        user_agent TEXT NOT NULL, 
        is_revoked BOOLEAN DEFAULT false,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
    );

    console.log("migration successful");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

migrate();
