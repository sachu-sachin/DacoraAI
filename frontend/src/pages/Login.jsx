import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Eye } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', height: '100dvh', backgroundColor: '#0d1117' }}>
      {/* Left Image Section - hidden on mobile via CSS */}
      <div
        className="login-hero"
        style={{
          flex: '0.9',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          position: 'relative',
          height: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundImage: 'url("https://images.unsplash.com/photo-1595526114101-23b5bf598bef?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '3rem 2rem',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            color: 'white'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reimagine Your Space with AI</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: '80%' }}>
              Generate stunning 3D models and discover designs perfectly suited for your home.
            </p>
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="login-form-wrapper" style={{ flex: '1.1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
        <motion.div
          style={{ width: '100%', maxWidth: '380px' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', fontWeight: 700, fontSize: '1.25rem' }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent-blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Box size={20} color="white" />
            </div>
            DecoraAI
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Log in to continue to DecoraAI</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 500 }}>Email Address</label>
              <input type="email" placeholder="you@example.com" required style={{ backgroundColor: '#161b26' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" placeholder="Enter your password" required style={{ backgroundColor: '#161b26', paddingRight: '40px' }} />
                <Eye size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
              </div>
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <Link to="#" style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot Password?</Link>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
              Log In
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 12px' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
               <button type="button" className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 18 }} />
                 Google
               </button>
               <button type="button" className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                 Apple
               </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Don't have an account? <Link to="#" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Sign up</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
