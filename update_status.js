const express = require("express");
const pool = require("./db_promise_asyncawait");

const router = express.Router();

/**
 * Endpoint untuk menerima / menolak laporan
 * Body: { report_id, status }
 * status bisa: 'diterima' atau 'ditolak'
 */
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

    if (result.affectedRows > 0) {
      res.json({ message: "Status laporan berhasil diperbarui" });
    } else {
      res.status(404).json({ error: "Laporan tidak ditemukan" });
    }
  } catch (err) {
    console.error("Error update status laporan:", err.message);
    res.status(500).json({ error: "Gagal update status laporan" });
  }
});

module.exports = router;
