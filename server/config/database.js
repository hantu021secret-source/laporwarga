const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Memuat variabel lingkungan
dotenv.config();

// Konfigurasi opsi koneksi
const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Aktifkan SSL jika diperlukan oleh cloud database (misal TiDB Cloud, Aiven, Railway)
if (process.env.DB_SSL === 'true') {
    config.ssl = {
        rejectUnauthorized: false
    };
}

// Membuat koneksi pool ke database MySQL
const pool = mysql.createPool(config);

module.exports = pool;
