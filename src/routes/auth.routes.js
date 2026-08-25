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
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify_email", verifyEmail);
router.post("/resend_email", resendEmail);
router.post("/logout", protect, logout);
router.post("/forgot_password", forgotPassword);
router.post("/reset_password", resetPassword);
router.post("/delete_account", protect, deleteAccount);

export default router;
