import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "inactive",
    },

    userId: {
      type: String,
      required: true,
    },
    postType: {
      type: String,
      enum: ["post", "ad"],
      required: true,
    },

    media: {
      type: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      urls: {
        type: [String], // This allows for an array of URLs, which can be images or a single video
      },
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    reactions: [
      {
        userId: {
          type: String, // Clerk user ID
          required: true,
        },
        reactionType: {
          type: String,
          enum: ["like", "love", "wow", "haha", "sad", "angry"],
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        userId: {
          type: String, // Clerk user ID
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", postSchema); //users
