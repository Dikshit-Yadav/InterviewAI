import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/jwt.js";

export const registerUser = async (name, email, password, targetRole) => {

   if (!name || !email || !password || !targetRole) {
      return res.status(400).json({ message: "All fields required" });
    }

  const exists = await User.findOne({ email });
  if (exists) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
     name,
      email,
      password: hashed,
      targetRole,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    password: user.password,
    targetRole: user.targetRole,
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new Error("Invalid credentials");

  return {
    id: user._id,
    email: user.email,
    token: generateToken(user.email, user.targetRole),
  };
};