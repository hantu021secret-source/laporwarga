const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { body } = require('express-validator');

// Validasi untuk registrasi
const registerValidation = [
    body('nama_lengkap').notEmpty().withMessage('Nama lengkap wajib diisi'),
    body('nik').isLength({ min: 16, max: 16 }).withMessage('NIK harus 16 karakter'),
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('no_hp').notEmpty().withMessage('Nomor HP wajib diisi'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
];

// Rute Publik
router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);

// Rute Privat (membutuhkan token)
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
