const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields required",
    });
  }

  // hash password

  const hashedPassword = await bcrypt.hash(password, 10);

  // create user

  authModel.createUser(
    name,
    email,
    hashedPassword,
    "student",
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json({
        message: "Student account created",
        userId: result.insertId,
      });
    },
  );
};
exports.login = (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN CONTROLLER STARTED");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  authModel.findUserByEmail(email, async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    if (!results || results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    console.log(req.user);

    res.json({
      message: "Login success",
      token,
      role: user.role,

      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  });
};
