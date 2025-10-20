// routes/confirm_done.js
const express = require("express");
const multer = require("multer");
const pool = require("./db_promise_asyncawait");
const imgbbUploader = require("imgbb-uploader");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/*
📤 PETUGAS: Upload bukti penyelesaian tugas
*/
router.post("/confirm-done", upload.single("image"), async (req, res) => {
  try {
    const { report_id, keterangan } = req.body;
    const imageFile = req.file;

    if (!report_id || !keterangan || !imageFile) {
      return res
        .status(400)
        .json({ error: "report_id, keterangan, dan foto bukti wajib diisi" });
    }

    if (!process.env.IMGBB_API_KEY) {
      return res
        .status(500)
        .json({ error: "IMGBB_API_KEY belum diatur di environment" });
    }

    console.log("📤 Uploading to ImgBB...");
    const response = await imgbbUploader({
      apiKey: process.env.IMGBB_API_KEY,
      base64string: imageFile.buffer.toString("base64"),
    });

    const buktiUrl = response.url;
    console.log("✅ Upload sukses:", buktiUrl);

    // Simpan ke tabel bukti_tugas
    await pool.query(
      `INSERT INTO bukti_tugas (report_id, keterangan, bukti_url, created_at)
       VALUES (?, ?, ?, NOW())`,
      [report_id, keterangan, buktiUrl]
    );

    // Update status laporan jadi "selesai"
    await pool.query(
      `UPDATE reports SET status = 'selesai' WHERE report_id = ?`,
      [report_id]
    );

    res.json({
      success: true,
      message: `Bukti untuk laporan #${report_id} berhasil diupload.`,
      bukti_url: buktiUrl,
    });
  } catch (err) {
    console.error("❌ Gagal upload bukti:", err);
    res.status(500).json({ error: "Gagal upload bukti", detail: err.message });
  }
});

/*
👀 ADMIN: Lihat daftar bukti laporan
*/
router.get("/admin/bukti-list", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.bukti_id,
        b.report_id,
        b.keterangan,
        b.bukti_url,
        b.created_at,
        r.status AS report_status,
        r.address,
        r.user_id
      FROM bukti_tugas b
      JOIN reports r ON b.report_id = r.report_id
      ORDER BY b.created_at DESC
    `);

    res.json({ success: true, bukti: rows });
  } catch (err) {
    console.error("❌ Gagal ambil daftar bukti:", err);
    res.status(500).json({ error: "Gagal ambil daftar bukti", detail: err.message });
  }
});

/*
✅ ADMIN: Verifikasi bukti laporan
*/
router.post("/admin/verify-bukti", async (req, res) => {
  try {
    const { report_id, status_final, verified_by } = req.body;

    if (!report_id || !status_final) {
      return res
        .status(400)
        .json({ error: "report_id dan status_final wajib diisi" });
    }

    await pool.query(
      `UPDATE tugas 
       SET status_final = ?, verified_by = ?, verified_at = NOW()
       WHERE report_id = ?`,
      [status_final, verified_by || null, report_id]
    );

    res.json({
      success: true,
      message: `Laporan #${report_id} telah ${status_final}`,
    });
  } catch (err) {
    console.error("❌ Gagal verifikasi bukti:", err);
    res.status(500).json({ error: "Gagal verifikasi bukti", detail: err.message });
  }
});

module.exports = router;
