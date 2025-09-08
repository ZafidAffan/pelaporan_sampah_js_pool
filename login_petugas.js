// routes/login_petugas.js
const express = require("express");
const pool = require("./db_promise_asyncawait");
const bcrypt = require("bcryptjs");
const router = express.Router();

// LOGIN PETUGAS
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    const [rows] = await pool.query(
      "SELECT petugas_id, name, email, phone, password, tugas_selesai, status_bertugas FROM petugas WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email tidak ditemukan" });
    }

    const petugas = rows[0];
    const validPassword = await bcrypt.compare(password, petugas.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Password salah" });
    }

    res.json({
      message: "Login berhasil",
      userId: petugas.petugas_id,
      displayName: petugas.name,
      email: petugas.email,
      phone: petugas.phone,
      tugas_selesai: petugas.tugas_selesai,
      status_bertugas: petugas.status_bertugas,
    });
  } catch (err) {
    console.error("❌ Error login petugas:", err);
    res.status(500).json({ error: "Gagal login petugas", detail: err.message });
  }
});

module.exports = router;
