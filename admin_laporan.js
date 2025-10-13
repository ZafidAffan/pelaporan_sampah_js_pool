// admin_laporan.js
const express = require("express");
const pool = require("./db_promise_asyncawait"); // koneksi mysql2/promise
const router = express.Router();

// GET /admin/laporan
router.get("/laporan", async (req, res) => {
  try {
    // Ambil laporan + bukti_tugas (jika ada)
    const [rows] = await pool.query(`
      SELECT 
        r.*, 
        b.img_url AS bukti_img,
        b.tugas_id AS bukti_tugas_id,
        b.completed_at AS bukti_completed_at
      FROM reports r
      LEFT JOIN bukti_tugas b ON r.report_id = b.report_id
      ORDER BY r.created_at DESC
    `);

    console.log("✅ Hasil query laporan + bukti:", rows.length, "data");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error ambil laporan:", err.message);
    res.status(500).json({ error: "Gagal mengambil data laporan", detail: err.message });
  }
});

module.exports = router;
