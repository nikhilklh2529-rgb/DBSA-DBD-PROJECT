const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true
        },

        studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: false,
    default: null
},

        bookTitle: {
            type: String,
            required: true
        },

        studentName: {
            type: String,
            required: true
        },

        rfidTag: {
            type: String,
            required: true
        },

        action: {
            type: String,
            enum: ["Issue", "Return"],
            required: true
        },

        issueDate: {
            type: Date,
            default: null
        },

        returnDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);