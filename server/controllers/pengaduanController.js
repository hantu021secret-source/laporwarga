const db = require('../config/database');

const pengaduanController = {
    // Membuat pengaduan baru
    createPengaduan: async (req, res) => {
        try {
            const { kategori_id, judul, deskripsi, latitude, longitude, alamat_lokasi } = req.body;
            const user_id = req.user.id; // Didapat dari verifyToken middleware
            let foto_url = null;

            if (req.file) {
                foto_url = `/uploads/${req.file.filename}`;
            }

            const [result] = await db.execute(
                `INSERT INTO pengaduan 
                (user_id, kategori_id, judul, deskripsi, foto_url, latitude, longitude, alamat_lokasi) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, kategori_id, judul, deskripsi, foto_url, latitude || null, longitude || null, alamat_lokasi || null]
            );

            res.status(201).json({ 
                message: 'Pengaduan berhasil dibuat',
                pengaduanId: result.insertId
            });
        } catch (error) {
            console.error('Error saat membuat pengaduan:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat membuat pengaduan.' });
        }
    },

    // Mengambil semua pengaduan milik user yang sedang login
    getPengaduanUser: async (req, res) => {
        try {
            const user_id = req.user.id;
            
            const [rows] = await db.execute(
                `SELECT p.*, k.nama_kategori 
                 FROM pengaduan p 
                 LEFT JOIN kategori k ON p.kategori_id = k.id 
                 WHERE p.user_id = ? 
                 ORDER BY p.created_at DESC`,
                [user_id]
            );

            res.json(rows);
        } catch (error) {
            console.error('Error saat mengambil data pengaduan:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil pengaduan.' });
        }
    },

    // Mengambil detail pengaduan spesifik
    getDetailPengaduan: async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.id; // Untuk memastikan user hanya bisa lihat miliknya atau jika dia admin (perlu logika tambahan jika admin)
            
            // Query untuk mendapatkan detail
            const [rows] = await db.execute(
                `SELECT 
                    p.*, 
                    k.nama_kategori,
                    pet.nama_lengkap as nama_petugas,
                    lp.keterangan as keterangan_selesai,
                    lp.foto_bukti_url as foto_selesai_url,
                    lp.selesai_at
                 FROM pengaduan p 
                 LEFT JOIN kategori k ON p.kategori_id = k.id 
                 LEFT JOIN penugasan pen ON p.id = pen.pengaduan_id
                 LEFT JOIN users pet ON pen.petugas_id = pet.id
                 LEFT JOIN laporan_petugas lp ON pen.id = lp.penugasan_id
                 WHERE p.id = ?`,
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Pengaduan tidak ditemukan.' });
            }

            const pengaduan = rows[0];

            // Proteksi akses (hanya masyarakat pemilik atau admin/petugas)
            if (req.user.role === 'masyarakat' && pengaduan.user_id !== user_id) {
                return res.status(403).json({ message: 'Anda tidak memiliki akses ke pengaduan ini.' });
            }

            res.json(pengaduan);
        } catch (error) {
            console.error('Error saat mengambil detail pengaduan:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    },

    // Mengambil daftar kategori yang aktif
    getKategori: async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT id, nama_kategori, deskripsi FROM kategori WHERE aktif = TRUE');
            res.json(rows);
        } catch (error) {
            console.error('Error saat mengambil kategori:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil kategori.' });
        }
    }
};

module.exports = pengaduanController;
