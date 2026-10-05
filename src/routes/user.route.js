import express from "express";
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  getUsers,
  syncUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

//public
router.get("/profile/:username", getUserProfile);

router.put(
  "/profile",
  protectRoute,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  updateProfile,
);

router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.post("/follow/:targetUserId", protectRoute, followUser);
router.get("/", protectRoute, getUsers);

export default router;
