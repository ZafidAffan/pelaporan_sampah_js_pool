const express = require("express");
const multer = require("multer");
const pool = require("./db_promise_asyncawait"); // pakai koneksi async/await
const imgbbUploader = require("imgbb-uploader");

const router = express.Router();

// pakai memory storage (supaya tidak simpan di server lokal)
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint upload bukti tugas
router.post("/", upload.single("bukti"), async (req, res) => {
  try {
    const { tugas_id } = req.body;
    const imageFile = req.file;

    // 🧩 Validasi input
    if (!tugas_id || !imageFile) {
      return res
        .status(400)
        .json({ error: "tugas_id dan file bukti wajib dikirim" });
    }

    if (!process.env.IMGBB_API_KEY) {
      return res
        .status(500)
        .json({ error: "IMGBB_API_KEY belum diatur di environment" });
    }

    console.log("📥 Upload bukti untuk tugas:", tugas_id);

    // 🔼 Upload ke ImgBB
    const response = await imgbbUploader({
      apiKey: process.env.IMGBB_API_KEY,
      base64string: imageFile.buffer.toString("base64"),
    });

    console.log("✅ Upload ImgBB sukses:", response.url);

    // 🗂️ Update tabel tugas
    const [updateResult] = await pool.query(
      `UPDATE tugas 
       SET img_url = ?, status = 'selesai', completed_at = NOW()
       WHERE tugas_id = ?`,
      [response.url, tugas_id]
    );

    console.log("✅ Update tugas sukses:", updateResult);

    res.json({
      success: true,
      message: "Bukti berhasil diupload dan status tugas diperbarui.",
      img_url: response.url,
    });
  } catch (err) {
    console.error("❌ Gagal upload bukti:", err);
    res.status(500).json({
      error: "Gagal upload bukti",
      detail: err.message,
    });
  }
});

module.exports = router;
