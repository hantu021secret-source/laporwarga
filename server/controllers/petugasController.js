const db = require('../config/database');

const petugasController = {
    // Mengambil semua daftar tugas untuk petugas yang sedang login
    getTugas: async (req, res) => {
        try {
            const petugas_id = req.user.id;

            const [rows] = await db.execute(`
                SELECT 
                    pen.id as penugasan_id,
                    pen.catatan_admin,
                    pen.ditugaskan_at,
                    p.id as pengaduan_id,
                    p.judul,
                    p.deskripsi,
                    p.foto_url,
                    p.alamat_lokasi,
                    p.latitude,
                    p.longitude,
                    p.status,
                    p.created_at,
                    k.nama_kategori,
                    u.nama_lengkap as nama_pelapor,
                    u.no_hp as no_hp_pelapor,
                    lp.keterangan as keterangan_selesai,
                    lp.foto_bukti_url,
                    lp.selesai_at
                FROM penugasan pen
                JOIN pengaduan p ON pen.pengaduan_id = p.id
                LEFT JOIN kategori k ON p.kategori_id = k.id
                LEFT JOIN users u ON p.user_id = u.id
                LEFT JOIN laporan_petugas lp ON pen.id = lp.penugasan_id
                WHERE pen.petugas_id = ?
                ORDER BY pen.ditugaskan_at DESC
            `, [petugas_id]);

            res.json(rows);
        } catch (error) {
            console.error('Error saat mengambil daftar tugas petugas:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil tugas.' });
        }
    },

    // Mengambil detail satu tugas
    getDetailTugas: async (req, res) => {
        try {
            const { id } = req.params;
            const petugas_id = req.user.id;

            const [rows] = await db.execute(`
                SELECT 
                    pen.id as penugasan_id,
                    pen.catatan_admin,
                    pen.ditugaskan_at,
                    p.id as pengaduan_id,
                    p.judul,
                    p.deskripsi,
                    p.foto_url,
                    p.alamat_lokasi,
                    p.latitude,
                    p.longitude,
                    p.status,
                    p.created_at,
                    k.nama_kategori,
                    u.nama_lengkap as nama_pelapor,
                    u.no_hp as no_hp_pelapor,
                    adm.nama_lengkap as nama_admin,
                    lp.keterangan as keterangan_selesai,
                    lp.foto_bukti_url,
                    lp.selesai_at
                FROM penugasan pen
                JOIN pengaduan p ON pen.pengaduan_id = p.id
                LEFT JOIN kategori k ON p.kategori_id = k.id
                LEFT JOIN users u ON p.user_id = u.id
                LEFT JOIN users adm ON pen.admin_id = adm.id
                LEFT JOIN laporan_petugas lp ON pen.id = lp.penugasan_id
                WHERE (pen.id = ? OR p.id = ?) AND pen.petugas_id = ?
            `, [id, id, petugas_id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Tugas tidak ditemukan atau bukan milik Anda.' });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Error saat mengambil detail tugas petugas:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil detail tugas.' });
        }
    },

    // Memperbarui status tugas menjadi 'dikerjakan'
    mulaiKerjakan: async (req, res) => {
        try {
            const { id } = req.params; // ID penugasan atau pengaduan
            const petugas_id = req.user.id;

            // Pastikan penugasan milik petugas ini
            const [penugasan] = await db.execute(
                'SELECT pen.id, pen.pengaduan_id, p.status FROM penugasan pen JOIN pengaduan p ON pen.pengaduan_id = p.id WHERE (pen.id = ? OR p.id = ?) AND pen.petugas_id = ?',
                [id, id, petugas_id]
            );

            if (penugasan.length === 0) {
                return res.status(404).json({ message: 'Penugasan tidak ditemukan.' });
            }

            const targetPengaduanId = penugasan[0].pengaduan_id;

            // Update status pengaduan menjadi 'dikerjakan'
            await db.execute(
                'UPDATE pengaduan SET status = ? WHERE id = ?',
                ['dikerjakan', targetPengaduanId]
            );

            res.json({ message: 'Tugas mulai dikerjakan. Status berhasil diubah menjadi dikerjakan.' });
        } catch (error) {
            console.error('Error saat memulai tugas:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat memulai tugas.' });
        }
    },

    // Menyelesaikan tugas dengan mengunggah foto bukti dan keterangan
    selesaiKerjakan: async (req, res) => {
        try {
            const { id } = req.params;
            const { keterangan } = req.body;
            const petugas_id = req.user.id;

            if (!keterangan) {
                return res.status(400).json({ message: 'Keterangan hasil perbaikan wajib diisi.' });
            }

            let foto_bukti_url = null;
            if (req.file) {
                foto_bukti_url = `/uploads/${req.file.filename}`;
            }

            // Pastikan penugasan milik petugas ini
            const [penugasan] = await db.execute(
                'SELECT pen.id, pen.pengaduan_id FROM penugasan pen JOIN pengaduan p ON pen.pengaduan_id = p.id WHERE (pen.id = ? OR p.id = ?) AND pen.petugas_id = ?',
                [id, id, petugas_id]
            );

            if (penugasan.length === 0) {
                return res.status(404).json({ message: 'Penugasan tidak ditemukan.' });
            }

            const penugasan_id = penugasan[0].id;
            const targetPengaduanId = penugasan[0].pengaduan_id;

            // Transaksi: Simpan laporan petugas dan ubah status pengaduan jadi 'selesai'
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Simpan bukti ke laporan_petugas
                await connection.execute(
                    'INSERT INTO laporan_petugas (penugasan_id, keterangan, foto_bukti_url) VALUES (?, ?, ?)',
                    [penugasan_id, keterangan, foto_bukti_url]
                );

                // Update status pengaduan jadi 'selesai'
                await connection.execute(
                    'UPDATE pengaduan SET status = ? WHERE id = ?',
                    ['selesai', targetPengaduanId]
                );

                await connection.commit();
                res.json({ message: 'Laporan perbaikan berhasil dikirim. Pengaduan telah diselesaikan!' });
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error saat menyelesaikan tugas:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat menyelesaikan tugas.' });
        }
    }
};

module.exports = petugasController;
