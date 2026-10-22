import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './petugas.module.css';

const DetailTugas = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tugas, setTugas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Form penyelesaian
  const [keterangan, setKeterangan] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null); // File object
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  
  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const fetchDetail = async () => {
    try {
      const response = await api.get(`/petugas/tugas/${id}`);
      setTugas(response.data);
    } catch (err) {
      setError('Gagal memuat detail tugas. Pastikan tugas ini ditugaskan kepada Anda.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    return () => {
      stopCamera();
    };
  }, [id]);

  // Fungsi mengaktifkan live kamera
  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Utamakan kamera belakang di HP
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Kamera gagal diakses:', err);
      setCameraError('Tidak dapat mengakses kamera perangkat. Gunakan tombol ambil foto sistem di bawah.');
      setIsCameraActive(false);
    }
  };

  // Fungsi mematikan kamera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Fungsi menangkap frame foto dari kamera langsung
  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `bukti-petugas-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedPhoto(file);
      setPhotoPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.85);
  };

  // Fallback via file input kamera
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCapturedPhoto(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
      stopCamera();
    }
  };

  // Aksi 1: Mulai Kerjakan
  const handleMulaiKerjakan = async () => {
    if (!window.confirm('Mulai kerjakan perbaikan fasilitas ini sekarang?')) return;

    setActionLoading(true);
    try {
      await api.put(`/petugas/tugas/${id}/mulai`);
      alert('Status berhasil diubah menjadi Dikerjakan! Selamat bertugas.');
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status tugas.');
    } finally {
      setActionLoading(false);
    }
  };

  // Aksi 2: Selesai Kerjakan
  const handleSelesaikanTugas = async (e) => {
    e.preventDefault();

    if (!keterangan.trim()) {
      alert('Keterangan hasil perbaikan wajib diisi.');
      return;
    }

    if (!capturedPhoto) {
      alert('Foto bukti hasil perbaikan wajib diambil.');
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('keterangan', keterangan);
      formData.append('foto_bukti', capturedPhoto);

      await api.post(`/petugas/tugas/${id}/selesai`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Laporan perbaikan berhasil dikirim! Status tugas kini telah SELESAI.');
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyelesaikan tugas.');
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  if (isLoading) return <div>Memuat detail tugas...</div>;
  if (error) return <div className="card" style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!tugas) return <div>Tugas tidak ditemukan.</div>;

  const currentStatus = tugas.status?.toLowerCase() || 'ditugaskan';

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Detail Penugasan Lapangan</h1>
        <button onClick={() => navigate(-1)} className="btn" style={{ border: '1px solid var(--border)' }}>
          Kembali
        </button>
      </div>

      <div className={styles.detailGrid}>
        {/* Kolom Kiri: Informasi Laporan */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>{tugas.judul}</h2>
            <span className={`${styles.statusBadge} ${styles[`status-${currentStatus}`]}`}>
              {currentStatus === 'ditugaskan' ? 'Tugas Baru' : currentStatus}
            </span>
          </div>

          {/* Catatan Khusus Admin */}
          {tugas.catatan_admin && (
            <div style={{ background: '#FEF3C7', borderLeft: '4px solid #D97706', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', color: '#92400E' }}>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Instruksi / Catatan Admin:</strong>
              {tugas.catatan_admin}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <div>
              <strong>Kategori:</strong><br />
              {tugas.nama_kategori || '-'}
            </div>
            <div>
              <strong>Pelapor:</strong><br />
              {tugas.nama_pelapor || '-'} ({tugas.no_hp_pelapor || '-'})
            </div>
            <div>
              <strong>Tanggal Ditugaskan:</strong><br />
              {tugas.ditugaskan_at ? new Date(tugas.ditugaskan_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Deskripsi Masalah dari Warga</h3>
            <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{tugas.deskripsi}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Lokasi Penanganan</h3>
            <p style={{ color: 'var(--text-primary)' }}>{tugas.alamat_lokasi}</p>
            {tugas.latitude && tugas.longitude && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Koordinat GPS: {tugas.latitude}, {tugas.longitude}
              </p>
            )}
          </div>

          {/* Jika Sudah Selesai: Tampilkan Before & After */}
          {currentStatus === 'selesai' && (
            <div style={{ marginTop: '2rem', borderTop: '2px dashed var(--border)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--success)' }}>
                Perbandingan Sebelum & Sesudah Perbaikan (Before & After)
              </h3>

              <div className={styles.beforeAfterGrid}>
                <div className={styles.photoCard}>
                  <div className={styles.photoCardTitle}>Kondisi Awal (Aduan Warga)</div>
                  {tugas.foto_url ? (
                    <img src={getImageUrl(tugas.foto_url)} alt="Foto Sebelum" className={styles.photoCardImg} />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada foto awal</div>
                  )}
                </div>

                <div className={styles.photoCard}>
                  <div className={styles.photoCardTitle} style={{ color: 'var(--success)' }}>Hasil Selesai (Bukti Petugas)</div>
                  {tugas.foto_bukti_url ? (
                    <img src={getImageUrl(tugas.foto_bukti_url)} alt="Foto Selesai" className={styles.photoCardImg} />
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada foto bukti</div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: '0.5rem', color: '#166534' }}>
                <strong>Keterangan Perbaikan:</strong>
                <p style={{ marginTop: '0.25rem' }}>{tugas.keterangan_selesai || '-'}</p>
                <small style={{ color: '#15803D' }}>Diselesaikan pada: {tugas.selesai_at ? new Date(tugas.selesai_at).toLocaleString('id-ID') : '-'}</small>
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Aksi & Bukti */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Box Foto Awal (jika belum selesai) */}
          {currentStatus !== 'selesai' && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Foto Kerusakan dari Warga</h3>
              {tugas.foto_url ? (
                <img 
                  src={getImageUrl(tugas.foto_url)} 
                  alt="Kerusakan Awal" 
                  className={styles.photoPreview} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Foto+Tidak+Tersedia';
                  }}
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '0.5rem', color: 'var(--text-secondary)' }}>
                  Tidak ada foto kerusakan
                </div>
              )}
            </div>
          )}

          {/* Box Aksi Petugas */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Tindakan Petugas</h3>

            {/* Status 1: Ditugaskan */}
            {currentStatus === 'ditugaskan' && (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  Tugas ini baru saja dialokasikan oleh Admin. Klik tombol di bawah saat Anda siap berangkat/mulai pengerjaan di lapangan.
                </p>
                <button 
                  onClick={handleMulaiKerjakan} 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.85rem' }}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Memproses...' : 'Mulai Kerjakan Tugas Ini'}
                </button>
              </div>
            )}

            {/* Status 2: Sedang Dikerjakan */}
            {currentStatus === 'dikerjakan' && (
              <form onSubmit={handleSelesaikanTugas}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Ambil foto bukti penyelesaian langsung dari kamera untuk menyelesaikan tugas ini.
                </p>

                {/* Live Camera / Preview Box */}
                <div className={styles.cameraBox}>
                  {isCameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className={styles.videoPreview} />
                      <div style={{ position: 'absolute', bottom: '10px', display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={captureSnapshot} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                          Ambil Foto
                        </button>
                        <button type="button" onClick={stopCamera} className="btn" style={{ background: '#334155', color: 'white', padding: '0.5rem 1rem' }}>
                          Batal
                        </button>
                      </div>
                    </>
                  ) : photoPreviewUrl ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <img src={photoPreviewUrl} alt="Hasil Foto Bukti" className={styles.photoPreview} />
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                        <button type="button" onClick={() => { setCapturedPhoto(null); setPhotoPreviewUrl(''); startCamera(); }} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          Foto Ulang
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                      <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Belum ada foto bukti diambil</p>
                      <button type="button" onClick={startCamera} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                        Buka Kamera Sistem
                      </button>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{cameraError}</p>
                )}

                {/* Fallback input jika akses kamera desktop/laptop tanpa webcam */}
                <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
                  <label htmlFor="fileKamera" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Atau gunakan kamera ponsel/file:
                  </label>
                  <input 
                    type="file" 
                    id="fileKamera" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={handleFileInputChange} 
                    className="form-control" 
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="keterangan">Keterangan Hasil Perbaikan</label>
                  <textarea 
                    id="keterangan" 
                    rows="3" 
                    className="form-control" 
                    value={keterangan} 
                    onChange={(e) => setKeterangan(e.target.value)} 
                    placeholder="Contoh: Lampu jalan rusak telah diganti bohlam LED baru dan tiang telah dikencangkan."
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn" 
                  style={{ width: '100%', background: 'var(--success)', color: 'white', padding: '0.85rem' }}
                  disabled={actionLoading || !capturedPhoto}
                >
                  {actionLoading ? 'Mengirim Bukti...' : 'Kirim Laporan & Selesaikan Tugas'}
                </button>
              </form>
            )}

            {/* Status 3: Selesai */}
            {currentStatus === 'selesai' && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '0.5rem' }}>✓</div>
                <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Tugas Telah Selesai</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Terima kasih atas kerja keras Anda. Laporan perbaikan ini telah dikonfirmasi dan statusnya dapat dilihat oleh warga maupun pihak kelurahan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTugas;
