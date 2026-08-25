import { verifyToken } from "../utils/jwt.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);

    req.user = { id: decoded.id };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Ivalid token" });
  }
};

export { protect };
