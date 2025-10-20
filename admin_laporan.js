// admin_laporan.js
const express = require("express");
const pool = require("./db_promise_asyncawait");
const router = express.Router();

router.get("/laporan", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.report_id,
        r.user_id,
        r.description,
        r.img_url AS laporan_img,
        r.status,
        r.created_at,
        t.img_url AS bukti_img,
        t.status_final,
        t.verified_by
      FROM reports r
      LEFT JOIN tugas t ON r.report_id = t.report_id
      ORDER BY r.report_id DESC
    `);

    console.log("✅ Data laporan berhasil diambil:", rows.length);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Error ambil laporan:", err); // tampilkan log lengkap di console
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data laporan admin",
      detail: err.message, // tampilkan pesan error asli dari MySQL
    });
  }
});

module.exports = router;
