const studentModel = require("../models/studentModel");

// GET
exports.getStudents = (req, res) => {
  studentModel.getAllStudents((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// CREATE
exports.createStudent = (req, res) => {
  studentModel.createStudent(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Student created", result });
  });
};

// UPDATE
exports.updateStudent = (req, res) => {
  studentModel.updateStudent(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Student updated", result });
  });
};

// DELETE
exports.deleteStudent = (req, res) => {
  studentModel.deleteStudent(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Student deleted", result });
  });
};
