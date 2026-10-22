const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Memuat environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Mengizinkan request dari frontend
app.use(express.json()); // Parsing JSON dari request body
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Menyajikan folder uploads secara statis

// Rute
const authRoutes = require('./routes/authRoutes');
const pengaduanRoutes = require('./routes/pengaduanRoutes');
const adminRoutes = require('./routes/adminRoutes');
const petugasRoutes = require('./routes/petugasRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pengaduan', pengaduanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/petugas', petugasRoutes);

// Endpoint dasar
app.get('/', (req, res) => {
    res.json({ message: 'Selamat datang di API LaporWarga' });
});

// Endpoint status kesehatan database
app.get('/api/health', async (req, res) => {
    try {
        const db = require('./config/database');
        const [dbs] = await db.execute('SHOW DATABASES');
        const [currentDb] = await db.execute('SELECT DATABASE() as current_db');
        const [tables] = await db.execute('SHOW TABLES');
        res.json({ 
            status: 'ok', 
            database: 'connected', 
            current_db: currentDb[0]?.current_db,
            all_databases: dbs.map(d => Object.values(d)[0]),
            tables: tables.map(t => Object.values(t)[0]) 
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'error', 
            message: err.message, 
            code: err.code 
        });
    }
});

// Port server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server berjalan di port ${PORT}`);
    });
}

module.exports = app;
