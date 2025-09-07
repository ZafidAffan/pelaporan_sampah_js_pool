// confirm_done.js
const express = require("express");
const multer = require("multer");
const pool = require("./db_promise_asyncawait");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/confirm-done", upload.single("image"), async (req, res) => {
  try {
    const { report_id, keterangan } = req.body;
    const imageFile = req.file;

    if (!report_id || !keterangan || !imageFile) {
      return res.status(400).json({ error: "report_id, keterangan, dan foto bukti wajib" });
    }

    // TODO: upload image ke ImgBB atau storage lain
    const bukti_url = "https://dummyimage.com/bukti.jpg"; // nanti ganti hasil upload

    // Insert bukti tugas
    await pool.query(
      "INSERT INTO bukti_tugas (report_id, keterangan, bukti_url, created_at) VALUES (?, ?, ?, NOW())",
      [report_id, keterangan, bukti_url]
    );

    // Update status di reports jadi selesai
    await pool.query(
      "UPDATE reports SET status = 'selesai' WHERE report_id = ?",
      [report_id]
    );

    res.json({ success: true, message: `Laporan #${report_id} sudah selesai` });
  } catch (err) {
    console.error("❌ Gagal konfirmasi selesai:", err);
    res.status(500).json({ error: "Gagal konfirmasi selesai" });
  }
});

module.exports = router;

