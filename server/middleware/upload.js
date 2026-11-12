const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Simpan di memori, bukan di disk (Vercel read-only)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Hanya file gambar (jpeg, jpg, png) yang diperbolehkan!'));
};

const upload = multer({
    storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // 4MB (batas body Vercel sekitar 4,5MB)
    fileFilter
});

// Middleware: kirim file dari memori ke Cloudinary
const uploadToCloudinary = (req, res, next) => {
    if (!req.file) return next();

    const stream = cloudinary.uploader.upload_stream(
        { folder: 'laporwarga' },
        (error, result) => {
            if (error) return next(error);
            req.file.filename = result.secure_url;
            req.file.path = result.secure_url;
            next();
        }
    );
    stream.end(req.file.buffer);
};

module.exports = upload;
module.exports.uploadToCloudinary = uploadToCloudinary;
