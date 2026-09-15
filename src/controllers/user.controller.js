import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { clerkClient, getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOneAndUpdate({ clerkId: userId }, req.body, {
    new: true,
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const syncUser = asyncHandler(async (req, res) => {
  console.log("➡️ [syncUser] Incoming sync request");

  const { userId } = getAuth(req);

  if (!userId) {
    console.warn(
      "⚠️ [syncUser] Unauthorized: Missing userId from Clerk auth context",
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log(`🔍 [syncUser] Processing request for Clerk ID: ${userId}`);

  const existingUser = await User.findOne({ clerkId: userId });
  if (existingUser) {
    console.log(
      `✅ [syncUser] User already exists in database (MongoDB ID: ${existingUser._id})`,
    );
    return res
      .status(200)
      .json({ user: existingUser, message: "User already exists" });
  }

  console.log(
    `📡 [syncUser] User not found locally. Fetching details from Clerk API...`,
  );
  const clerkUser = await clerkClient.users.getUser(userId);

  const emailAddress =
    clerkUser.emailAddresses?.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    ) || clerkUser.emailAddresses?.[0];

  if (!emailAddress?.emailAddress) {
    console.error(
      `❌ [syncUser] User creation failed: No primary email found for Clerk ID ${userId}`,
    );
    return res.status(400).json({ error: "Clerk user has no email address" });
  }

  const email = emailAddress.emailAddress;
  const baseUsername = email.split("@")[0];
  const usernameTaken = await User.exists({
    username: baseUsername,
    clerkId: { $ne: userId },
  });

  const userData = {
    clerkId: userId,
    email,
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    username: usernameTaken
      ? `${baseUsername}_${userId.slice(-6)}`
      : baseUsername,
    profilePicture: clerkUser.imageUrl || "",
  };

  const user = await User.create(userData);
  console.log(
    `🎉 [syncUser] Successfully created new user in DB (Username: ${user.username}, DB ID: ${user._id})`,
  );

  res.status(201).json({ user, message: "User created succesfully" });
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

export const checkHealth = async (req, res) => {
  res.status(200).json({ message: "Checking is working" });
};
