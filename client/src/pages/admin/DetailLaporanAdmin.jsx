import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './admin.module.css';

const DetailLaporanAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState(null);
  const [petugasList, setPetugasList] = useState([]);
  const [selectedPetugas, setSelectedPetugas] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resLaporan = await api.get(`/admin/pengaduan/${id}`);
        const laporanData = resLaporan.data.data || resLaporan.data;
        setLaporan(laporanData);

        // Jika status diverifikasi, fetch list petugas
        if (laporanData.status?.toLowerCase() === 'diverifikasi') {
          const resPetugas = await api.get('/admin/petugas');
          setPetugasList(resPetugas.data.data || resPetugas.data || []);
        }
      } catch (err) {
        setError('Gagal memuat detail laporan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    let alasan_tolak = '';
    if (newStatus === 'ditolak') {
      const inputAlasan = window.prompt('Masukkan alasan penolakan laporan:');
      if (inputAlasan === null) return; // user cancelled prompt
      alasan_tolak = inputAlasan || 'Laporan tidak sesuai ketentuan.';
    }

    setActionLoading(true);
    try {
      await api.put(`/admin/pengaduan/${id}/status`, { status: newStatus, alasan_tolak });
      setLaporan({ ...laporan, status: newStatus, alasan_tolak });
      
      // Refresh jika diverifikasi
      if (newStatus === 'diverifikasi') {
        const resPetugas = await api.get('/admin/petugas');
        setPetugasList(resPetugas.data.data || resPetugas.data || []);
      }
    } catch (err) {
      alert('Gagal mengupdate status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTugaskan = async () => {
    if (!selectedPetugas) {
      alert('Pilih petugas terlebih dahulu');
      return;
    }
    setActionLoading(true);
    try {
      await api.put(`/admin/pengaduan/${id}/tugaskan`, { petugas_id: selectedPetugas });
      setLaporan({ ...laporan, status: 'ditugaskan', petugas_id: selectedPetugas });
      alert('Berhasil menugaskan laporan ke petugas.');
    } catch (err) {
      alert('Gagal menugaskan laporan');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div>Memuat...</div>;
  if (error) return <div className="card" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!laporan) return <div>Laporan tidak ditemukan.</div>;

  const currentStatus = laporan.status?.toLowerCase() || 'dikirim';

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Detail Laporan (Admin)</h1>
        <button onClick={() => navigate(-1)} className="btn" style={{ border: '1px solid var(--border)' }}>Kembali</button>
      </div>

      <div className={styles.detailGrid}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{laporan.judul}</h2>
            <span className={`${styles.statusBadge} ${styles[`status-${currentStatus}`]}`}>
              {laporan.status || 'Dikirim'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <div>
              <strong>Pelapor:</strong><br />
              {laporan.Masyarakat?.nama_lengkap || '-'} ({laporan.Masyarakat?.no_hp || '-'})
            </div>
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
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Aksi Admin</h3>
            
            {currentStatus === 'dikirim' && (
              <div className={styles.actionGroup}>
                <button 
                  onClick={() => handleUpdateStatus('diverifikasi')} 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={actionLoading}
                >
                  Verifikasi
                </button>
                <button 
                  onClick={() => handleUpdateStatus('ditolak')} 
                  className="btn" 
                  style={{ flex: 1, backgroundColor: '#FEE2E2', color: '#B91C1C' }}
                  disabled={actionLoading}
                >
                  Tolak
                </button>
              </div>
            )}

            {currentStatus === 'diverifikasi' && (
              <div>
                <div className="form-group">
                  <label htmlFor="petugas">Pilih Petugas untuk Ditugaskan</label>
                  <select 
                    id="petugas" 
                    className="form-control"
                    value={selectedPetugas}
                    onChange={(e) => setSelectedPetugas(e.target.value)}
                  >
                    <option value="">-- Pilih Petugas --</option>
                    {petugasList.map(p => (
                      <option key={p.id} value={p.id}>{p.nama_lengkap || p.nama}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleTugaskan} 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  disabled={actionLoading}
                >
                  Tugaskan Laporan
                </button>
              </div>
            )}

            {['ditugaskan', 'dikerjakan', 'selesai', 'ditolak'].includes(currentStatus) && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Tidak ada aksi yang perlu dilakukan pada status ini.
              </p>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Foto Bukti</h3>
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
                Tidak ada foto
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailLaporanAdmin;
