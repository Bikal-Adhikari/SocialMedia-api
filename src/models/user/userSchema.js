import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "inactive",
    },

    role: {
      type: String,
      default: "user",
    },

    fName: {
      type: String,
      required: true,
      //    maxLength: [100, "stop spamming me"]
    },
    lName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      index: 1,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshJWT: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema); //users
