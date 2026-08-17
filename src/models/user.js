import { pool } from "../config/db.js";

const findUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email.toLowerCase(),
  ]);

  return result.rows[0];
};

const createUser = async (username, email, password, client = pool) => {
  const result = await client.query(
    `INSERT INTO users (username, email, password) VALUES($1, $2, $3) RETURNING id, username, email, is_verified, created_at`,
    [username, email.toLowerCase(), password],
  );

  return result.rows[0];
};

const verifyUser = async (user_id) => {
  const result = await pool.query(
    ` UPDATE users SET is_verified = true WHERE sid = $1`,
    [user_id],
  );
};

export { findUserByEmail, createUser, verifyUser };
