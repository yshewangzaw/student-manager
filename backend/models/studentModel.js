const db = require("../config/db");

// GET ALL
exports.getAllStudents = (callback) => {
  db.query("SELECT * FROM students", callback);
};

// CREATE
exports.createStudent = (data, callback) => {
  const sql = `
    INSERT INTO students 
    (full_name, age, gender, course, batch, email, phone, address, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.full_name,
    data.age,
    data.gender,
    data.course,
    data.batch,
    data.email,
    data.phone,
    data.address,
    data.status,
  ];

  db.query(sql, values, callback);
};

// UPDATE
exports.updateStudent = (id, data, callback) => {
  const sql = `
    UPDATE students 
    SET full_name=?, age=?, gender=?, course=?, batch=?, email=?, phone=?, address=?, status=?
    WHERE id=?
  `;

  const values = [
    data.full_name,
    data.age,
    data.gender,
    data.course,
    data.batch,
    data.email,
    data.phone,
    data.address,
    data.status,
    id,
  ];

  db.query(sql, values, callback);
};

// DELETE
exports.deleteStudent = (id, callback) => {
  db.query("DELETE FROM students WHERE id=?", [id], callback);
};
