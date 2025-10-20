// admin_laporan.js
const express = require("express");
const pool = require("./db_promise_asyncawait");
const router = express.Router();

router.get("/laporan", async (req, res) => {
  try {
    // Query dengan LEFT JOIN ke bukti_tugas
    const [rows] = await pool.query(`
      SELECT 
        r.report_id,
        r.user_id,
        r.description,
        r.img_url AS laporan_img,
        r.status,
        r.created_at,
        b.bukti_url AS bukti_img,
        b.keterangan,
        b.created_at AS bukti_created_at
      FROM reports r
      LEFT JOIN bukti_tugas b ON r.report_id = b.report_id
      ORDER BY r.report_id DESC
    `);

    console.log("✅ Data laporan berhasil diambil:", rows.length);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Error ambil laporan:", err);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data laporan admin",
      detail: err.message,
    });
  }
});

module.exports = router;
