const express = require("express");
const pool = require("./db_promise_asyncawait");

const router = express.Router();

// Endpoint untuk menerima / menolak laporan
router.post("/update-status", async (req, res) => {
  try {
    const { report_id, status } = req.body;
    console.log("📥 Request diterima:", { report_id, status });

    if (!report_id || !status) {
      console.warn("⚠️ Data tidak lengkap:", { report_id, status });
      return res.status(400).json({ error: "report_id dan status wajib diisi" });
    }

    console.log("🔎 Menjalankan query update...");
    const [result] = await pool.query(
      "UPDATE reports SET status = ? WHERE report_id = ?",
      [status, report_id]
    );

    console.log("✅ Hasil query:", result);

    if (result.affectedRows > 0) {
      console.log(`🎉 Report ${report_id} berhasil diupdate ke status ${status}`);
      res.json({ message: "Status laporan berhasil diperbarui" });
    } else {
      console.warn(`⚠️ Report ${report_id} tidak ditemukan`);
      res.status(404).json({ error: "Laporan tidak ditemukan" });
    }
  } catch (err) {
    console.error("❌ Error update status laporan:", err); // full error detail
    res.status(500).json({
      error: "Gagal update status laporan",
      detail: err.message, // kirim juga detail biar keliatan di response
    });
  }
});

module.exports = router;
