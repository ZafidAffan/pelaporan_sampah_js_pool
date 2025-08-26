const express = require("express");
const multer = require("multer");
const db = require("./db"); // karena db.js sejajar dengan report.js
const imgbbUploader = require("imgbb-uploader");

const router = express.Router();

// pakai memoryStorage (supaya aman di Vercel, bukan simpan ke disk)
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), (req, res) => {
  const { user_id, description, latitude, longitude, address } = req.body;
  const imageFile = req.file;

  if (!user_id || !description || !latitude || !longitude || !address || !imageFile) {
    return res.status(400).json({ error: "Semua field wajib diisi termasuk image" });
  }

  // Upload ke ImgBB
  imgbbUploader({
    apiKey: process.env.IMGBB_API_KEY,
    base64string: imageFile.buffer.toString("base64"),
  })
    .then((response) => {
      const imageUrl = response.url;

      // Simpan ke DB pakai callback style dari db.js
      const sql = `
        INSERT INTO reports (user_id, description, latitude, longitude, address, img_url, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
      `;

      db.query(
        sql,
        [user_id, description, latitude, longitude, address, imageUrl],
        (err, result) => {
          if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ error: "Gagal simpan laporan", detail: err.message });
          }

          res.status(200).json({
            success: true,
            message: "Laporan berhasil dikirim",
            report_id: result.insertId,
            image_url: imageUrl,
          });
        }
      );
    })
    .catch((err) => {
      console.error("ImgBB error:", err);
      res.status(500).json({ error: "Gagal upload ke ImgBB", detail: err.message });
    });
});

module.exports = router;
