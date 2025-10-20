// admin_tugas.js
const express = require("express");
const pool = require("./db_promise_asyncawait"); // koneksi mysql2/promise
const router = express.Router();

// ===== GET /admin/tugas =====
// Ambil semua tugas, join laporan & petugas agar lebih lengkap
router.get("/tugas", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.tugas_id, t.report_id, r.user_id, r.description, t.latitude, t.longitude, t.img_url,
             t.petugas_id, p.nama AS petugas_nama, t.status, t.assigned_at, t.completed_at,
             t.status_final, t.verified_by, t.verified_at
      FROM tugas t
      LEFT JOIN reports r ON t.report_id = r.report_id
      LEFT JOIN petugas p ON t.petugas_id = p.petugas_id
      ORDER BY t.assigned_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Gagal ambil tugas:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== POST /admin/confirm-tugas =====
// Konfirmasi selesai oleh admin
router.post("/confirm-tugas", async (req, res) => {
  try {
    const { tugas_id } = req.body;

    if (!tugas_id) {
      return res.status(400).json({ error: "tugas_id harus diisi" });
    }

    // Contoh: ambil admin_id dari session atau token
    // Misal hardcode dulu untuk testing:
    const admin_id = 1;

    // Update tugas: status_final jadi 'disetujui', isi verified_by & verified_at
    const [result] = await pool.query(
      `UPDATE tugas
       SET status_final = 'disetujui', verified_by = ?, verified_at = NOW()
       WHERE tugas_id = ?`,
      [admin_id, tugas_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tugas tidak ditemukan" });
    }

    res.json({ message: "Tugas berhasil dikonfirmasi selesai" });
  } catch (err) {
    console.error("❌ Gagal konfirmasi tugas:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
