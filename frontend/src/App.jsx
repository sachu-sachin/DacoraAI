import { BrowserRouter as Router, Routes, Route, useLocation, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, MessageSquare, Box, Settings, Search, Bell, Menu } from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DesignInput from './pages/DesignInput';
import Library from './pages/Library';
import ARView from './pages/ARView';

// App Layout with Sidebar and Header
function AppLayout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';
  const isARView = location.pathname === '/ar-view';

  // If it's Login or ARView (which takes full screen usually), we don't show the standard sidebar layout
  // Wait, in Fig 7, AR View took the whole room except the UI overlays. So yes.
  if (isAuthPage || isARView) {
    return children;
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
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
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <FolderOpen size={20} />
            Projects
          </NavLink>
          <NavLink to="/design" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <MessageSquare size={20} />
            AI Chat
          </NavLink>
          <NavLink to="/library" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Box size={20} />
            3D Library
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} style={{ marginTop: 'auto' }}>
            <Settings size={20} />
            Settings
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 600 }}>
            {location.pathname === '/dashboard' && "♥ Welcome back, Rathivarman!"}
            {location.pathname === '/library' && "My 3D Model Library"}
            {location.pathname === '/design' && "Living Room Reno"}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="search-bar">
              <Search size={16} color="var(--text-muted)" />
              <input type="text" placeholder="Search..." />
            </div>
            <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color="var(--text-secondary)" />
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
