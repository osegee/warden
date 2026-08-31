const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Warden Authentication API",
    version: "1.0.0",
    description:
      "API documentation for the Warden authentication service. This service handles user registration, email verification, login, token refresh, password reset, and account deletion.",
  },
  servers: [
    {
      url: process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : "warden-production-de8d.up.railway.app", 
      description: "Railway production server",
    },
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "System",
      description: "Health and metadata endpoints",
    },
    {
      name: "Authentication",
      description: "User account and token management endpoints",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description: "Access token is stored in an HTTP-only cookie.",
      },
      refreshCookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
        description:
          "Refresh token stored in an HTTP-only cookie for token rotation.",
      },
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation successful" },
        },
        required: ["success", "message"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Something went wrong" },
        },
        required: ["success", "message"],
      },
      RegisterRequest: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { type: "string", example: "johndoe" },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "Password123",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "Password123",
          },
        },
      },
      VerifyEmailRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          otp: {
            type: "string",
            example: "123456",
            minLength: 6,
            maxLength: 6,
          },
        },
      },
      ResendEmailRequest: {
        type: "object",
        required: ["email", "purpose"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          purpose: { type: "string", example: "verify_email" },
        },
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["email", "otp", "newPassword"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          otp: {
            type: "string",
            example: "123456",
            minLength: 6,
            maxLength: 6,
          },
          newPassword: {
            type: "string",
            format: "password",
            example: "NewPassword123",
          },
        },
      },
      DeleteAccountRequest: {
        type: "object",
        required: ["password"],
        properties: {
          password: {
            type: "string",
            format: "password",
            example: "Password123",
          },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["System"],
        summary: "API metadata",
        description: "Returns some basic metadata about the Warden service.",
        responses: {
          200: {
            description: "API metadata",
            content: {
              "application/json": {
                example: {
                  name: "Warden",
                  description: "Authentication & Authorization API",
                  status: "active",
                  version: "1.0.0",
                },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        description:
          "Checks if the app is running and ready to accept requests.",
        responses: {
          200: {
            description: "Healthy service",
            content: {
              "application/json": {
                example: {
                  status: "ok",
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description:
          "Creates a new user and sends a 6-digit OTP to the supplied email address for verification.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: {
                  success: true,
                  message: "Registration successful, check your email for OTP",
                },
              },
            },
          },
          400: {
            description: "Validation or missing input error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "User already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in a user",
        description:
          "Checks the user credentials, verifies their email status, and issues access and refresh tokens as HTTP-only cookies.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: {
                  success: true,
                  message: "user login successful",
                },
              },
            },
          },
          401: {
            description: "Incorrect password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Email not verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "User does not exist",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/verify-email": {
      post: {
        tags: ["Authentication"],
        summary: "Verify a user email with OTP",
        description:
          "Verifies the email address using the OTP sent during registration.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyEmailRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Email verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: {
                  success: true,
                  message: "Email verification successful",
                },
              },
            },
          },
          400: {
            description: "Invalid, expired, or used OTP",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/resend-email": {
      post: {
        tags: ["Authentication"],
        summary: "Resend OTP",
        description:
          "Sends a fresh OTP for the requested purpose, such as email verification or password reset.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResendEmailRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OTP sent successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: {
                  success: true,
                  message: "OTP sent successfully",
                },
              },
            },
          },
          400: {
            description: "Invalid request or already verified user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out the current user",
        description:
          "Revokes the current refresh token and clears the access and refresh cookies from the client.",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: {
                  success: true,
                  message: "Logged out successfully",
                },
              },
            },
          },
          401: {
            description: "Access token missing or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Token not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Send password-reset OTP",
        description:
          "Sends a password reset OTP to the supplied email address.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset OTP sent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: {
                  success: true,
                  message: "OTP sent sucessfully",
                },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Reset a user's password",
        description:
          "Resets the password after validating the email and OTP provided by the user.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: {
                  success: true,
                  message: "password reset successful",
                },
              },
            },
          },
          400: {
            description: "Missing fields, invalid OTP, or expired OTP",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/delete-account": {
      delete: {
        tags: ["Authentication"],
        summary: "Delete the authenticated user account",
        description:
          "Deletes the current user account after validating their password and requires an access token cookie.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeleteAccountRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Account deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: {
                  success: true,
                  message: "Account deleted successfully",
                },
              },
            },
          },
          400: {
            description: "Password mismatch or user not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Access token missing or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/refresh-token": {
      post: {
        tags: ["Authentication"],
        summary: "Rotate refresh token",
        description:
          "Validates the current refresh token, invalidates it, and issues a new access token and refresh token pair in cookies.",
        security: [{ refreshCookieAuth: [] }],
        responses: {
          200: {
            description: "Tokens refreshed successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: {
                  success: true,
                  message: "Token refeshed successfully",
                },
              },
            },
          },
          401: {
            description: "Refresh token missing, invalid, revoked, or expired",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
