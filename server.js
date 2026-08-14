import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import AuthRoutes from "./src/routes/auth.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/auth", AuthRoutes);
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
