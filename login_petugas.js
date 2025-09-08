// routes/login_petugas.js
const express = require("express");
const pool = require("./db_promise_asyncawait"); // koneksi MySQL pakai async/await
const bcrypt = require("bcryptjs"); // buat cek password hash
const router = express.Router();

// === LOGIN PETUGAS === sengaja say tambahkan /login-petugas nya disini bukan di index
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    // Cek apakah email petugas ada di database
    const [rows] = await pool.query(
      "SELECT petugas_id, name, email, phone, password, tugas_selesai, status_bertugas FROM petugas WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email tidak ditemukan" });
    }

    const petugas = rows[0];

    // Cocokkan password
    const validPassword = await bcrypt.compare(password, petugas.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Password salah" });
    }

    // Kirim response login berhasil
    res.json({
      message: "Login berhasil",
      petugasId: petugas.petugas_id,
      name: petugas.name,
      email: petugas.email,
      phone: petugas.phone,
      tugas_selesai: petugas.tugas_selesai,
      status_bertugas: petugas.status_bertugas, // 'sedang bertugas' / 'tidak bertugas'
    });
  } catch (err) {
    console.error("❌ Error login petugas:", err);
    res.status(500).json({
      error: "Gagal login petugas",
      detail: err.message, // kirim detail error untuk debugging
    });
  }
});

module.exports = router;
