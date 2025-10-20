// admin_laporan.js
const express = require("express");
const pool = require("./db_promise_asyncawait"); // koneksi mysql2/promise
const router = express.Router();

/**
 * GET /admin/laporan
 * Ambil semua laporan + bukti foto (jika ada)
 */
router.get("/laporan", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.report_id,
        r.user_id,
        r.description,
        r.image_url AS laporan_img,
        r.status,
        r.created_at,
        r.latitude,
        r.longitude,
        r.address,
        bt.bukti_url AS bukti_img,
        bt.keterangan AS bukti_keterangan,
        bt.created_at AS bukti_uploaded_at,
        r.status_final,
        r.verified_by,
        r.verified_at
      FROM reports r
      LEFT JOIN bukti_tugas bt ON r.report_id = bt.report_id
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("❌ Error ambil laporan admin:", err);
    res.status(500).json({ error: "Gagal mengambil data laporan admin" });
  }
});

/**
 * POST /admin/verify
 * Admin verifikasi laporan yang sudah selesai
 */
router.post("/verify", async (req, res) => {
  try {
    const { report_id, verified_by } = req.body;

    if (!report_id || !verified_by) {
      return res.status(400).json({
        error: "report_id dan verified_by wajib dikirim",
      });
    }

    // Update status_final & waktu verifikasi
    await pool.query(
      `UPDATE reports 
       SET status_final = 'terverifikasi',
           verified_by = ?,
           verified_at = NOW()
       WHERE report_id = ?`,
      [verified_by, report_id]
    );

    res.json({
      success: true,
      message: `Laporan #${report_id} berhasil diverifikasi oleh ${verified_by}`,
    });
  } catch (err) {
    console.error("❌ Gagal verifikasi laporan:", err);
    res.status(500).json({ error: "Gagal verifikasi laporan" });
  }
});

module.exports = router;
