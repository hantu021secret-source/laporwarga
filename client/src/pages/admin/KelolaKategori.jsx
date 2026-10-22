import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './admin.module.css';

const KelolaKategori = () => {
  const [kategori, setKategori] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [namaKategori, setNamaKategori] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKategori = async () => {
    try {
      const response = await api.get('/pengaduan/kategori');
      setKategori(response.data.data || response.data || []);
    } catch (error) {
      console.error('Gagal memuat kategori', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaKategori.trim()) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/admin/kategori', { nama_kategori: namaKategori });
      setNamaKategori('');
      fetchKategori();
      alert('Berhasil menambah kategori');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambah kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${nama}"?`)) return;
    try {
      await api.delete(`/admin/kategori/${id}`);
      fetchKategori();
      alert('Kategori berhasil dihapus');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Kelola Kategori</h1>
      </div>

      <div className={styles.adminNav}>
        <Link to="/admin/dashboard" className={styles.adminLink}>Dashboard</Link>
        <Link to="/admin/laporan" className={styles.adminLink}>Kelola Laporan</Link>
        <Link to="/admin/petugas" className={styles.adminLink}>Kelola Petugas</Link>
        <Link to="/admin/kategori" className={styles.adminLink} style={{ background: 'var(--bg-secondary)', color: 'var(--primary)', borderColor: 'var(--border)' }}>Kelola Kategori</Link>
      </div>

      <div className={styles.formSection} style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Tambah Kategori Baru</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label htmlFor="nama_kategori">Nama Kategori</label>
            <input 
              type="text" 
              id="nama_kategori" 
              className="form-control" 
              value={namaKategori} 
              onChange={(e) => setNamaKategori(e.target.value)} 
              required 
              placeholder="Contoh: Infrastruktur"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Tambah'}
          </button>
        </form>
      </div>

      <div className={styles.tableContainer} style={{ maxWidth: '600px' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '80%' }}>Nama Kategori</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="2" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
            ) : kategori.length === 0 ? (
              <tr><td colSpan="2" style={{ textAlign: 'center' }}>Belum ada kategori</td></tr>
            ) : (
              kategori.map((item) => (
                <tr key={item.id}>
                  <td>{item.nama_kategori}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(item.id, item.nama_kategori)}
                      className="btn" 
                      style={{ fontSize: '0.875rem', color: 'var(--danger)', padding: '0.25rem 0.5rem', border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer' }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KelolaKategori;
