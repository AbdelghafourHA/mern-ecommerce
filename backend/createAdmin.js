import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/admin.model.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI);
const createAdmin = async () => {
  await Admin.create({
    username: "mounir",
    password: "123456789",
    role: "super-admin",
  });
  console.log("Admin created");
  mongoose.disconnect();
};

createAdmin();
