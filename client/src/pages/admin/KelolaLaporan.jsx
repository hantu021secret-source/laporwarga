import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './admin.module.css';

const KelolaLaporan = () => {
  const [laporan, setLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const response = await api.get('/admin/pengaduan');
        setLaporan(response.data.data || response.data || []);
      } catch (error) {
        console.error('Gagal memuat laporan', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLaporan();
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Kelola Laporan</h1>
      </div>

      <div className={styles.adminNav}>
        <Link to="/admin/dashboard" className={styles.adminLink}>Dashboard</Link>
        <Link to="/admin/laporan" className={styles.adminLink} style={{ background: 'var(--bg-secondary)', color: 'var(--primary)', borderColor: 'var(--border)' }}>Kelola Laporan</Link>
        <Link to="/admin/petugas" className={styles.adminLink}>Kelola Petugas</Link>
        <Link to="/admin/kategori" className={styles.adminLink}>Kelola Kategori</Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Pelapor</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
            ) : laporan.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Belum ada laporan</td></tr>
            ) : (
              laporan.map((item) => (
                <tr key={item.id}>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</td>
                  <td>{item.Masyarakat?.nama_lengkap || item.nama_pelapor || '-'}</td>
                  <td>{item.judul}</td>
                  <td>{item.Kategori?.nama_kategori || item.nama_kategori || '-'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status-${item.status?.toLowerCase() || 'dikirim'}`]}`}>
                      {item.status || 'Dikirim'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/laporan/${item.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Detail</Link>
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

export default KelolaLaporan;
