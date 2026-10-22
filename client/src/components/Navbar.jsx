import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHomeLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'petugas') return '/petugas/dashboard';
    return '/masyarakat/dashboard';
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link to={getHomeLink()} className={styles.brand}>LaporWarga</Link>
        
        <div className={styles.navLinks}>
          {!user ? (
            <>
              <Link to="/login" className={styles.link}>Masuk</Link>
              <Link to="/register" className={`btn btn-primary ${styles.btnRegister}`}>Daftar</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className={styles.link}>Dashboard</Link>
                  <Link to="/admin/laporan" className={styles.link}>Laporan</Link>
                  <Link to="/admin/petugas" className={styles.link}>Petugas</Link>
                  <Link to="/admin/kategori" className={styles.link}>Kategori</Link>
                </>
              )}

              {user.role === 'masyarakat' && (
                <>
                  <Link to="/masyarakat/dashboard" className={styles.link}>Dashboard</Link>
                  <Link to="/masyarakat/laporan/baru" className={styles.link}>Buat Laporan</Link>
                </>
              )}

              {user.role === 'petugas' && (
                <>
                  <Link to="/petugas/dashboard" className={styles.link}>Tugas Saya</Link>
                </>
              )}

              <span className={styles.greeting} style={{ marginLeft: '0.5rem' }}>
                Halo, {user.nama_lengkap || user.nama}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn" 
                style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                Keluar
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
