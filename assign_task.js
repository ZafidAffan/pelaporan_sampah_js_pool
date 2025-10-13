// routes/assign_task.js
const express = require("express");
const pool = require("./db_promise_asyncawait");
const router = express.Router();

router.post("/assign-task", async (req, res) => {
  try {
    const { report_id, petugas_id } = req.body;

    // Log request body untuk debugging
    console.log("📥 Request body diterima:", req.body);

    // Validasi input
    if (!report_id || !petugas_id) {
      console.warn("⚠️ Data tidak lengkap:", { report_id, petugas_id });
      return res.status(400).json({ error: "report_id dan petugas_id wajib diisi" });
    }

    // Log query sebelum dijalankan
    console.log(`📝 Menjalankan query INSERT ke tabel tugas`);
    console.log(`INSERT INTO tugas (report_id, petugas_id, status, assigned_at) VALUES (${report_id}, ${petugas_id}, 'proses', NOW())`);

    // ✅ Insert ke tabel tugas
    const [insertResult] = await pool.query(
      "INSERT INTO tugas (report_id, petugas_id, status, assigned_at) VALUES (?, ?, 'proses', NOW())",
      [report_id, petugas_id]
    );

    console.log("✅ Hasil INSERT:", insertResult);

    // ✅ Update status laporan di tabel reports
    console.log(`📝 Update status report_id ${report_id} jadi 'proses'`);
    const [updateResult] = await pool.query(
      "UPDATE reports SET status = 'proses' WHERE report_id = ?",
      [report_id]
    );

    console.log("✅ Hasil UPDATE:", updateResult);

    res.json({
      success: true,
      message: `Laporan #${report_id} berhasil dikirim ke petugas #${petugas_id}`
    });

  } catch (err) {
    console.error("❌ Gagal assign task:", err);
    res.status(500).json({
      error: "Gagal assign task",
      detail: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
