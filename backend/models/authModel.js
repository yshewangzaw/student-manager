const db = require("../config/db");

// FIND USER BY EMAIL (LOGIN)
exports.findUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

// CREATE USER
exports.createUser = (name, email, password, role, callback) => {
  const sql = `
    INSERT INTO users
    (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, email, password, role], callback);
};
