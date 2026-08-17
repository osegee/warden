import crypto from "crypto";

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export { generateOtp, hashOtp };
