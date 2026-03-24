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
    <div className="login-page-v2">
      <div className="login-hero-panel">
        <div className="hero-image-container">
          <div className="hero-content">
            <h2 className="hero-title">Reimagine Your Space</h2>
            <p className="hero-description">Join DecoraAI to generate stunning 3D models and discover interior designs perfectly suited for your home.</p>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <motion.div className="login-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="login-brand-header">
            <div className="brand-logo-icon">
               <Box size={28} color="white" />
            </div>
            <span className="brand-name-text">DecoraAI</span>
          </div>

          <h1 className="welcome-text">Welcome</h1>
          <p className="subtitle-text">Get started by signing in to your account</p>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="google-auth-button"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 24 }} />
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <p className="legal-footer">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
