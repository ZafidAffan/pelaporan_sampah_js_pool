// admin_laporan.js
const express = require("express");
const pool = require("./db_promise_asyncawait"); // koneksi mysql2/promise
const router = express.Router();

// GET /admin/laporan
router.get("/laporan", async (req, res) => {
  try {
    // Coba ambil semua data tanpa ORDER BY dulu
    const [rows] = await pool.query("SELECT * FROM reports");

    // Log ke server biar tau isi rows
    console.log("Hasil query reports:", rows);

    // Selalu return array
    res.json(rows);
  } catch (err) {
    console.error("Error ambil laporan:", err.message);
    console.error(err); // log detail error
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
