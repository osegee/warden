import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./src/config/db.js";
import authRouter from "./src/routes/auth.routes.js";

const app = express();

app.use(express.json());
process.env.NODE_ENV === "production"
  ? app.use(morgan("combined"))
  : app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
  })
  .catch((error) => console.error(error));
