import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  resendEmail,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify_email", verifyEmail);
router.post("/resend_email", resendEmail);

export default router;
