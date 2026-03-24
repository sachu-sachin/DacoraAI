import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Box, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100dvh', backgroundColor: '#0d1117' }}>
      <div className="login-hero" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ position: 'relative', height: '100%', width: '100%', borderRadius: '24px', overflow: 'hidden', backgroundImage: 'url("https://images.unsplash.com/photo-1595526114101-23b5bf598bef?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '3rem' }}>
            <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 600, marginBottom: '1rem' }}>Reimagine Your Space</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px' }}>Join DecoraAI to generate stunning 3D models and discover interior designs perfectly suited for your home.</p>
          </div>
        </div>
      </div>

      <div style={{ flex: '0.8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '3rem' }}>
            <div style={{ width: 48, height: 48, background: 'var(--accent-blue)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Box size={28} color="white" />
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>DecoraAI</span>
          </div>

          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Welcome</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Get started by signing in to your account</p>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-primary" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px', 
              padding: '16px', 
              borderRadius: '14px',
              backgroundColor: 'white',
              color: '#000',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.05rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 24 }} />
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <p style={{ marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
