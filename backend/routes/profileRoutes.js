import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { profileBodySchema } from "../validation/schemas.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put(
  "/update",
  authMiddleware,
  validateRequest({ body: profileBodySchema }),
  updateProfile
);

export default router;
