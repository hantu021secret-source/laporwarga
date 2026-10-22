const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Mencari user berdasarkan email
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Mencari user berdasarkan ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT id, nama_lengkap, nik, email, no_hp, alamat, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    // Membuat user baru
    static async create(userData) {
        const { nama_lengkap, nik, email, no_hp, alamat, password, role = 'masyarakat' } = userData;
        
        // Hash password sebelum disimpan
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            'INSERT INTO users (nama_lengkap, nik, email, no_hp, alamat, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nama_lengkap, nik, email, no_hp, alamat, hashedPassword, role]
        );
        return result.insertId;
    }
}

module.exports = User;
