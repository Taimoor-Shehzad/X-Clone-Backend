// import mongoose from "mongoose";
// import { ENV } from "./env.js";

// let isConnected = false;

// export const connectDB = async () => {
//   if (isConnected && mongoose.connection.readyState === 1) {
//     return;
//   }

//   try {
//     const db = await mongoose.connect(ENV.MONGO_URI);
//     isConnected = db.connections[0].readyState === 1;
//     console.log("DB connected successfully ✅");
//   } catch (error) {
//     console.error("Error connecting to MONGODB:", error.message);
//     throw error; // Throw error to be caught by request middleware instead of crashing the process
//   }
// };

import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("DB connect Succesfully ✅");
  } catch (error) {
    console.error("Error connecting to MONGODB");
    process.exit(1);
  }
};

db.js;
