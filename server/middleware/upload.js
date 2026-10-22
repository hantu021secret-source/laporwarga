const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Menyimpan file di folder uploads/
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Membuat nama file yang unik menggunakan timestamp dan ekstensi asli
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter hanya untuk file gambar
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (jpeg, jpg, png) yang diperbolehkan!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran 5MB
    fileFilter: fileFilter
});

module.exports = upload;
