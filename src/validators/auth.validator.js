import { z } from "zod";

const errors = {
  username: {
    required: "Username is required",
    min: "Username must be at least 3 characters",
    max: "Username cannot exceed 50 characters",
  },
  email: {
    required: "Email is required",
    invalid: "Please enter a valid email address",
  },
  password: {
    required: "Password is required",
    min: "Password must be at least 8 characters",
  },
  otp: {
    required: "OTP is required",
    length: "OTP must be exactly 6 digits",
  },
  purpose: {
    required: "Purpose is required",
  },
};

const emailField = z
  .string({ required_error: errors.email.required })
  .email(errors.email.invalid);

const passwordField = z
  .string({ required_error: errors.password.required })
  .min(8, errors.password.min);

const otpField = z
  .string({ required_error: errors.otp.required })
  .length(6, errors.otp.min);

const registerSchema = z.object({
  username: z
    .string({ required_error: errors.username.required })
    .min(3, errors.username.min)
    .max(50, errors.username.max),
  email: emailField,
  password: passwordField,
});

const loginSchema = z.object({
  email: emailField,
  password: z.string({ required_error: errors.password.required }),
});

const verifyEmailSchema = z.object({
  email: emailField,
  otp: otpField,
});

const resendOtpSchema = z.object({
  email: emailField,
  purpose: z.string({ required_error: errors.purpose.required }),
});

const forgotPasswordSchema = z.object({
  email: emailField,
});

const resetPasswordSchema = z.object({
  email: emailField,
  otp: otpField,
  newPassword: z
    .string({ required_error: errors.password.required })
    .min(8, "New password must be at least 8 characters"),
});

const deleteAccountSchema = z.object({
  password: z.string({ required_error: errors.password.required }),
});

export {
  loginSchema,
  verifyEmailSchema,
  resendOtpSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  deleteAccountSchema,
};
