import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './admin.module.css';

const KelolaPetugas = () => {
  const [petugas, setPetugas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_hp: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPetugas = async () => {
    try {
      const response = await api.get('/admin/petugas');
      setPetugas(response.data.data || response.data || []);
    } catch (error) {
      console.error('Gagal memuat petugas', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPetugas();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/petugas', formData);
      setFormData({ nama: '', email: '', no_hp: '', password: '' });
      fetchPetugas();
      alert('Berhasil menambah petugas');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambah petugas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Kelola Petugas</h1>
      </div>

      <div className={styles.adminNav}>
        <Link to="/admin/dashboard" className={styles.adminLink}>Dashboard</Link>
        <Link to="/admin/laporan" className={styles.adminLink}>Kelola Laporan</Link>
        <Link to="/admin/petugas" className={styles.adminLink} style={{ background: 'var(--bg-secondary)', color: 'var(--primary)', borderColor: 'var(--border)' }}>Kelola Petugas</Link>
        <Link to="/admin/kategori" className={styles.adminLink}>Kelola Kategori</Link>
      </div>

      <div className={styles.formSection}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Tambah Petugas Baru</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="nama">Nama Lengkap</label>
            <input type="text" id="nama" name="nama" className="form-control" value={formData.nama} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="no_hp">No HP</label>
            <input type="text" id="no_hp" name="no_hp" className="form-control" value={formData.no_hp} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required minLength="6" />
          </div>
          <div style={{ marginBottom: 0 }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Petugas'}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>No HP</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
            ) : petugas.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>Belum ada petugas</td></tr>
            ) : (
              petugas.map((item) => (
                <tr key={item.id}>
                  <td>{item.nama || item.nama_lengkap}</td>
                  <td>{item.email}</td>
                  <td>{item.no_hp || '-'}</td>
                  <td>Aktif</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KelolaPetugas;
