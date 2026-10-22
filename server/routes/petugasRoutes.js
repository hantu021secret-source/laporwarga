const express = require('express');
const router = express.Router();
const petugasController = require('../controllers/petugasController');
const { verifyToken, isPetugas } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Melindungi semua rute petugas dengan verifikasi token dan pengecekan role petugas
router.use(verifyToken, isPetugas);

// Daftar semua tugas
router.get('/tugas', petugasController.getTugas);

// Detail tugas spesifik
router.get('/tugas/:id', petugasController.getDetailTugas);

// Mulai mengerjakan tugas
router.put('/tugas/:id/mulai', petugasController.mulaiKerjakan);

// Menyelesaikan tugas dengan upload foto bukti
router.post('/tugas/:id/selesai', upload.single('foto_bukti'), petugasController.selesaiKerjakan);

module.exports = router;
