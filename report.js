const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('./db');
const bucket = require('./firebase');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const router = express.Router();

// Gunakan memori, karena kita tidak simpan ke disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  next();
});

router.post('/', upload.single('image'), async (req, res) => {
  const file = req.file;
  const { user_id, description, latitude, longitude, address } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'Gambar tidak ditemukan atau gagal diunggah' });
  }

  if (!user_id || !description || !latitude || !longitude || !address) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }

  try {
    const filename = Date.now() + '_' + file.originalname;
    const fileUpload = bucket.file(`uploads/${filename}`);
    const uuid = uuidv4();

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uuid
        }
      }
    });

    blobStream.end(file.buffer);

    blobStream.on('error', (err) => {
      return res.status(500).json({ error: 'Gagal mengunggah ke Firebase: ' + err.message });
    });

    blobStream.on('finish', () => {
      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${uuid}`;

      const status = 'pending';
      const created_at = new Date();

      const sql = `INSERT INTO reports 
        (user_id, description, img_url, latitude, longitude, address, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(sql, [user_id, description, downloadURL, latitude, longitude, address, status, created_at], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Gagal menyimpan laporan: ' + err.message });
        }

        res.json({ success: true, message: 'Laporan berhasil dikirim' });
      });
    });

  } catch (err) {
    return res.status(500).json({ error: 'Terjadi kesalahan: ' + err.message });
  }
});

module.exports = router;
