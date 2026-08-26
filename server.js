import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db.js";
import authRouter from "./src/routes/auth.routes.js";
import { globalLimiter } from "./src/middlewares/rateLimit.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
process.env.NODE_ENV === "production"
  ? app.use(morgan("combined"))
  : app.use(morgan("dev"));

app.use(globalLimiter);
app.get("/", (req, res) => {
  res.json({
    name: "Warden",
    description: "Authentication & Authorization API",
    status: "active",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/v1/auth", authRouter);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
  })
  .catch((error) => console.error(error));
