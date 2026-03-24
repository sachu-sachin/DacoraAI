import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Box, Settings, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
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

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="User" />
            ) : (
              <User size={18} color="white" />
            )}
          </div>
          <div className="user-info">
            <div className="username">{user?.user_metadata?.full_name || 'Designer'}</div>
            <div className="email">{user?.email}</div>
          </div>
        </div>
        
      </div>
    </aside>
  );
}
