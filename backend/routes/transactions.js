const express = require("express");
const mongoose = require("mongoose");

const Transaction = require("../models/Transaction");
const Book = require("../models/book");
const Student = require("../models/student");

const router = express.Router();

// ======================================
// GET ALL TRANSACTIONS
// ======================================
router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate("bookId")
            .populate("studentId")
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch transactions",
            error: error.message
        });
    }
});

// ======================================
// GET TRANSACTION BY ID
// ======================================
router.get("/:id", async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate("bookId")
            .populate("studentId");

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch transaction",
            error: error.message
        });
    }
});

// ======================================
// ISSUE BOOK
// ======================================
router.post("/issue", async (req, res) => {
    try {
        const { bookId, studentId } = req.body;

        // Check IDs
        if (
            !mongoose.Types.ObjectId.isValid(bookId) ||
            !mongoose.Types.ObjectId.isValid(studentId)
        ) {
            return res.status(400).json({
                message: "Invalid book ID or student ID"
            });
        }

        // Find book
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Check book availability
        if (book.status === "Issued") {
            return res.status(400).json({
                message: "Book is already issued"
            });
        }

        // Find student
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Update book
        book.status = "Issued";
        book.borrowerId = student._id;
        book.borrowerName = student.name;
        book.issuedAt = new Date();

        await book.save();

        // Update student
        student.issuedBooks = (student.issuedBooks || 0) + 1;

        await student.save();

        // Create transaction
        const transaction = new Transaction({
            bookId: book._id,
            studentId: student._id,
            bookTitle: book.title,
            studentName: student.name,
            rfidTag: book.rfidTag,
            action: "Issue",
            issueDate: new Date(),
            returnDate: null
        });

        await transaction.save();

        res.status(201).json({
            message: "Book issued successfully",
            book: book,
            student: student,
            transaction: transaction
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to issue book",
            error: error.message
        });
    }
});

// ======================================
// RETURN BOOK
// ======================================
router.post("/return", async (req, res) => {
    try {
        const { bookId } = req.body;

        // Check ID
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        // Find book
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Check whether book is issued
        if (book.status !== "Issued") {
            return res.status(400).json({
                message: "Book is already available"
            });
        }

        // Save borrower information before clearing it
        const studentId = book.borrowerId;
        const studentName = book.borrowerName;

        // Find student
        let student = null;

        if (studentId) {
            student = await Student.findById(studentId);
        }

        // Update book
        book.status = "Available";
        book.borrowerId = null;
        book.borrowerName = null;
        book.issuedAt = null;

        await book.save();

        // Update student
        if (student) {
            student.issuedBooks = Math.max(
                0,
                (student.issuedBooks || 0) - 1
            );

            await student.save();
        }

        // Create return transaction
        const transaction = new Transaction({
            bookId: book._id,
            studentId: student ? student._id : null,
            bookTitle: book.title,
            studentName: student ? student.name : (studentName || "Unknown"),
            rfidTag: book.rfidTag,
            action: "Return",
            issueDate: null,
            returnDate: new Date()
        });

        await transaction.save();

        res.status(201).json({
            message: "Book returned successfully",
            book: book,
            student: student,
            transaction: transaction
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to return book",
            error: error.message
        });
    }
});

// ======================================
// CREATE GENERAL TRANSACTION
// ======================================
router.post("/", async (req, res) => {
    try {
        const {
            bookId,
            studentId,
            bookTitle,
            studentName,
            rfidTag,
            action
        } = req.body;

        if (!["Issue", "Return"].includes(action)) {
            return res.status(400).json({
                message: "Action must be Issue or Return"
            });
        }

        const transaction = new Transaction({
            bookId,
            studentId,
            bookTitle,
            studentName,
            rfidTag,
            action,
            issueDate: action === "Issue" ? new Date() : null,
            returnDate: action === "Return" ? new Date() : null
        });

        const savedTransaction = await transaction.save();

        res.status(201).json(savedTransaction);

    } catch (error) {
        res.status(400).json({
            message: "Failed to create transaction",
            error: error.message
        });
    }
});

module.exports = router;