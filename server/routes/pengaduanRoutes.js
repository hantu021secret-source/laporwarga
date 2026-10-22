const express = require('express');
const router = express.Router();
const pengaduanController = require('../controllers/pengaduanController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Semua rute pengaduan wajib menyertakan token (harus login)
router.use(verifyToken);

// Rute untuk mendapatkan daftar kategori (dipakai untuk form dropdown)
router.get('/kategori', pengaduanController.getKategori);

// Rute untuk membuat pengaduan baru dengan upload file ('foto' adalah nama field di form)
router.post('/', upload.single('foto'), pengaduanController.createPengaduan);

// Rute untuk mengambil semua pengaduan milik user yang sedang login
router.get('/', pengaduanController.getPengaduanUser);

// Rute untuk mengambil detail satu pengaduan
router.get('/:id', pengaduanController.getDetailPengaduan);

module.exports = router;
