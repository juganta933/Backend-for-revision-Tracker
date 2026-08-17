const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    problemLink: {
      type: String,
      required: true,
      trim: true,
    },

    platform: {
      type: String,
      default: "LeetCode",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
    },

    revisionCount: {
      type: Number,
      default: 0,
    },

    revisions: [
      {
        revisedAt: {
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

module.exports = mongoose.model("Problem", problemSchema);