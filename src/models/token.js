import { pool } from "../config/db.js";

const createToken = async (
  user_id,
  token,
  ip_address,
  user_agent,
  expires_at,
  client = pool,
) => {
  const result = await client.query(
    `INSERT INTO refresh_tokens (user_id, token, ip_address, user_agent, expires_at) VALUES($1,$2,$3,$4,$5) RETURNING id`,
    [user_id, token, ip_address, user_agent, expires_at],
  );

  return result.rows[0];
};

const findRefreshToken = async (token) => {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens WHERE token = $1`,
    [token],
  );

  return result.rows[0];
};

const revokeToken = async (token_id, client = pool) => {
  const result = await client.query(
    `UPDATE refresh_tokens SET is_revoked = true WHERE id = $1`,
    [token_id],
  );
};

export { revokeToken, findRefreshToken, createToken };
