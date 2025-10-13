// admin_laporan.js
const express = require("express");
const pool = require("./db_promise_asyncawait"); // koneksi mysql2/promise
const router = express.Router();

// ========================
// GET /admin/laporan
// Endpoint untuk mengambil semua data laporan,
// termasuk bukti tugas (jika sudah ada)
// ========================
router.get("/laporan", async (req, res) => {
  try {
    // 🔍 Query untuk mengambil data laporan beserta bukti_tugas-nya
    // Menggunakan LEFT JOIN agar semua laporan tetap tampil
    // meskipun belum punya data di tabel bukti_tugas
    const [rows] = await pool.query(`
      SELECT 
        r.*,                                  -- semua kolom dari tabel reports
        b.img_url AS bukti_img,               -- ambil URL bukti dari tabel bukti_tugas
        b.tugas_id AS bukti_tugas_id,         -- ambil ID tugas dari tabel bukti_tugas
        b.completed_at AS bukti_completed_at  -- ambil waktu penyelesaian tugas
      FROM reports r
      LEFT JOIN bukti_tugas b ON r.report_id = b.report_id  -- JOIN antar tabel
      ORDER BY r.created_at DESC                           -- urutkan dari yang terbaru
    `);

    // 🧠 Log hasil ke terminal agar mudah debugging
    console.log("✅ Hasil query laporan + bukti:", rows.length, "data");

    // Kirim data ke frontend dalam format JSON
    res.json(rows);
  } catch (err) {
    // 🚨 Tangani error jika query gagal
    console.error("❌ Error ambil laporan:", err.message);
    res.status(500).json({
      error: "Gagal mengambil data laporan",
      detail: err.message,
    });
  }
});

// Ekspor router supaya bisa dipakai di file index.js utama
module.exports = router;
