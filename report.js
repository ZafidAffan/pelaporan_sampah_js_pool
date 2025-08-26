import express from "express";
import multer from "multer";
import path from "path";
import db from "../config/db.js"; // koneksi db callback style
import imgbbUploader from "imgbb-uploader";

const router = express.Router();

// Konfigurasi multer (buat simpan file di tmp sebelum diupload ke ImgBB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Endpoint tambah report
router.post("/", upload.single("image"), (req, res) => {
  const { user_id, description, latitude, longitude, address } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: "Image is required" });
  }

  // Upload ke ImgBB
  imgbbUploader({
    apiKey: process.env.IMGBB_API_KEY,
    imagePath: imageFile.path,
  })
    .then((response) => {
      const imageUrl = response.url;

      const sql = `INSERT INTO reports 
        (user_id, description, image_url, status, latitude, longitude, address, created_at) 
        VALUES (?, ?, ?, 'pending', ?, ?, ?, NOW())`;

      db.query(
        sql,
        [user_id, description, imageUrl, latitude, longitude, address],
        (err, result) => {
          if (err) {
            console.error("DB Insert Error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({
            message: "Report berhasil ditambahkan",
            report_id: result.insertId,
            image_url: imageUrl,
          });
        }
      );
    })
    .catch((error) => {
      console.error("ImgBB Upload Error:", error);
      res.status(500).json({ error: "Upload image failed" });
    });
});

export default router;
