require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("./config/db");
const { verifyToken, verifyAdmin } = require("./authMiddleware");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("SERVER IS WORKING");
});

// STUDENT ROUTES
app.use("/api/students", studentRoutes);

// LOGIN ROUTE
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = results[0];

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      res.json({
        message: "Login successful",
        token,
        role: user.role,
      });
    },
  );
});

// PROTECTED DASHBOARD
app.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
  res.json({
    message: `Welcome to the dashboard, ${req.user.email}!`,
  });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
