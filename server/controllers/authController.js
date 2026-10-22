const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const authController = {
    // Fungsi Registrasi User
    register: async (req, res) => {
        // Validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { nama_lengkap, nik, email, no_hp, alamat, password } = req.body;

            // Cek apakah email sudah terdaftar
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email sudah terdaftar.' });
            }

            // Buat user baru (default role masyarakat)
            const userId = await User.create({ nama_lengkap, nik, email, no_hp, alamat, password, role: 'masyarakat' });

            res.status(201).json({ message: 'Registrasi berhasil', userId });
        } catch (error) {
            console.error('Error saat registrasi:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    },

    // Fungsi Login User
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Cari user berdasarkan email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Email atau password salah.' });
            }

            // Periksa kecocokan password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email atau password salah.' });
            }

            // Buat token JWT
            const payload = {
                id: user.id,
                role: user.role
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.json({
                message: 'Login berhasil',
                token,
                user: {
                    id: user.id,
                    nama_lengkap: user.nama_lengkap,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error saat login:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    },

    // Mendapatkan data user saat ini
    getMe: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User tidak ditemukan.' });
            }
            res.json(user);
        } catch (error) {
            console.error('Error saat mengambil data user:', error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }
};

module.exports = authController;
