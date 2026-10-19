import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, targetRole } = req.body;

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { name, targetRole },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      targetRole: user.targetRole,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};