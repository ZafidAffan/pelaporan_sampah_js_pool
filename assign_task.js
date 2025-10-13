// routes/assign_task.js
const express = require("express");
const pool = require("./db_promise_asyncawait");
const router = express.Router();

router.post("/assign-task", async (req, res) => {
  try {
    const { report_id, petugas_id } = req.body;

    // Validasi input
    if (!report_id || !petugas_id) {
      return res.status(400).json({ error: "report_id dan petugas_id wajib diisi" });
    }

    // ✅ Insert ke tabel tugas (bukan daftar_tugas)
    await pool.query(
      "INSERT INTO tugas (report_id, petugas_id, status, assigned_at) VALUES (?, ?, 'proses', NOW())",
      [report_id, petugas_id]
    );

    // ✅ Update status laporan di tabel reports
    await pool.query(
      "UPDATE reports SET status = 'proses' WHERE report_id = ?",
      [report_id]
    );

    res.json({
      success: true,
      message: `Laporan #${report_id} berhasil dikirim ke petugas #${petugas_id}`
    });

  } catch (err) {
    console.error("❌ Gagal assign task:", err);
    res.status(500).json({
      error: "Gagal assign task",
      detail: err.message
    });
  }
});

module.exports = router;
