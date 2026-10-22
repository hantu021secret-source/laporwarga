const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
        return res.status(403).json({ message: 'Akses ditolak, token tidak disediakan.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Menyimpan data user dari token ke request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
    }
};

// Middleware untuk mengecek role admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Membutuhkan akses admin.' });
    }
};

// Middleware untuk mengecek role petugas
const isPetugas = (req, res, next) => {
    if (req.user && req.user.role === 'petugas') {
        next();
    } else {
        return res.status(403).json({ message: 'Membutuhkan akses petugas.' });
    }
};

module.exports = { verifyToken, isAdmin, isPetugas };
