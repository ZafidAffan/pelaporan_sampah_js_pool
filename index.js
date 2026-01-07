// index.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware JSON
app.use(express.json());

// Serve folder upload (gambar, dokumen, dsb.)
app.use('/upload', express.static('upload'));

// ================= ROUTES USER =================
app.use('/login', require('./login'));
app.use('/register', require('./register'));
app.use('/report', require('./report'));
app.use('/locations', require('./get_locations'));
app.use('/report-status', require('./get_report_status'));
app.use('/user', require('./get_user'));

// ================= ROUTES PETUGAS =================
app.use('/login_petugas', require('./login_petugas'));
app.use('/register-petugas', require('./register_petugas'));
app.use('/get-tugas', require('./get_tugas'));
app.use('/upload-bukti', require('./upload_bukti'));
app.use('/user-report', require('./user_report'));

// ================= ROUTES ADMIN =================
app.use('/admin', require('./admin_login'));
app.use('/admin', require('./admin_register'));
app.use('/admin', require('./admin_dashboard'));  
app.use('/admin', require('./admin_laporan'));
app.use('/admin', require('./admin_tugas'));

// ================= ROUTES ADMIN TAMBAHAN =================
app.use('/admin', require('./update_status'));
app.use('/admin', require('./assign_task'));
app.use('/admin', require('./confirm_done'));
app.use('/admin', require('./get_petugas'));

// Serve folder public untuk file statis HTML, CSS, JS
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
