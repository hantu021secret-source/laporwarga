import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Komponen untuk melindungi rute yang membutuhkan autentikasi
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // Menunggu pengecekan autentikasi selesai
  if (loading) {
    return <div>Loading...</div>;
  }

  // Jika belum login, arahkan ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak sesuai, arahkan ke dashboard masing-masing
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;
