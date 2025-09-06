// admin_laporan.js
const express = require("express");
const pool = require("./db"); 
const router = express.Router();

// GET /admin/laporan
router.get("/laporan", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reports ORDER BY created_at DESC"
    );

    // pastikan selalu array, meskipun kosong atau hanya 1 baris
    res.json(rows);  
  } catch (err) {
    console.error("Error ambil laporan:", err);
    res.status(500).json({ error: "Gagal mengambil data laporan" });
  }
});

module.exports = router;
