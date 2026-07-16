const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);

app.listen(3000, () => {
  console.log("Server running");
});
