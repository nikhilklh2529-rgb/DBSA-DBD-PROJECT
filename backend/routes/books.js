const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/book");

const router = express.Router();

// GET all books
router.get("/", async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });

        res.json(books);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch books",
            error: error.message
        });
    }
});

// GET single book
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch book",
            error: error.message
        });
    }
});

// ADD new book
router.post("/", async (req, res) => {
    try {
        const {
            title,
            author,
            isbn,
            category,
            rfidTag
        } = req.body;

        if (!title || !author || !rfidTag) {
            return res.status(400).json({
                message: "Title, author and RFID tag are required"
            });
        }

        const existingRFID = await Book.findOne({ rfidTag });

        if (existingRFID) {
            return res.status(400).json({
                message: "RFID tag already exists"
            });
        }

        const book = new Book({
            title,
            author,
            isbn,
            category,
            rfidTag
        });

        const savedBook = await book.save();

        res.status(201).json(savedBook);
    } catch (error) {
        res.status(500).json({
            message: "Failed to add book",
            error: error.message
        });
    }
});

// UPDATE book
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update book",
            error: error.message
        });
    }
});

// DELETE book
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json({
            message: "Book deleted successfully",
            book
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete book",
            error: error.message
        });
    }
});

// FIND BOOK BY RFID
router.get("/rfid/:rfidTag", async (req, res) => {
    try {
        const book = await Book.findOne({
            rfidTag: req.params.rfidTag
        });

        if (!book) {
            return res.status(404).json({
                message: "No book found with this RFID tag"
            });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({
            message: "RFID search failed",
            error: error.message
        });
    }
});

module.exports = router;