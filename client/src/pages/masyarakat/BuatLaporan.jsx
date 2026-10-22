import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import styles from './masyarakat.module.css';

// Fix leaflet icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Komponen untuk menangani klik pada peta
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const BuatLaporan = () => {
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori_id: '',
    alamat_lokasi: '',
  });
  const [kategoriList, setKategoriList] = useState([]);
  const [foto, setFoto] = useState(null);
  const [position, setPosition] = useState(null); // { lat, lng }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil daftar kategori dari API
    const fetchKategori = async () => {
      try {
        const response = await api.get('/pengaduan/kategori');
        // Asumsikan response.data.data berisi array kategori
        setKategoriList(response.data.data || response.data || []);
      } catch (err) {
        console.error('Gagal mengambil kategori', err);
      }
    };
    fetchKategori();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!position) {
      setError('Silakan pilih lokasi pada peta');
      return;
    }
    if (!foto) {
      setError('Silakan unggah foto bukti laporan');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('judul', formData.judul);
      submitData.append('deskripsi', formData.deskripsi);
      submitData.append('kategori_id', formData.kategori_id);
      submitData.append('alamat_lokasi', formData.alamat_lokasi);
      submitData.append('latitude', position.lat);
      submitData.append('longitude', position.lng);
      submitData.append('foto', foto);

      await api.post('/pengaduan', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/masyarakat/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengirim laporan');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultCenter = { lat: -6.200000, lng: 106.816666 }; // Jakarta default

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Buat Laporan Baru</h1>
        <button onClick={() => navigate(-1)} className="btn" style={{ border: '1px solid var(--border)' }}>Kembali</button>
      </div>

      <div className="card">
        {error && <div style={{ backgroundColor: '#FEF2F2', color: 'var(--danger)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #FECACA' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={`form-group ${styles.fullWidth}`}>
            <label htmlFor="judul">Judul Laporan</label>
            <input
              type="text"
              id="judul"
              name="judul"
              className="form-control"
              value={formData.judul}
              onChange={handleChange}
              required
              placeholder="Contoh: Jalan berlubang di Jalan Sudirman"
            />
          </div>

          <div className={`form-group ${styles.fullWidth}`}>
            <label htmlFor="deskripsi">Deskripsi Detail</label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              className="form-control"
              value={formData.deskripsi}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Jelaskan secara rinci mengenai masalah yang dilaporkan"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="kategori_id">Kategori</label>
            <select
              id="kategori_id"
              name="kategori_id"
              className="form-control"
              value={formData.kategori_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="foto">Unggah Foto Bukti</label>
            <input
              type="file"
              id="foto"
              name="foto"
              className="form-control"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className={`form-group ${styles.fullWidth}`}>
            <label>Lokasi pada Peta (Klik untuk menandai)</label>
            <div className={styles.mapContainer}>
              <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            {position && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Koordinat: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div className={`form-group ${styles.fullWidth}`}>
            <label htmlFor="alamat_lokasi">Alamat Lokasi (Manual)</label>
            <input
              type="text"
              id="alamat_lokasi"
              name="alamat_lokasi"
              className="form-control"
              value={formData.alamat_lokasi}
              onChange={handleChange}
              required
              placeholder="Detail alamat, cth: Dekat minimarket X, RT 01/RW 02"
            />
          </div>

          <div className={styles.fullWidth} style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', width: '100%', fontSize: '1.1rem' }} disabled={isLoading}>
              {isLoading ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuatLaporan;
