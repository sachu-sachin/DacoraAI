import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Bell, LogOut, Package } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your profile and application preferences.</p>
      </header>

      <section className="settings-card" style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--bg-input)', border: '2px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={32} color="var(--accent-blue)" />
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.25rem' }}>{user?.user_metadata?.full_name || 'Designer'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Member since {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <Mail size={18} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</div>
              <div style={{ color: 'white', wordBreak: 'break-all' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <Shield size={18} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Type</div>
              <div style={{ color: 'white' }}>Free Tier (Standard AI Models)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <Package size={18} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Storage Usage</div>
              <div style={{ color: 'white' }}>24.5 MB of 500 MB used</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        <button onClick={handleLogout} className="btn-secondary" style={{ flex: 1, minWidth: '200px', justifyContent: 'center', gap: '8px', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </section>

      <footer style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>DecoraAI v2.4.0 — Powered by Supabase & Gemini</p>
      </footer>
    </div>
  );
}
