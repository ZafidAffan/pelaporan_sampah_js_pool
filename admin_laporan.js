// admin_laporan.js
const express = require("express");
const pool = require("./db_promise_asyncawait");
const router = express.Router();

// === GET semua laporan (admin dashboard)
router.get("/laporan", async (req, res) => {
  try {
    console.log("📥 [ADMIN] Request GET /admin/laporan diterima");

    const [rows] = await pool.query(`
      SELECT 
        r.report_id,
        r.tugas_id AS report_tugas_id,
        r.img_url AS laporan_img,
        r.status AS laporan_status,
        r.latitude AS laporan_latitude,
        r.longitude AS laporan_longitude,
        r.created_at AS laporan_created,
        
        t.tugas_id AS tugas_id,
        t.img_url AS bukti_img,
        t.petugas_id,
        t.status AS tugas_status,
        t.status_final,
        t.verified_by,
        t.verified_at

      FROM reports r
      LEFT JOIN tugas t ON r.report_id = t.report_id
      ORDER BY r.report_id DESC
    `);

    console.log("✅ Data laporan berhasil diambil:", rows.length, "record(s)");

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Error ambil laporan admin:");
    console.error("📛 Pesan:", err.message);
    if (err.sqlMessage) console.error("📜 SQL Error:", err.sqlMessage);
    if (err.code) console.error("⚙️ Kode Error:", err.code);

    res.status(500).json({
      success: false,
      error: "Gagal euy  mengambil data laporan admin",
      detail: err.message,
    });
  }
});

// === Route test DB
router.get("/test-db", async (req, res) => {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    console.log("🗂️ Daftar tabel:", tables);
    res.json({ success: true, tables });
  } catch (err) {
    console.error("❌ Gagal koneksi DB:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
