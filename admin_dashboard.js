const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const router = express.Router();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',   // sesuaikan
  database: 'pelaporan_sampah',
  socketPath: '/tmp/mysql.sock',
  port: 3306
});

// middleware cek login admin
function isAdminLoggedIn(req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.redirect('/admin_login.html'); 
  }
  next();
}

// route dashboard (kirim HTML)
router.get('/dashboard', isAdminLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
});

// API tambahan buat ambil data dashboard
router.get('/dashboard-data', isAdminLoggedIn, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [pending] = await conn.query("SELECT COUNT(*) AS count FROM reports WHERE status = 'pending'");
    const [proses]  = await conn.query("SELECT COUNT(*) AS count FROM reports WHERE status = 'proses'");
    const [selesai] = await conn.query("SELECT COUNT(*) AS count FROM reports WHERE status = 'selesai'");

    conn.release();

    res.json({
      success: true,
      pending: pending[0].count,
      proses: proses[0].count,
      selesai: selesai[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
