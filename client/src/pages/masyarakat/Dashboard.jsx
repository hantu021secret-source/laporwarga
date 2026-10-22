import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './masyarakat.module.css';

const DashboardMasyarakat = () => {
  const { user } = useContext(AuthContext);
  const [laporan, setLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const response = await api.get('/pengaduan');
        // Asumsi data berada di response.data.data atau response.data
        setLaporan(response.data.data || response.data || []);
      } catch (error) {
        console.error('Gagal mengambil data laporan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaporan();
  }, []);

  // Hitung statistik
  const total = laporan.length;
  const diproses = laporan.filter(l => ['diverifikasi', 'ditugaskan', 'dikerjakan'].includes(l.status?.toLowerCase())).length;
  const selesai = laporan.filter(l => l.status?.toLowerCase() === 'selesai').length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard Masyarakat</h1>
      </div>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Selamat Datang, {user?.nama_lengkap}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Pantau status laporan pengaduan Anda di sini.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>{total}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Total Laporan Anda</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>{diproses}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Laporan Diproses</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '0.5rem' }}>{selesai}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Laporan Selesai</p>
          </div>
        </div>
      </div>

      <h2 className={styles.title} style={{ fontSize: '1.25rem' }}>Riwayat Laporan Anda</h2>
      
      {isLoading ? (
        <p style={{ marginTop: '1rem' }}>Memuat laporan...</p>
      ) : laporan.length === 0 ? (
        <div className="card" style={{ marginTop: '1rem', textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Belum ada laporan yang Anda buat.</p>
          <Link to="/masyarakat/laporan/baru" className="btn btn-primary">Buat Laporan Sekarang</Link>
        </div>
      ) : (
        <>
          <div className={styles.reportGrid}>
            {laporan.map((item) => (
              <Link to={`/masyarakat/laporan/${item.id}`} key={item.id} className={styles.reportCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span className={`${styles.statusBadge} ${styles[`status-${item.status?.toLowerCase() || 'dikirim'}`]}`}>
                    {item.status || 'Dikirim'}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{item.judul}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.deskripsi}
                </p>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '500' }}>
                  Kategori: {item.Kategori?.nama_kategori || item.nama_kategori || item.kategori || '-'}
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/masyarakat/laporan/baru" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              + Buat Laporan Baru
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardMasyarakat;
