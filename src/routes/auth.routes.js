import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  resendEmail,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify_email", verifyEmail);
router.post("/resend_email", resendEmail);
router.post("/logout", logout);
router.post("/forgot_password", forgotPassword);
router.post("/reset_password", resetPassword);

export default router;
