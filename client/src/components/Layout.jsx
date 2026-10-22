import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className="container" style={{ flex: 1, padding: '2rem 1rem' }}>
        <Outlet />
      </main>
      <footer style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1.5rem 0', textAlign: 'center', marginTop: 'auto' }}>
        <div className="container">
          <p>&copy; 2026 LaporWarga. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
