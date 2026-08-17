import { sendOtpEmail } from "../utils/email.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { createUser, findUserByEmail } from "../models/user.js";
import { createOtp } from "../models/otp.js";
import { createToken } from "../models/token.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { pool } from "../config/db.js";

const register = async (req, res) => {
  const client = await pool.connect();
  const purpose = "verify_email";
  const expires_in = 10;
  const expires_at = new Date(Date.now() + expires_in * 60 * 1000);
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter username, email and password",
      });
    }

    const emailFound = await findUserByEmail(email);
    if (emailFound) {
      return res.status(409).json({
        success: false,
        message: "Email already exist",
      });
    }

    await client.query("BEGIN");

    const password_hash = await hashPassword(password);
    const user = await createUser(username, email, password_hash, client);
    const otp = generateOtp();
    const otp_hash = hashOtp(otp);
    const new_otp = await createOtp(
      user.id,
      otp_hash,
      purpose,
      expires_at,
      client,
    );

    await sendOtpEmail(email, otp);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Registration successful, check your email for OTP",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  const expires_in = 7;
  const expires_at = new Date(Date.now() + expires_in * 24 * 60 * 60 * 1000);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "please enter email and password",
    });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(409).json({
      success: false,
      message: "user doesn't exist",
    });
  }

  if (!user.is_verified) {
    return res.status(403).json({
      success: false,
      message: "please verify your email",
    });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "incorrect password!",
    });
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await createToken(
    user.id,
    refreshToken,
    req.ip,
    req.headers["user-agent"],
    expires_at,
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "user login successful",
  });
};

export { register, login };
