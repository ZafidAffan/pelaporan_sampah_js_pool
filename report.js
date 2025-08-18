const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const db = require('./db'); // koneksi MySQL kamu

require('dotenv').config(); // supaya bisa baca .env di local

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }

    // baca file yang diupload
    const imageData = fs.readFileSync(req.file.path, { encoding: 'base64' });

    // kirim ke ImgBB
    const response = await axios.post(
      'https://api.imgbb.com/1/upload',
      null,
      {
        params: {
          key: process.env.IMGBB_API_KEY, // ambil dari Vercel env
          image: imageData,
        },
      }
    );

    // ambil URL gambar
    const imageUrl = response.data.data.url;

    // contoh simpan ke database MySQL
    const sql = 'INSERT INTO reports (image_url) VALUES (?)';
    db.query(sql, [imageUrl], (err, result) => {
      if (err) {
        console.error('Gagal simpan ke database:', err);
        return res.status(500).json({ error: 'Gagal simpan ke database' });
      }
      res.json({
        message: 'Upload berhasil',
        imageUrl,
        reportId: result.insertId,
      });
    });
  } catch (err) {
    console.error('Gagal mengunggah ke ImgBB:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Gagal mengunggah ke ImgBB',
      detail: err.response?.data || err.message,
    });
  }
});

app.listen(3000, () => console.log('Server berjalan di port 3000'));
