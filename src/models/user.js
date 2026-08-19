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

const verifyUser = async (user_id, client = pool) => {
  const result = await client.query(
    ` UPDATE users SET is_verified = true WHERE id = $1`,
    [user_id],
  );
};
const updatePassword = async (password, user_id) => {
  const result = await pool.query(
    `UPDATE users SET password = $1, updated_at = NOW() WHERE user_id = $2`[
      (password, user_id)
    ],
  );
  return result.rows[0];
};

export { findUserByEmail, createUser, verifyUser, updatePassword };
