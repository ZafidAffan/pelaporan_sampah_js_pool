const express = require("express");
const multer = require("multer");
const db = require("./db");
const imgbbUploader = require("imgbb-uploader");

const router = express.Router();

// pakai memoryStorage
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), (req, res) => {
  try {
    const { user_id, description, latitude, longitude, address } = req.body;
    const imageFile = req.file;

    if (!user_id || !description || !latitude || !longitude || !address || !imageFile) {
      return res.status(400).json({ error: "Semua field wajib diisi termasuk image" });
    }

    console.log("📥 Request diterima:", { user_id, description, latitude, longitude, address });

    if (!process.env.IMGBB_API_KEY) {
      return res.status(500).json({ error: "IMGBB_API_KEY belum diatur di environment" });
    }

    // upload ke imgbb
    imgbbUploader({
      apiKey: process.env.IMGBB_API_KEY,
      base64string: imageFile.buffer.toString("base64"),
    })
      .then((response) => {
        console.log("✅ Upload ImgBB sukses:", response.url);

        const sql = `
          INSERT INTO reports (user_id, description, latitude, longitude, address, img_url, status, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;

        db.query(
          sql,
          [user_id, description, latitude, longitude, address, response.url],
          (err, result) => {
            if (err) {
              console.error("❌ DB Error:", err);
              return res.status(500).json({ error: "DB error", detail: err.message });
            }

            console.log("✅ Insert DB sukses:", result.insertId);

            res.status(200).json({
              success: true,
              message: "Laporan berhasil dikirim",
              report_id: result.insertId,
              image_url: response.url,
            });
          }
        );
      })
      .catch((err) => {
        console.error("❌ ImgBB Error:", err);
        res.status(500).json({ error: "Upload ImgBB gagal", detail: err.message });
      });
  } catch (err) {
    console.error("❌ Server crash:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

module.exports = router;
