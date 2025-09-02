const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const path = require('path');

const router = express.Router();

// Session middleware (taruh di index.js juga, biar global)
router.use(session({
  secret: 'secret-key', // ganti dengan secret kuat
  resave: false,
  saveUninitialized: false
}));

// koneksi db
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',          // isi sesuai
  database: 'pelaporan_sampah',
  socketPath: '/tmp/mysql.sock', // sama seperti PHP kamu
  port: 3306
});

// middleware cek login
function isAdminLoggedIn(req, res, next) {
  if (!req.session.admin_id) {
    return res.redirect('/admin/login');
  }
  next();
}

// route dashboard
router.get('/dashboard', isAdminLoggedIn, async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const [pending] = await conn.query("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'");
    const [proses]  = await conn.query("SELECT COUNT(*) as count FROM reports WHERE status = 'proses'");
    const [selesai] = await conn.query("SELECT COUNT(*) as count FROM reports WHERE status = 'selesai'");

    conn.release();

    const adminName = req.session.admin_name || 'Admin';

    // kirim HTML (langsung inline, mirip PHP kamu)
    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Dashboard Admin</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          :root { --green:#347433; --yellow:#f0ad4e; --blue:#5bc0de; --success:#5cb85c; --background:#F5F0CD; }
          body { margin:0; font-family:'Segoe UI',sans-serif; background-color:var(--background); }
          nav { background-color:var(--green); display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-bottom-left-radius:12px; border-bottom-right-radius:12px; }
          nav a { color:white; text-decoration:none; font-weight:bold; padding:10px 16px; border-radius:8px; }
          nav a:hover, nav a.active { background-color:#285f28; }
          .logout-btn { background-color:#b72e2e; padding:8px 14px; border-radius:8px; }
          .welcome { color:white; font-weight:bold; display:flex; align-items:center; gap:8px; }
          .container { padding:40px 20px; display:flex; flex-direction:column; align-items:center; gap:30px; }
          h1 { color:var(--green); font-size:28px; display:flex; align-items:center; gap:12px; }
          .cards { display:flex; justify-content:center; gap:30px; flex-wrap:wrap; }
          .card { background:white; padding:30px 24px; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.1); text-align:center; width:240px; transition:transform 0.2s ease; }
          .card:hover { transform:translateY(-4px); }
          .card i { font-size:48px; margin-bottom:15px; }
          .card h2 { margin:0; font-size:36px; color:var(--green); }
          .card p { margin-top:12px; font-weight:bold; font-size:16px; }
          .pending { color:var(--yellow); }
          .proses { color:var(--blue); }
          .selesai { color:var(--success); }
          .chart-container { background:white; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.1); padding:24px; margin-top:40px; width:90%; max-width:500px; }
          .chart-container h3 { text-align:center; color:var(--green); margin-bottom:20px; }
        </style>
      </head>
      <body>
        <nav>
          <div class="nav-links">
            <a href="/admin/dashboard" class="active"><i class="fas fa-chart-pie"></i> Dashboard</a>
            <a href="/admin/laporan"><i class="fas fa-list"></i> Daftar Laporan</a>
            <a href="/admin/riwayat"><i class="fas fa-clock-rotate-left"></i> Riwayat</a>
            <a href="/admin/peta"><i class="fas fa-map-location-dot"></i> Peta</a>
          </div>
          <div class="nav-links">
            <span class="welcome"><i class="fas fa-user-shield"></i> ${adminName}</span>
            <a href="/admin/logout" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </nav>

        <div class="container">
          <h1><i class="fas fa-house-user"></i> Selamat Datang, ${adminName}!</h1>
          <div class="cards">
            <div class="card pending"><i class="fas fa-envelope-open-text"></i><h2>${pending[0].count}</h2><p>Di Laporkan</p></div>
            <div class="card proses"><i class="fas fa-spinner fa-spin"></i><h2>${proses[0].count}</h2><p>Di Proses</p></div>
            <div class="card selesai"><i class="fas fa-check-circle"></i><h2>${selesai[0].count}</h2><p>Selesai</p></div>
          </div>
          <div class="chart-container">
            <h3><i class="fas fa-chart-pie"></i> Diagram Status Laporan</h3>
            <canvas id="statusChart"></canvas>
          </div>
        </div>

        <script>
          const ctx = document.getElementById('statusChart').getContext('2d');
          new Chart(ctx, {
            type: 'pie',
            data: {
              labels: ['Di Laporkan', 'Di Proses', 'Selesai'],
              datasets: [{
                data: [${pending[0].count}, ${proses[0].count}, ${selesai[0].count}],
                backgroundColor: ['#f0ad4e', '#5bc0de', '#5cb85c']
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { position: 'bottom', labels: { font: { size: 14 }}}}
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan server");
  }
});

module.exports = router;
