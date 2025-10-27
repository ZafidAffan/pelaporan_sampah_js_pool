const express = require("express");
const multer = require("multer");
const db = require("./db");
const imgbbUploader = require("imgbb-uploader");

const router = express.Router();

// Gunakan memoryStorage untuk menyimpan file di memori sebelum upload
const upload = multer({ storage: multer.memoryStorage() });

/*
📤 Endpoint: Kirim laporan baru (dengan foto)
Body form-data:
- user_id
- description
- latitude
- longitude
- address
- image (file)
*/
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { user_id, description, latitude, longitude, address } = req.body;
    const imageFile = req.file;

    // Validasi field wajib
    if (!user_id || !description || !latitude || !longitude || !address || !imageFile) {
      return res.status(400).json({ error: "Semua field wajib diisi termasuk image" });
    }

    console.log("📥 Request diterima:", {
      user_id,
      description,
      latitude,
      longitude,
      address,
    });

    // Pastikan API key tersedia
    if (!process.env.IMGBB_API_KEY) {
      return res.status(500).json({ error: "IMGBB_API_KEY belum diatur di environment" });
    }

    console.log("🚀 Uploading ke ImgBB...");

    // Upload gambar ke ImgBB
    const response = await imgbbUploader({
      apiKey: process.env.IMGBB_API_KEY,
      base64string: imageFile.buffer.toString("base64"),
    });

    let imageUrl = response.url;

    // ✅ Perbaiki domain ImgBB agar bisa diakses tanpa error SSL
    if (imageUrl.includes("i.ibb.co/")) {
      imageUrl = imageUrl.replace("i.ibb.co/", "i.ibb.co.com/");
    }

    console.log("✅ Upload ImgBB sukses:", imageUrl);

    // Simpan laporan ke database
    const sql = `
      INSERT INTO reports 
      (user_id, description, latitude, longitude, address, img_url, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(
      sql,
      [user_id, description, latitude, longitude, address, imageUrl],
      (err, result) => {
        if (err) {
          console.error("❌ DB Error:", err);
          return res.status(500).json({ error: "Gagal menyimpan ke database", detail: err.message });
        }

        console.log("✅ Insert DB sukses. ID laporan:", result.insertId);

        res.status(200).json({
          success: true,
          message: "Laporan berhasil dikirim",
          report_id: result.insertId,
          image_url: imageUrl,
        });
      }
    );
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: "Terjadi kesalahan server", detail: err.message });
  }
});

module.exports = router;
