import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {

  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const data = await User.findOne({ email: decoded.id })
    req.user = data;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export default authMiddleware;