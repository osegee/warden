import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  resendEmail,
  logout,
  forgotPassword,
  resetPassword,
  deleteAccount,
  refreshToken,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-email", resendEmail);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/delete-account", protect, deleteAccount);
router.post("/refresh-token", refreshToken);

export default router;
