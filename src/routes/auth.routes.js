import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  resendOtp,
  logout,
  forgotPassword,
  resetPassword,
  deleteAccount,
  refreshToken,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  authLimiter,
  sensitiveLimiter,
} from "../middlewares/rateLimit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  verifyEmailSchema,
  resendOtpSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  deleteAccountSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.use(authLimiter);

router.post("/register", sensitiveLimiter, validate(registerSchema), register);
router.post("/login", sensitiveLimiter, validate(loginSchema), login);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/resend-email", validate(resendOtpSchema), resendOtp);
router.post("/logout", protect, logout);
router.post(
  "/forgot-password",
  sensitiveLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.delete(
  "/delete-account",
  validate(deleteAccountSchema),
  protect,
  deleteAccount,
);
router.post("/refresh-token", refreshToken);

export default router;
