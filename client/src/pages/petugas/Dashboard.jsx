import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './petugas.module.css';

const DashboardPetugas = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('semua');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/petugas/tugas');
        setTasks(response.data || []);
      } catch (error) {
        console.error('Gagal mengambil daftar tugas petugas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Hitung statistik
  const total = tasks.length;
  const ditugaskanCount = tasks.filter(t => t.status === 'ditugaskan').length;
  const dikerjakanCount = tasks.filter(t => t.status === 'dikerjakan').length;
  const selesaiCount = tasks.filter(t => t.status === 'selesai').length;

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'semua') return true;
    return t.status === activeFilter;
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard Petugas Lapangan</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
          Selamat Bertugas, {user?.nama_lengkap || user?.nama || 'Petugas'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Pantau dan tindak lanjuti perbaikan fasilitas umum yang ditugaskan oleh kelurahan.
        </p>
      </div>

      {/* Ringkasan Statistik */}
      <div className={styles.dashboardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: 'var(--primary)' }}>{total}</div>
          <div className={styles.statLabel}>Total Tugas</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: '#4338CA' }}>{ditugaskanCount}</div>
          <div className={styles.statLabel}>Tugas Baru Masuk</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: 'var(--warning)' }}>{dikerjakanCount}</div>
          <div className={styles.statLabel}>Sedang Dikerjakan</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: 'var(--success)' }}>{selesaiCount}</div>
          <div className={styles.statLabel}>Selesai Diperbaiki</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button 
          className={`${styles.tabBtn} ${activeFilter === 'semua' ? styles.active : ''}`}
          onClick={() => setActiveFilter('semua')}
        >
          Semua ({total})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeFilter === 'ditugaskan' ? styles.active : ''}`}
          onClick={() => setActiveFilter('ditugaskan')}
        >
          Tugas Baru ({ditugaskanCount})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeFilter === 'dikerjakan' ? styles.active : ''}`}
          onClick={() => setActiveFilter('dikerjakan')}
        >
          Sedang Dikerjakan ({dikerjakanCount})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeFilter === 'selesai' ? styles.active : ''}`}
          onClick={() => setActiveFilter('selesai')}
        >
          Selesai ({selesaiCount})
        </button>
      </div>

      {/* Daftar Tugas */}
      {isLoading ? (
        <p>Memuat daftar tugas...</p>
      ) : filteredTasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Tidak ada tugas pada kategori ini.</p>
        </div>
      ) : (
        <div className={styles.taskGrid}>
          {filteredTasks.map((item) => (
            <Link 
              to={`/petugas/tugas/${item.pengaduan_id || item.penugasan_id}`} 
              key={item.penugasan_id} 
              className={styles.taskCard}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className={`${styles.statusBadge} ${styles[`status-${item.status?.toLowerCase() || 'ditugaskan'}`]}`}>
                  {item.status === 'ditugaskan' ? 'Tugas Baru' : item.status}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {item.ditugaskan_at ? new Date(item.ditugaskan_at).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {item.judul}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.deskripsi}
              </p>

              {item.catatan_admin && (
                <div style={{ background: '#FEF3C7', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.8rem', color: '#92400E', marginBottom: '1rem' }}>
                  <strong>Catatan Admin:</strong> {item.catatan_admin}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Kategori: <strong>{item.nama_kategori || '-'}</strong></span>
                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Lihat Detail &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPetugas;
