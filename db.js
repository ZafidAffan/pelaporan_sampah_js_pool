const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,     // misalnya: 'mysql-production-9020.up.railway.app'
  port: 3306,                    // ini penting kalo gak default (opsional gasih)
  user: process.env.DB_USER,     // root
  password: process.env.DB_PASS, // JHlxEzHlzdYVbtESyKfeZZDhcvkJbRfW
  database: process.env.DB_NAME  // railway
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

module.exports = db;
