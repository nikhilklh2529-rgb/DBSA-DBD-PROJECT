const dns = require("dns");

// Fix DNS issues with MongoDB Atlas
dns.setServers(["8.8.8.8"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// ===============================
// Import Routes
// ===============================
const booksRoutes = require("./routes/books");
const studentsRoutes = require("./routes/students");
const transactionsRoutes = require("./routes/transactions");

// ===============================
// Create Express App
// ===============================
const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// API Routes
// ===============================

// Books
app.use("/api/books", booksRoutes);

// Students
app.use("/api/students", studentsRoutes);

// Transactions
app.use("/api/transactions", transactionsRoutes);

// ===============================
// Home / Test Route
// ===============================
app.get("/", (req, res) => {
    res.json({
        message: "Library RFID Backend is running successfully!"
    });
});

// ===============================
// MongoDB Connection
// ===============================
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});