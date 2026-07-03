const bcrypt = require("bcrypt");
const db = require("./db");

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10); // change this password!
  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Admin", "admin@example.com", hashedPassword, "admin"],
    (err, result) => {
      if (err) throw err;
      console.log("Admin created:", result.insertId);
      process.exit();
    },
  );
}

createAdmin();
