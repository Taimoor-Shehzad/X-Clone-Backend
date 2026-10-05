import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { clerkClient, getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import cloudinary from "../config/cloudinary.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const updateData = { ...req.body };
  const profileImageFile = req.files?.profilePicture?.[0];
  const bannerImageFile = req.files?.bannerImage?.[0];

  if (profileImageFile) {
    try {
      const base64Image = `data:${profileImageFile.mimetype};base64,${profileImageFile.buffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "X-clone-userData",
        resource_type: "image",
        transformation: [{ quality: "auto" }, { format: "auto" }],
      });

      updateData.profilePicture = uploadResponse.secure_url;
    } catch (error) {
      console.log("Cloudinary upload error", error);
      return res.status(400).json({ message: "failed to upload image" });
    }
  }

  if (bannerImageFile) {
    try {
      const base64Image = `data:${bannerImageFile.mimetype};base64,${bannerImageFile.buffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "X-clone-userData",
        resource_type: "image",
        transformation: [{ quality: "auto" }, { format: "auto" }],
      });

      updateData.bannerImage = uploadResponse.secure_url;
    } catch (error) {
      console.log("Cloudinary upload error", error);
      return res.status(400).json({ message: "failed to upload image" });
    }
  }

  const user = await User.findOneAndUpdate({ clerkId: userId }, updateData, {
    new: true,
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const syncUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  // check if user already exists in mongodb
  const existingUser = await User.findOne({ clerkId: userId });
  if (existingUser) {
    return res
      .status(200)
      .json({ user: existingUser, message: "User already exists" });
  }

  // create new user from Clerk data
  const clerkUser = await clerkClient.users.getUser(userId);

  const userData = {
    clerkId: userId,
    email: clerkUser.emailAddresses[0].emailAddress,
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    username: clerkUser.emailAddresses[0].emailAddress.split("@")[0],
    profilePicture: clerkUser.imageUrl || "",
  };

  const user = await User.create(userData);

  res.status(201).json({ user, message: "User created successfully" });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const followUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { targetUserId } = req.params;

  // if required for later
  // if (currentUser._id.toString() === targetUser._id.toString()) {
  //   return res.status(400).json({ error: "You cannot follow yourself" });
  // }

  if (userId === targetUserId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  const currentUser = await User.findOne({ clerkId: userId });
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUser._id },
    });
  } else {
    await User.findByIdAndUpdate(currentUser._id, {
      // $addToSet
      $push: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      // $addToSet
      $push: { followers: currentUser._id },
    });

    await Notification.create({
      from: currentUser._id,
      to: targetUserId,
      type: "follow",
    });
  }

  res.status(200).json({
    message: isFollowing ? "unfollowed succesfully" : "Followed Succesfully",
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ users });
});
