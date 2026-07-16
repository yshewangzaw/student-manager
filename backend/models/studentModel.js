const db = require("../config/db");

// GET ALL
exports.getAllStudents = (callback) => {
  db.query("SELECT * FROM students", callback);
};

// CREATE
exports.createStudentWithUser = (data, callback) => {
  const sql = `
INSERT INTO students
(
user_id,
name,
age,
gender,
course,
batch,
email,
phone,
address,
status,
enrollment_date
)
VALUES (?,?,?,?,?,?,?,?,?,?,?)
`;

  const values = [
    data.user_id,
    data.name,
    data.age,
    data.gender,
    data.course,
    data.batch,
    data.email,
    data.phone,
    data.address,
    data.status,
    data.enrollment_date,
  ];

  db.query(sql, values, callback);
};
exports.updateStudent = (id, data, callback) => {
  const sql = `
    UPDATE students
    SET name = ?, age = ?, gender = ?, course = ?, batch = ?,
        email = ?, phone = ?, address = ?, status = ?, enrollment_date = ?
    WHERE id = ?
  `;

  const values = [
    data.name,
    data.age,
    data.gender,
    data.course,
    data.batch,
    data.email,
    data.phone,
    data.address,
    data.status,
    data.enrollment_date,
    id,
  ];

  db.query(sql, values, callback);
};

// DELETE
exports.deleteStudent = (id, callback) => {
  db.query("DELETE FROM students WHERE id=?", [id], callback);
};

// GET ONE
exports.getStudentById = (id, callback) => {
  db.query("SELECT * FROM students WHERE id = ?", [id], callback);
};
// GET STUDENT PROFILE BY USER ID
exports.getStudentByUserId = (userId, callback) => {
  const sql = `
    SELECT *
    FROM students
    WHERE user_id = ?
  `;

  db.query(sql, [userId], callback);
};
