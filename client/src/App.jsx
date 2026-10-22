import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Masyarakat Pages
import DashboardMasyarakat from './pages/masyarakat/Dashboard';
import BuatLaporan from './pages/masyarakat/BuatLaporan';
import DetailLaporan from './pages/masyarakat/DetailLaporan';

// Admin Pages
import DashboardAdmin from './pages/admin/Dashboard';
import KelolaLaporan from './pages/admin/KelolaLaporan';
import DetailLaporanAdmin from './pages/admin/DetailLaporanAdmin';
import KelolaPetugas from './pages/admin/KelolaPetugas';
import KelolaKategori from './pages/admin/KelolaKategori';

// Petugas Pages
import DashboardPetugas from './pages/petugas/Dashboard';
import DetailTugas from './pages/petugas/DetailTugas';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Masyarakat Routes */}
        <Route 
          path="masyarakat/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['masyarakat']}>
              <DashboardMasyarakat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="masyarakat/laporan/baru" 
          element={
            <ProtectedRoute allowedRoles={['masyarakat']}>
              <BuatLaporan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="masyarakat/laporan/:id" 
          element={
            <ProtectedRoute allowedRoles={['masyarakat']}>
              <DetailLaporan />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/laporan" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <KelolaLaporan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/laporan/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DetailLaporanAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/petugas" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <KelolaPetugas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/kategori" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <KelolaKategori />
            </ProtectedRoute>
          } 
        />

        {/* Petugas Routes */}
        <Route 
          path="petugas/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['petugas']}>
              <DashboardPetugas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="petugas/tugas/:id" 
          element={
            <ProtectedRoute allowedRoles={['petugas']}>
              <DetailTugas />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default App;
