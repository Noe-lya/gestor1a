import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowerCase: true,
    },
    password: {
      type: String,
      required: false, //pasar a true si no uso la Strategy de GitHub
    },
    age: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
  },
  {timestamps: true},
);

export const User = mongoose.model("User", userSchema);
