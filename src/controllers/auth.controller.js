import { sendOtpEmail } from "../utils/email.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import {
  createUser,
  findUserByEmail,
  updatePassword,
  verifyUser,
  findUserById,
  deleteUser,
} from "../models/user.js";
import {
  createOtp,
  findOtpByUserAndPurpose,
  incrementOtpAttempts,
  invalidateOtps,
  markOtpAsUsed,
} from "../models/otp.js";
import { createToken, findRefreshToken, revokeToken } from "../models/token.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../utils/jwt.js";
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
  try {
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const verifyEmail = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, otp } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        success: false,
        message: "please enter otp",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(409).json({
        success: false,
        message: "user doesn't exist, please register",
      });
    }

    const otpRecord = await findOtpByUserAndPurpose(user.id, "verify_email");
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found, request a new one",
      });
    }

    if (otpRecord.is_used) {
      return res.status(400).json({
        success: false,
        message: "OTP already used",
      });
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({
        success: false,
        message: "OTP expired, request a new one",
      });
    }

    if (otpRecord.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: "too many attempts, request a new OTP",
      });
    }

    const hashedCode = hashOtp(otp);
    if (hashedCode !== otpRecord.code) {
      await incrementOtpAttempts(otpRecord.id);
      return res.status(400).json({
        success: false,
        message: "invalid OTP",
      });
    }

    await client.query("BEGIN");
    await markOtpAsUsed(otpRecord.id);
    await verifyUser(user.id);
    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Email verification successful",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await client.release();
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        succcess: false,
        message: "email and purpose required",
      });
    }

    const user = await user.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    if (purpose === "verify_email" && user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    const expires_at = new Date(Date.now() + 10 * 60 * 1000);
    const otp = generateOtp();
    const otp_hash = hashOtp(otp);

    await invalidateOtps(user.id, purpose);
    await createOtp(user.id, otp_hash, purpose, expires_at);
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      succcess: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshToken;

    if (!refresh_token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }
    const token = await findRefreshToken(refresh_token);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }
    await revokeToken(token.id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error", error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await invalidateOtps(user.id, "reset_password");
    const otp = generateOtp();
    const otp_hash = hashOtp(otp);
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await createOtp(user.id, otp_hash, "reset_password", expires_at);
    await sendOtpEmail(email, otp);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent sucessfully" });
  } catch (error) {
    console.error("Forgot password error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "please include all required fields",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    const otpRecord = await findOtpByUserAndPurpose(user.id, "reset_password");
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found, request a new one",
      });
    }

    if (otpRecord.is_used) {
      return res.status(400).json({
        success: false,
        message: "OTP already used",
      });
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({
        success: false,
        message: "OTP expired, request a new one",
      });
    }

    if (otpRecord.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: "too many attempts, request a new OTP",
      });
    }

    const hashedOtp = hashOtp(otp);
    if (hashedOtp !== otpRecord.code) {
      await incrementOtpAttempts(otpRecord.id);
      return res.status(400).json({
        success: false,
        message: "invalid OTP",
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    await markOtpAsUsed(otpRecord.id);
    await updatePassword(hashedPassword, user.id);

    return res.status(200).json({
      success: true,
      message: "password reset successful",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const { id } = req.user;

    const user = await findUserById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    await deleteUser(id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }
    const tokenRecord = await findRefreshToken(token);
    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (tokenRecord.is_revoked) {
      return res.status(401).json({
        success: false,
        message: "Token revoked",
      });
    }
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);

    await revokeToken(tokenRecord.id);

    const newAccessToken = signAccessToken(decoded.id);
    const newRefreshToken = signRefreshToken(decoded.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await createToken(
      decoded.id,
      newRefreshToken,
      req.ip,
      req.headers["user-agent"],
      expiresAt,
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refeshed successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export {
  register,
  login,
  verifyEmail,
  resendOtp,
  logout,
  forgotPassword,
  resetPassword,
  deleteAccount,
  refreshToken,
};
