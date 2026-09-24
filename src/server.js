import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";
// import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";

const app = express();
app.set("trust proxy", true);

app.use(express.json());
app.use(clerkMiddleware());
app.use(cors());
// app.use(arcjetMiddleware());klk

const startServer = async () => {
  try {
    await connectDB();

    //config for vercel deployment and local server running
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => {
        console.log("Server running on:", ENV.PORT);
      });
    }
  } catch (error) {
    console.log("Error starting the server", error);
    process.exit(1);
  }
};

startServer();

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((err, req, res, next) => {
  console.log("Unhadled Error", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.get("/", (req, res) => res.send("Hello from server"));

// for vercel
export default app;
