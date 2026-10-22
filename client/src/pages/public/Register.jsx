import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './auth.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nik: '',
    nama_lengkap: '',
    email: '',
    no_hp: '',
    alamat: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      // Menyiapkan data tanpa confirmPassword
      const { confirmPassword, ...dataToSubmit } = formData;
      await api.post('/auth/register', dataToSubmit);
      
      // Jika berhasil, arahkan ke login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`card ${styles.authCard} ${styles.authCardLarge}`}>
        <h2 className={styles.title}>Daftar LaporWarga</h2>
        <p className={styles.subtitle}>Buat akun untuk melaporkan masalah fasilitas publik</p>

        {error && <div className={styles.alertDanger}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className="form-group">
            <label htmlFor="nik">NIK (Nomor Induk Kependudukan)</label>
            <input
              type="text"
              id="nik"
              name="nik"
              className="form-control"
              value={formData.nik}
              onChange={handleChange}
              required
              placeholder="16 Digit NIK"
              maxLength="16"
              minLength="16"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nama_lengkap">Nama Lengkap</label>
            <input
              type="text"
              id="nama_lengkap"
              name="nama_lengkap"
              className="form-control"
              value={formData.nama_lengkap}
              onChange={handleChange}
              required
              placeholder="Sesuai KTP"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@contoh.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="no_hp">Nomor Handphone</label>
            <input
              type="tel"
              id="no_hp"
              name="no_hp"
              className="form-control"
              value={formData.no_hp}
              onChange={handleChange}
              required
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className={`form-group ${styles.fullWidth}`}>
            <label htmlFor="alamat">Alamat Lengkap</label>
            <textarea
              id="alamat"
              name="alamat"
              className="form-control"
              value={formData.alamat}
              onChange={handleChange}
              required
              placeholder="Nama Jalan, RT/RW, dsb."
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimal 6 karakter"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Ulangi kata sandi"
            />
          </div>

          <div className={styles.fullWidth}>
            <button 
              type="submit" 
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isLoading}
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftar Akun'}
            </button>
          </div>
        </form>

        <p className={styles.footerText}>
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
