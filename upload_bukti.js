// routes/upload_bukti.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("./db_promise_asyncawait");

const router = express.Router();

// Konfigurasi folder upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/bukti"); // Folder tempat menyimpan bukti
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "bukti-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Endpoint upload bukti tugas
router.post("/upload-bukti", upload.single("bukti"), async (req, res) => {
  try {
    const { tugas_id } = req.body;

    console.log("📥 Body diterima:", req.body);
    console.log("🖼️ File diterima:", req.file);

    // Validasi input
    if (!tugas_id || !req.file) {
      return res
        .status(400)
        .json({ error: "tugas_id dan file bukti wajib dikirim" });
    }

    // Buat URL untuk gambar yang diupload
    const imgUrl = `${req.protocol}://${req.get("host")}/upload/bukti/${req.file.filename}`;

    // Update tabel tugas
    const [updateResult] = await pool.query(
      `UPDATE tugas 
       SET img_url = ?, status = 'selesai', completed_at = NOW()
       WHERE tugas_id = ?`,
      [imgUrl, tugas_id]
    );

    console.log("✅ Update tugas berhasil:", updateResult);

    res.json({
      success: true,
      message: "Bukti berhasil diupload dan status tugas diperbarui.",
      img_url: imgUrl,
    });
  } catch (err) {
    console.error("❌ Gagal upload bukti:", err);
    res.status(500).json({ error: "Gagal upload bukti", detail: err.message });
  }
});

module.exports = router;
