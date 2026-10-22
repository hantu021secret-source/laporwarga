const db = require('../config/database');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const adminController = {
    // Mendapatkan statistik untuk dashboard admin
    getDashboardStats: async (req, res) => {
        try {
            // Menghitung total pengaduan berdasarkan status
            const [pengaduanStats] = await db.execute(`
                SELECT 
                    COUNT(*) as total,
                    COALESCE(SUM(CASE WHEN status = 'dikirim' THEN 1 ELSE 0 END), 0) as dikirim,
                    COALESCE(SUM(CASE WHEN status IN ('diverifikasi', 'ditugaskan', 'dikerjakan') THEN 1 ELSE 0 END), 0) as diproses,
                    COALESCE(SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END), 0) as selesai,
                    COALESCE(SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END), 0) as ditolak
                FROM pengaduan
            `);

            // Menghitung jumlah user berdasarkan role
            const [userStats] = await db.execute(`
                SELECT 
                    COALESCE(SUM(CASE WHEN role = 'petugas' THEN 1 ELSE 0 END), 0) as total_petugas,
                    COALESCE(SUM(CASE WHEN role = 'masyarakat' THEN 1 ELSE 0 END), 0) as total_masyarakat
                FROM users
            `);

            const pStat = pengaduanStats[0] || {};
            const uStat = userStats[0] || {};

            res.json({
                total: Number(pStat.total) || 0,
                menunggu_verifikasi: Number(pStat.dikirim) || 0,
                sedang_diproses: Number(pStat.diproses) || 0,
                selesai: Number(pStat.selesai) || 0,
                ditolak: Number(pStat.ditolak) || 0,
                total_petugas: Number(uStat.total_petugas) || 0,
                total_masyarakat: Number(uStat.total_masyarakat) || 0,
                pengaduan: pStat,
                pengguna: uStat
            });
        } catch (error) {
            console.error('Error saat mengambil statistik dashboard:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil statistik.' });
        }
    },

    // Mengambil semua pengaduan (dengan join ke users dan kategori)
    getAllPengaduan: async (req, res) => {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    p.*, 
                    u.nama_lengkap as nama_pelapor, 
                    u.no_hp as no_hp_pelapor,
                    u.email as email_pelapor,
                    k.nama_kategori 
                FROM pengaduan p
                LEFT JOIN users u ON p.user_id = u.id
                LEFT JOIN kategori k ON p.kategori_id = k.id
                ORDER BY p.created_at DESC
            `);

            // Format agar mendukung akses datar (flat) maupun bersarang (nested)
            const formatted = rows.map(item => ({
                ...item,
                Masyarakat: {
                    nama_lengkap: item.nama_pelapor,
                    no_hp: item.no_hp_pelapor,
                    email: item.email_pelapor
                },
                Kategori: {
                    nama_kategori: item.nama_kategori
                }
            }));

            res.json(formatted);
        } catch (error) {
            console.error('Error saat mengambil semua pengaduan:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil pengaduan.' });
        }
    },

    // Mengambil detail satu pengaduan untuk admin
    getDetailPengaduan: async (req, res) => {
        try {
            const { id } = req.params;

            const [rows] = await db.execute(`
                SELECT 
                    p.*, 
                    u.nama_lengkap as nama_pelapor, 
                    u.no_hp as no_hp_pelapor,
                    u.email as email_pelapor,
                    k.nama_kategori,
                    pen.petugas_id,
                    pet.nama_lengkap as nama_petugas
                FROM pengaduan p
                LEFT JOIN users u ON p.user_id = u.id
                LEFT JOIN kategori k ON p.kategori_id = k.id
                LEFT JOIN penugasan pen ON p.id = pen.pengaduan_id
                LEFT JOIN users pet ON pen.petugas_id = pet.id
                WHERE p.id = ?
            `, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Pengaduan tidak ditemukan.' });
            }

            const item = rows[0];
            const result = {
                ...item,
                Masyarakat: {
                    nama_lengkap: item.nama_pelapor,
                    no_hp: item.no_hp_pelapor,
                    email: item.email_pelapor
                },
                Kategori: {
                    nama_kategori: item.nama_kategori
                },
                Petugas: item.nama_petugas ? {
                    id: item.petugas_id,
                    nama_lengkap: item.nama_petugas
                } : null
            };

            res.json(result);
        } catch (error) {
            console.error('Error saat mengambil detail pengaduan admin:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil detail pengaduan.' });
        }
    },

    // Memverifikasi pengaduan (menerima atau menolak)
    verifikasiPengaduan: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, alasan_tolak } = req.body;

            // Status yang diperbolehkan
            if (!['diverifikasi', 'ditolak'].includes(status)) {
                return res.status(400).json({ message: 'Status harus "diverifikasi" atau "ditolak".' });
            }

            await db.execute(
                'UPDATE pengaduan SET status = ?, alasan_tolak = ? WHERE id = ?',
                [status, status === 'ditolak' ? (alasan_tolak || 'Laporan tidak valid') : null, id]
            );

            res.json({ message: `Pengaduan berhasil diubah status menjadi ${status}` });
        } catch (error) {
            console.error('Error saat memverifikasi pengaduan:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat verifikasi pengaduan.' });
        }
    },

    // Menugaskan petugas untuk menangani pengaduan
    assignPetugas: async (req, res) => {
        try {
            const { id } = req.params; // ID pengaduan
            const { petugas_id, catatan_admin } = req.body;
            const admin_id = req.user.id;

            if (!petugas_id) {
                return res.status(400).json({ message: 'Petugas wajib dipilih.' });
            }

            // Memulai transaksi
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Hapus penugasan lama jika ada, lalu insert penugasan baru
                await connection.execute('DELETE FROM penugasan WHERE pengaduan_id = ?', [id]);

                // Insert ke tabel penugasan
                await connection.execute(
                    'INSERT INTO penugasan (pengaduan_id, petugas_id, admin_id, catatan_admin) VALUES (?, ?, ?, ?)',
                    [id, petugas_id, admin_id, catatan_admin || null]
                );

                // Update status pengaduan menjadi 'ditugaskan'
                await connection.execute(
                    'UPDATE pengaduan SET status = ? WHERE id = ?',
                    ['ditugaskan', id]
                );

                await connection.commit();
                res.json({ message: 'Petugas berhasil ditugaskan.' });
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error saat menugaskan petugas:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat menugaskan petugas.' });
        }
    },

    // Mengambil daftar semua petugas
    getAllPetugas: async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT id, nama_lengkap, email, no_hp FROM users WHERE role = ? ORDER BY created_at DESC', ['petugas']);
            res.json(rows);
        } catch (error) {
            console.error('Error saat mengambil daftar petugas:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil daftar petugas.' });
        }
    },

    // Membuat akun petugas baru
    createPetugas: async (req, res) => {
        try {
            const { email, password } = req.body;
            const nama_lengkap = req.body.nama_lengkap || req.body.nama;
            const no_hp = req.body.no_hp || '08123456789';
            const alamat = req.body.alamat || 'Kelurahan';
            // Generate dummy NIK jika tidak diisi agar memenuhi syarat NOT NULL CHAR(16)
            const nik = req.body.nik || ('888' + Date.now().toString()).slice(0, 16).padEnd(16, '0');

            if (!nama_lengkap || !email || !password) {
                return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
            }

            // Cek apakah email sudah terdaftar
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email sudah terdaftar.' });
            }

            // Buat petugas baru
            const userId = await User.create({ 
                nama_lengkap, nik, email, no_hp, alamat, password, role: 'petugas' 
            });

            res.status(201).json({ message: 'Akun petugas berhasil dibuat', userId });
        } catch (error) {
            console.error('Error saat membuat petugas:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat membuat akun petugas.' });
        }
    },

    // Mengambil semua kategori
    getAllKategori: async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT * FROM kategori ORDER BY created_at DESC');
            res.json(rows);
        } catch (error) {
            console.error('Error saat mengambil kategori:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil kategori.' });
        }
    },

    // Membuat kategori baru
    createKategori: async (req, res) => {
        try {
            const { nama_kategori, deskripsi } = req.body;

            if (!nama_kategori) {
                return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
            }

            const [result] = await db.execute(
                'INSERT INTO kategori (nama_kategori, deskripsi) VALUES (?, ?)',
                [nama_kategori, deskripsi || null]
            );

            res.status(201).json({ 
                message: 'Kategori berhasil ditambahkan',
                kategoriId: result.insertId 
            });
        } catch (error) {
            console.error('Error saat membuat kategori:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat membuat kategori.' });
        }
    },

    // Menghapus kategori
    deleteKategori: async (req, res) => {
        try {
            const { id } = req.params;
            await db.execute('DELETE FROM kategori WHERE id = ?', [id]);
            res.json({ message: 'Kategori berhasil dihapus' });
        } catch (error) {
            console.error('Error saat menghapus kategori:', error);
            res.status(500).json({ message: 'Gagal menghapus kategori. Kategori mungkin masih terkait dengan laporan pengaduan.' });
        }
    }
};

module.exports = adminController;
