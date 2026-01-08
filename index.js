// index.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// ================= MIDDLEWARE =================
// Parsing JSON
app.use(express.json());

// Serve folder upload (gambar, dokumen, dsb.)
app.use('/upload', express.static('upload'));

// Serve folder public untuk HTML, CSS, JS
app.use(express.static(path.join(__dirname, 'public')));

// ================= ROUTES USER =================
app.use('/login', require('./login'));
app.use('/register', require('./register'));
app.use('/report', require('./report'));
app.use('/locations', require('./get_locations')); // endpoint lokasi untuk peta
app.use('/report-status', require('./get_report_status'));
app.use('/user', require('./get_user'));

// ================= ROUTES PETUGAS =================
app.use('/login_petugas', require('./login_petugas'));
app.use('/register-petugas', require('./register_petugas'));
app.use('/get-tugas', require('./get_tugas'));
app.use('/upload-bukti', require('./upload_bukti'));
app.use('/user-report', require('./user_report'));

// ================= ROUTES ADMIN =================
// Login & Register Admin
app.use('/admin/login', require('./admin_login'));
app.use('/admin/register', require('./admin_register'));

// Dashboard, laporan, tugas
app.use('/admin/dashboard', require('./admin_dashboard'));
app.use('/admin/laporan', require('./admin_laporan'));
app.use('/admin/tugas', require('./admin_tugas'));

// ================= ROUTES ADMIN TAMBAHAN =================
// Update status, assign task, confirm done
app.use('/admin/update-status', require('./update_status'));
app.use('/admin/assign-task', require('./assign_task'));
app.use('/admin/confirm-done', require('./confirm_done'));

// Ambil data petugas
app.use('/admin/get-petugas', require('./get_petugas'));

// ================= ROUTE STATUS TUGAS PETUGAS =================
app.use('/', require('./tugas_status'));

// ================= ROUTE KHUSUS ADMIN HTML =================
app.get('/admin/peta', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_peta.html'));
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
