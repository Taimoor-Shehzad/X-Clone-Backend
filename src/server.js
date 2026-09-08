import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

const app = express();

app.use(express.json());
app.use(clerkMiddleware());
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((err, req, res, next) => {
  console.log("Unhadled Error", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.get("/", (req, res) => res.send("Hello from server"));

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log("Server running on:", ENV.PORT);
    });
  } catch (error) {
    console.log("Error starting the server", error);
    process.exit(1);
  }
};

startServer();
