import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './admin.module.css';

const DashboardAdmin = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0,
    menunggu_verifikasi: 0,
    sedang_diproses: 0,
    selesai: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data || response.data);
      } catch (error) {
        console.error('Gagal mengambil statistik:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard Admin</h1>
      </div>

      <div className={styles.adminNav}>
        <Link to="/admin/dashboard" className={styles.adminLink} style={{ background: 'var(--bg-secondary)', color: 'var(--primary)', borderColor: 'var(--border)' }}>Dashboard</Link>
        <Link to="/admin/laporan" className={styles.adminLink}>Kelola Laporan</Link>
        <Link to="/admin/petugas" className={styles.adminLink}>Kelola Petugas</Link>
        <Link to="/admin/kategori" className={styles.adminLink}>Kelola Kategori</Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Selamat Datang, {user?.nama_lengkap || user?.nama || 'Admin'}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Pantau statistik dan kelola sistem pelaporan LaporWarga secara keseluruhan.
        </p>
      </div>

      {isLoading ? (
        <p>Memuat statistik...</p>
      ) : (
        <div className={styles.dashboardGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: 'var(--primary)' }}>{stats.total || 0}</div>
            <div className={styles.statLabel}>Total Laporan</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: 'var(--danger)' }}>{stats.menunggu_verifikasi || 0}</div>
            <div className={styles.statLabel}>Menunggu Verifikasi</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: 'var(--warning)' }}>{stats.sedang_diproses || 0}</div>
            <div className={styles.statLabel}>Sedang Diproses</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: 'var(--success)' }}>{stats.selesai || 0}</div>
            <div className={styles.statLabel}>Selesai</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
