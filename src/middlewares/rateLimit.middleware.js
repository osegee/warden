import rateLimit from "express-rate-limit";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, try again later",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { forwardedHeader: false },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests, try again later",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { forwardedHeader: false },
});

const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many requests, try again later",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { forwardedHeader: false },
});

export { globalLimiter, authLimiter, sensitiveLimiter };
