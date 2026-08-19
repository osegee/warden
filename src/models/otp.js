import { pool } from "../config/db.js";

const createOtp = async (user_id, code, purpose, expires_at, client = pool) => {
  const result = await client.query(
    `INSERT INTO otp_codes (user_id, code, purpose, expires_at) VALUES($1, $2, $3, $4) RETURNING * `,
    [user_id, code, purpose, expires_at],
  );
  return result.rows[0];
};
const findOtpByUserAndPurpose = async (user_id, purpose) => {
  const result = await pool.query(
    `SELECT * FROM otp_codes WHERE user_id = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1`,
    [user_id, purpose],
  );
  return result.rows[0];
};
const markOtpAsUsed = async (otp_id, client = pool) => {
  const result = await client.query(
    `UPDATE otp_codes SET is_used = true WHERE id = $1`,
    [otp_id],
  );
  return result.rows[0];
};
const incrementOtpAttempts = async (otp_id) => {
  const result = await pool.query(
    `UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`,
    [otp_id],
  );
  return result.rows[0];
};

const invalidateOtps = async (user_id, purpose) => {
  const result = await pool.query(
    `UPDATE otp_codes SET is_used = true WHERE user_id = $1 AND purpose = $2`,
    [user_id, purpose],
  );
};

export {
  createOtp,
  findOtpByUserAndPurpose,
  markOtpAsUsed,
  incrementOtpAttempts,
  invalidateOtps,
};
