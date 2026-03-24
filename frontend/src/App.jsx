import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DesignInput from './pages/DesignInput';
import Library from './pages/Library';
import Login from './pages/Login';
import ARView from './pages/ARView';
import Settings from './pages/Settings';
import { useAuth } from './context/AuthContext';
import { LayoutDashboard, MessageSquare, Box, Settings as SettingsIcon, Search, Bell } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', color: 'white' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthPage = location.pathname === '/login';
  const isARView = location.pathname === '/ar-view';

  if (isAuthPage || isARView || !user) {
    return children;
  }

  const pageTitle = {
    '/dashboard': '♥ Welcome back!',
    '/library': 'My 3D Model Library',
    '/design': 'AI Design Assistant',
    '/settings': 'Account Settings',
  }[location.pathname] || '';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.95rem' }}>
            <span>{pageTitle}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="search-bar">
              <Search size={15} color="var(--text-muted)" />
              <input type="text" placeholder="Search..." />
            </div>
            <button style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={17} color="var(--text-secondary)" />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ height: '100vh', backgroundColor: '#0d1117' }}></div>;

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/design" element={
            <ProtectedRoute>
              <DesignInput />
            </ProtectedRoute>
          } />
          
          <Route path="/library" element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="/ar-view" element={
            <ProtectedRoute>
              <ARView />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
