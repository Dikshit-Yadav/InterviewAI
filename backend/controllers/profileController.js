import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, targetRole } = req.body;

    const user = await User.findOneAndUpdate(
      {email:userId},
      { name, targetRole },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};