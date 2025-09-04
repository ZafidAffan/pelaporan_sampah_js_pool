// admin_laporan.js
const express = require("express");
const pool = require("./db"); // koneksi mysql2/promise
const router = express.Router();

// GET /admin/laporan
router.get("/laporan", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error ambil laporan:", err);
    res.status(500).json({ error: "Gagal mengambil data laporan" });
  }
});

module.exports = router;
