import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './masyarakat.module.css';

const TIMELINE_STEPS = ['dikirim', 'diverifikasi', 'ditugaskan', 'dikerjakan', 'selesai'];

const DetailLaporan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/pengaduan/${id}`);
        setLaporan(response.data.data || response.data);
      } catch (err) {
        setError('Gagal memuat detail laporan. Laporan mungkin tidak ditemukan.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) return <div>Memuat detail laporan...</div>;
  if (error) return <div className="card" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!laporan) return <div>Laporan tidak ditemukan.</div>;

  const currentStatus = laporan.status?.toLowerCase() || 'dikirim';
  
  // Jika ditolak, timeline khusus
  const isDitolak = currentStatus === 'ditolak';
  const currentIndex = TIMELINE_STEPS.indexOf(currentStatus);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Detail Laporan</h1>
        <button onClick={() => navigate(-1)} className="btn" style={{ border: '1px solid var(--border)' }}>Kembali</button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Status Laporan</h2>
        
        {isDitolak ? (
          <div style={{ padding: '1rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '0.5rem', textAlign: 'center' }}>
            Laporan Anda ditolak. Silakan buat laporan baru dengan informasi yang lebih valid.
          </div>
        ) : (
          <div className={styles.timeline}>
            {TIMELINE_STEPS.map((step, index) => {
              // Jika index saat ini lebih dari atau sama dengan index step, berarti aktif
              const isActive = currentIndex >= index;
              return (
                <div key={step} className={`${styles.timelineStep} ${isActive ? styles.active : ''}`}>
                  <div className={styles.timelineIcon}>
                    {isActive ? '✓' : index + 1}
                  </div>
                  <div className={styles.timelineLabel} style={{ textTransform: 'capitalize' }}>
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.detailGrid}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{laporan.judul}</h2>
            <span className={`${styles.statusBadge} ${styles[`status-${currentStatus}`]}`}>
              {laporan.status || 'Dikirim'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <div>
              <strong>Tanggal:</strong><br />
              {laporan.created_at ? new Date(laporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </div>
            <div>
              <strong>Kategori:</strong><br />
              {laporan.Kategori?.nama_kategori || laporan.kategori || '-'}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Deskripsi</h3>
            <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{laporan.deskripsi}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Lokasi</h3>
            <p style={{ color: 'var(--text-primary)' }}>{laporan.alamat_lokasi}</p>
            {laporan.latitude && laporan.longitude && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Koordinat: {laporan.latitude}, {laporan.longitude}
              </p>
            )}
          </div>

          {/* Jika Laporan Sudah Selesai: Tampilkan Bukti Perbaikan dari Petugas */}
          {currentStatus === 'selesai' && (
            <div style={{ marginTop: '2rem', borderTop: '2px dashed var(--border)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--success)' }}>
                Hasil Perbaikan oleh Petugas
              </h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Petugas Pelaksana:</strong> {laporan.nama_petugas || 'Petugas Lapangan'}
              </p>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: '0.5rem', color: '#166534', marginBottom: '1rem' }}>
                <strong>Keterangan Perbaikan:</strong>
                <p style={{ marginTop: '0.25rem' }}>{laporan.keterangan_selesai || 'Fasilitas telah selesai diperbaiki.'}</p>
                <small style={{ color: '#15803D' }}>
                  Selesai pada: {laporan.selesai_at ? new Date(laporan.selesai_at).toLocaleString('id-ID') : '-'}
                </small>
              </div>

              {laporan.foto_selesai_url && (
                <div>
                  <strong>Foto Bukti Selesai:</strong>
                  <img 
                    src={laporan.foto_selesai_url.startsWith('http') ? laporan.foto_selesai_url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${laporan.foto_selesai_url}`}
                    alt="Bukti Selesai Petugas"
                    style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '0.5rem', marginTop: '0.5rem', border: '2px solid var(--success)' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ alignSelf: 'start' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Foto Kerusakan Awal</h3>
          {laporan.foto_url || laporan.foto ? (
            <img 
              src={(laporan.foto_url || laporan.foto).startsWith('http') ? (laporan.foto_url || laporan.foto) : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${laporan.foto_url || ('/uploads/' + laporan.foto)}`} 
              alt="Bukti Laporan" 
              className={styles.detailImage}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Tidak+Tersedia';
              }}
            />
          ) : (
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', textAlign: 'center', borderRadius: '0.5rem', color: 'var(--text-secondary)' }}>
              Tidak ada foto terlampir
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailLaporan;
