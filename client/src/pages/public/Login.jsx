import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './auth.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.user.role === 'petugas') {
          navigate('/petugas/dashboard');
        } else {
          navigate('/masyarakat/dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`card ${styles.authCard}`}>
        <h2 className={styles.title}>Masuk ke LaporWarga</h2>
        <p className={styles.subtitle}>Silakan masuk dengan akun Anda untuk membuat laporan</p>

        {error && <div className={styles.alertDanger}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Masukkan email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Masukkan kata sandi"
            />
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className={styles.footerText}>
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
