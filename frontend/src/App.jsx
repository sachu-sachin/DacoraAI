import { BrowserRouter as Router, Routes, Route, useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, MessageSquare, Box, Settings, Search, Bell } from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DesignInput from './pages/DesignInput';
import Library from './pages/Library';
import ARView from './pages/ARView';

function AppLayout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';
  const isARView = location.pathname === '/ar-view';

  if (isAuthPage || isARView) {
    return children;
  }

  const pageTitle = {
    '/dashboard': '♥ Welcome back!',
    '/library': 'My 3D Model Library',
    '/design': 'AI Design Assistant',
  }[location.pathname] || '';

  return (
    <div className="app-layout">
      {/* Sidebar (converts to bottom nav on mobile via CSS) */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Box size={20} color="white" />
          </div>
          DecoraAI
        </div>
        
        <nav className="nav-menu">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/design" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <MessageSquare size={20} />
            <span>AI Chat</span>
          </NavLink>
          <NavLink to="/library" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Box size={20} />
            <span>Library</span>
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="user-profile">
          <div className="avatar"></div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Rathivarman</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>User Profile</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.95rem', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pageTitle}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div className="search-bar">
              <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input type="text" placeholder="Search..." />
            </div>
            <button style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/design" element={<DesignInput />} />
          <Route path="/library" element={<Library />} />
          <Route path="/ar-view" element={<ARView />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
