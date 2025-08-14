const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,     
  port: 31481,                    // ini penting kalo gak default (opsional gasih)
  user: process.env.DB_USER,     
  password: process.env.DB_PASS, 
  database: process.env.DB_NAME  
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

module.exports = db;
