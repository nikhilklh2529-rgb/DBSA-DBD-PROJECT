const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: String,
            required: true,
            trim: true
        },

        isbn: {
            type: String,
            unique: true,
            sparse: true
        },

        category: {
            type: String,
            default: "General"
        },

        rfidTag: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Available", "Issued"],
            default: "Available"
        },

        borrowerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            default: null
        },

        borrowerName: {
            type: String,
            default: null
        },

        issuedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Book", bookSchema);