import { sendOtpEmail } from "../utils/email.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { hashPassword } from "../utils/hash.js";
import { createUser, findUserByEmail } from "../models/user.js";
import { createOtp } from "../models/otp.js";

const register = async (req, res) => {
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

    const password_hash = await hashPassword(password);

    const user = await createUser(username, email, password_hash);

    const otp = generateOtp();
    const otp_hash = hashOtp(otp);

    const new_otp = await createOtp(user.id, otp_hash, purpose, expires_at);

    await sendOtpEmail(email, otp);
    return res.status(201).json({
      success: true,
      message: "Registration successful, check your email for OTP",
    });
  } catch (error) {
    console.error(error);
  }
};

export { register };
