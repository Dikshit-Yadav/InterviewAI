import { registerUser, loginUser } from "../services/authServices.js";

export const register = async (req, res) => {
  try {
    const data = await registerUser(
      req.body.name,
      req.body.email,
      req.body.password,
      req.body.targetRole
    );
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body.email, req.body.password);

    res.cookie("token", data.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json(data);

  } catch (err) {
    res.status(401).json({ message: err.message });
    // console.log(err.message)
  }
};

export const isme = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
        isauthenticate: false,
      });
    }
    res.status(200).json({ user: req.user, isauthenticate: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};