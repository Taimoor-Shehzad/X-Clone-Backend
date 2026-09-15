import express from "express";
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  syncUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

//public
router.get("/profile/:username", getUserProfile);

//authenticated
router.put("/profile", protectRoute, updateProfile);
router.post("/sync", syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.post("/follow/:targetUserId", protectRoute, followUser);

//temp
export const checkHealth = async (req, res) => {
  res.status(200).json({ message: "Checking is working" });
};
router.get("/check", checkHealth);

export default router;
