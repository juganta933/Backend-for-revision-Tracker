const mongoose = require("mongoose");

const revisionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },

        revisedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Revision", revisionSchema);