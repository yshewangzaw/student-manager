const authModel = require("../models/authModel");
const bcrypt = require("bcrypt");
const studentModel = require("../models/studentModel");

// GET
exports.getAllStudents = (req, res) => {
  studentModel.getAllStudents((err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};
exports.getMyProfile = (req, res) => {
  const userId = req.user.id;

  studentModel.getStudentByUserId(userId, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    res.json(results[0]);
  });
};

// CREATE
exports.createStudent = async (req, res) => {
  const {
    name,
    email,

    age,
    gender,
    course,
    batch,
    phone,
    address,
    status,
    enrollment_date,
  } = req.body;

  if (!name || !email || !gender) {
    return res.status(400).json({
      message: "Name, email  and gender are required",
    });
  }

  const generatedPassword = name.split(" ")[0] + "@123";

  try {
    // 1. Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // 2. Create user account
    authModel.createUser(
      name,
      email,
      hashedPassword,
      "student",
      (err, userResult) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }

        // New user id
        const userId = userResult.insertId;

        // 3. Create student profile
        const studentData = {
          user_id: userId,
          name,
          age,
          gender,
          course,
          batch,
          email,
          phone,
          address,
          status,
          enrollment_date,
        };

        studentModel.createStudentWithUser(
          studentData,
          (err, studentResult) => {
            if (err) {
              return res.status(500).json({
                message: err.message,
              });
            }

            // 4. Return created student
            studentModel.getStudentById(studentResult.insertId, (err, rows) => {
              if (err) {
                return res.status(500).json({
                  message: err.message,
                });
              }

              res.json({
                student: rows[0],
                login: {
                  email: email,
                  password: generatedPassword,
                },
              });
            });
          },
        );
      },
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE
exports.updateStudent = (req, res) => {
  studentModel.updateStudent(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    studentModel.getStudentById(req.params.id, (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows[0]);
    });
  });
};

// DELETE
exports.deleteStudent = (req, res) => {
  studentModel.deleteStudent(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Student deleted", result });
  });
};
