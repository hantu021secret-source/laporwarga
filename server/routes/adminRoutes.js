const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Melindungi semua rute admin dengan verifikasi token dan pengecekan role admin
router.use(verifyToken, isAdmin);

// Dashboard & Statistik
router.get('/stats', adminController.getDashboardStats);
router.get('/dashboard', adminController.getDashboardStats);

// Pengaduan
router.get('/pengaduan', adminController.getAllPengaduan);
router.get('/pengaduan/:id', adminController.getDetailPengaduan);
router.put('/pengaduan/:id/status', adminController.verifikasiPengaduan);
router.put('/pengaduan/:id/verifikasi', adminController.verifikasiPengaduan);
router.put('/pengaduan/:id/tugaskan', adminController.assignPetugas);
router.post('/pengaduan/:id/assign', adminController.assignPetugas);

// Manajemen Petugas
router.get('/petugas', adminController.getAllPetugas);
router.post('/petugas', adminController.createPetugas);

// Manajemen Kategori
router.get('/kategori', adminController.getAllKategori);
router.post('/kategori', adminController.createKategori);
router.delete('/kategori/:id', adminController.deleteKategori);

module.exports = router;
