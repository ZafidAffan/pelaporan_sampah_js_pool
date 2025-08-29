// routes/admin_register.js
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("./db"); // pakai db.js kamu

const router = express.Router();

// Register Admin
router.post("/", (req, res) => {
  const { name, email, password, confirm } = req.body;

  // Validasi input
  if (!name || !email || !password || !confirm) {
    return res.status(400).json({ success: false, message: "Semua kolom wajib diisi." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Format email tidak valid." });
  }

  if (password !== confirm) {
    return res.status(400).json({ success: false, message: "Konfirmasi password tidak cocok." });
  }

  // Cek apakah email sudah dipakai
  pool.query("SELECT admin_id FROM admin WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar." });
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan admin baru
      pool.query(
        "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("DB insert error:", err);
            return res.status(500).json({ success: false, message: "Gagal menyimpan data." });
          }

          return res.status(201).json({
            success: true,
            message: "Pendaftaran berhasil. Silakan login.",
            adminId: result.insertId,
          });
        }
      );
    } catch (error) {
      console.error("Hash error:", error);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
  });
});

module.exports = router;
