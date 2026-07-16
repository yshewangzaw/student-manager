const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/checkRole");

// Anyone logged in can view students
router.get(
  "/",
  authMiddleware,
  authorize(["admin", "teacher"]),
  studentController.getAllStudents,
);

// Only admin creates students
router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  studentController.createStudent,
);

// Only admin updates students
router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  studentController.updateStudent,
);

// Only admin deletes students
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  studentController.deleteStudent,
);
router.get(
  "/profile",
  authMiddleware,
  authorize("student"),
  studentController.getMyProfile,
);

module.exports = router;
