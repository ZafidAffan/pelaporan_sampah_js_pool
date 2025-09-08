// routes/register_petugas.js
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("./db_promise_asyncawait"); // koneksi MySQL pakai async/await
const router = express.Router();

// ✅ Endpoint register petugas
router.post("/register-petugas", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    // Cek email sudah terdaftar atau belum
    const [existing] = await pool.query(
      "SELECT petugas_id FROM petugas WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    const [result] = await pool.query(
      "INSERT INTO petugas (name, email, phone, password, tugas_selesai, status_bertugas) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone, hashedPassword, 0, "tidak bertugas"]
    );

    res.status(201).json({
      message: "Registrasi berhasil",
      petugasId: result.insertId,
      name: name,
      status_bertugas: "tidak bertugas",
    });
  } catch (err) {
    console.error("❌ Error register petugas:", err);
    res.status(500).json({
      error: "Gagal registrasi petugas",
      detail: err.message, // kirim detail error agar mudah debugging
    });
  }
});

module.exports = router;
