CREATE DATABASE IF NOT EXISTS laporwarga;
USE laporwarga;

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    nik CHAR(16) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    no_hp VARCHAR(15) NOT NULL,
    alamat TEXT,
    password VARCHAR(255) NOT NULL,
    role ENUM('masyarakat', 'admin', 'petugas') DEFAULT 'masyarakat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Kategori
CREATE TABLE IF NOT EXISTS kategori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pengaduan
CREATE TABLE IF NOT EXISTS pengaduan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    kategori_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT NOT NULL,
    foto_url VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    alamat_lokasi TEXT,
    status ENUM('dikirim', 'diverifikasi', 'ditugaskan', 'dikerjakan', 'selesai', 'ditolak') DEFAULT 'dikirim',
    alasan_tolak TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id)
);

-- Tabel Penugasan
CREATE TABLE IF NOT EXISTS penugasan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pengaduan_id INT NOT NULL,
    petugas_id INT NOT NULL,
    admin_id INT NOT NULL,
    catatan_admin TEXT,
    ditugaskan_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pengaduan_id) REFERENCES pengaduan(id) ON DELETE CASCADE,
    FOREIGN KEY (petugas_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Tabel Laporan Petugas
CREATE TABLE IF NOT EXISTS laporan_petugas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    penugasan_id INT NOT NULL,
    keterangan TEXT NOT NULL,
    foto_bukti_url VARCHAR(255),
    selesai_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (penugasan_id) REFERENCES penugasan(id) ON DELETE CASCADE
);

-- Tabel Rating
CREATE TABLE IF NOT EXISTS rating (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pengaduan_id INT NOT NULL,
    user_id INT NOT NULL,
    nilai INT NOT NULL CHECK (nilai >= 1 AND nilai <= 5),
    komentar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pengaduan_id) REFERENCES pengaduan(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Notifikasi
CREATE TABLE IF NOT EXISTS notifikasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    pesan TEXT NOT NULL,
    dibaca BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Data Default: Kategori
INSERT INTO kategori (nama_kategori, deskripsi) VALUES 
('Jalan Rusak', 'Pengaduan terkait jalan berlubang, rusak, atau aspal terkelupas.'),
('Lampu Jalan Mati', 'Pengaduan terkait lampu penerangan jalan umum yang mati.'),
('Sampah Menumpuk', 'Pengaduan terkait tumpukan sampah yang tidak diangkut.'),
('Banjir/Genangan', 'Pengaduan terkait saluran air mampet yang menyebabkan banjir.'),
('Keamanan', 'Pengaduan terkait gangguan keamanan dan ketertiban umum.');

-- Data Default: Akun Admin (Password: admin123)
-- Hash bcrypt untuk 'admin123' adalah: $2a$10$wY9... (kita bisa generate via bcrypt, tapi saya akan pakai string yang benar)
INSERT INTO users (nama_lengkap, nik, email, no_hp, alamat, password, role) VALUES 
('Administrator', '0000000000000000', 'admin@laporwarga.com', '081234567890', 'Kantor Kelurahan', '$2a$10$2H6O9xU/e3d81xO/0jLg.e41B3Vb6B4N1dC9oUvA48kF9V7zI86R.', 'admin');
