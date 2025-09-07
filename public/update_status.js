// update_status.js
const express = require("express");
const pool = require("./db_promise"); // pakai yang promise biar bisa async/await
const router = express.Router();

// POST /admin/update-status
router.post("/update-status", async (req, res) => {
  try {
    const { report_id, status } = req.body;

    if (!report_id || !status) {
      return res.status(400).json({ error: "report_id dan status wajib diisi" });
    }

    const [result] = await pool.query(
      "UPDATE reports SET status = ? WHERE report_id = ?",
      [status, report_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Laporan tidak ditemukan" });
    }

    res.json({ success: true, message: `Status laporan #${report_id} diubah menjadi ${status}` });
  } catch (err) {
    console.error("❌ Gagal update status:", err);
    res.status(500).json({ error: "Gagal update status laporan" });
  }
});

module.exports = router;
