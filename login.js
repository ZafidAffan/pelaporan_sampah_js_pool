// routes/login.js
const express = require("express");
const pool = require("./db_promise_asyncawait"); // koneksi MySQL pakai async/await
const bcrypt = require("bcryptjs");
const router = express.Router();

// Middleware CORS (kalau belum di-global di server.js)
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// === LOGIN USER ===
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    // Cek apakah email user ada di database
    const [rows] = await pool.query(
      "SELECT user_id, name, email, phone, password FROM user WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email tidak ditemukan" });
    }

    const user = rows[0];

    // Cocokkan password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Password salah" });
    }

    // Kirim response login berhasil
    res.json({
      message: "Login berhasil",
      userId: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } catch (err) {
    console.error("❌ Error login user:", err);
    res.status(500).json({
      error: "Gagal login user",
      detail: err.message,
    });
  }
});

module.exports = router;
