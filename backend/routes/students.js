const express = require("express");
const Student = require("../models/student");

const router = express.Router();

// GET all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch students",
            error: error.message
        });
    }
});

// GET student by ID
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch student",
            error: error.message
        });
    }
});

// ADD student
router.post("/", async (req, res) => {
    try {
        const { studentId, name, email, department, phone } = req.body;

        const student = new Student({
            studentId,
            name,
            email,
            department,
            phone
        });

        const savedStudent = await student.save();

        res.status(201).json(savedStudent);
    } catch (error) {
        res.status(400).json({
            message: "Failed to add student",
            error: error.message
        });
    }
});

// UPDATE student
router.put("/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(student);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update student",
            error: error.message
        });
    }
});

// DELETE student
router.delete("/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete student",
            error: error.message
        });
    }
});

module.exports = router;