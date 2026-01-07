const express = require('express');
const path = require('path');
const pool = require('./db'); // koneksi MySQL pakai db.js

const router = express.Router();

// ===== Middleware cek login admin =====
function isAdminLoggedIn(req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin_login.html'); 
  }
  next();
}

// ===== Route tampilkan HTML dashboard =====
router.get('/dashboard', isAdminLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
});

// ===== API untuk ambil data dashboard =====
router.get('/dashboard-data', isAdminLoggedIn, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    // Hitung laporan berdasarkan status
    const [pending] = await conn.query(
      "SELECT COUNT(*) AS count FROM reports WHERE status = 'pending'"
    );

    // Status 'diterima' masuk kategori 'Diproses'
    const [proses]  = await conn.query(
      "SELECT COUNT(*) AS count FROM reports WHERE status = 'diterima'"
    );

    const [selesai] = await conn.query(
      "SELECT COUNT(*) AS count FROM reports WHERE status = 'selesai'"
    );

    conn.release();

    res.json({
      success: true,
      pending: pending[0].count,
      proses: proses[0].count,
      selesai: selesai[0].count
    });
  } catch (err) {
    console.error('Error dashboard-data:', err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
