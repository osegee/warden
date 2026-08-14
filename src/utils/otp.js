import crypto from "crypto";

// Generates a 6-digit numeric OTP as a string, e.g. "042817"
export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
