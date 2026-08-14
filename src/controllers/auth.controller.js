import pool from '../config/db.js';
import { generateOtp, hashOtp } from '../utils/otp.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { hashPassword } from '../utils/password.js';

const OTP_EXPIRY_MINUTES = 10;

export async function signup(req, res) {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'full_name, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const client = await pool.connect();

  try {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await hashPassword(password);

    await client.query('BEGIN');

    const userResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, is_verified)
       VALUES ($1, $2, $3, false)
       RETURNING id, full_name, email, is_verified, created_at`,
      [full_name, email, passwordHash]
    );
    const user = userResult.rows[0];

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await client.query(
      `INSERT INTO otps (user_id, otp_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, otpHash, expiresAt]
    );

    await client.query('COMMIT');

    // Send email after commit — if this fails, the user still exists
    // and can hit /resend-otp rather than losing the whole signup.
    try {
      await sendOtpEmail(user.email, otp);
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr.message);
      return res.status(201).json({
        message: 'Account created, but the verification email failed to send. Please use resend-otp.',
        user,
      });
    }

    return res.status(201).json({
      message: 'Account created. Check your email for the verification code.',
      user,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Signup error:', err.message);
    return res.status(500).json({ error: 'Something went wrong during signup' });
  } finally {
    client.release();
  }
}