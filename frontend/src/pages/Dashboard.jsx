import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Box } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [recentDesigns, setRecentDesigns] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/designs')
      .then(res => res.json())
      .then(data => setRecentDesigns(data.designs || []))
      .catch(err => console.error(err));
  }, []);

  const handleStartProject = () => {
    navigate('/design', { state: { initialPrompt: prompt } });
  };

  return (
    <div className="page-container">
      {/* Top CTA Banner */}
      <div style={{ backgroundColor: '#1a2235', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', marginBottom: '3rem', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Create Your Dream Space</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Start a new project by describing your room or uploading a photo.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>
          <input 
             type="text" 
             value={prompt}
             onChange={e => setPrompt(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleStartProject()}
             placeholder="Describe your room or upload a photo..." 
             style={{ backgroundColor: '#151b29', border: '1px solid var(--border-color)', color: 'white', padding: '12px 16px', flex: 1, borderRadius: '8px' }}
          />
          <button className="btn-primary" onClick={handleStartProject} style={{ whiteSpace: 'nowrap' }}>
            Start Project
          </button>
        </div>
      </div>

      {/* Continue Your Work (Fetched from DB) */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 className="section-title">Continue Your Work</h3>
        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {recentDesigns.length > 0 ? (
            recentDesigns.map((item, i) => (
              <div key={i} style={{ minWidth: '240px', cursor: 'pointer' }} onClick={() => navigate('/ar-view', { state: { prompt: item.prompt } })}>
                <div style={{ 
                  width: '100%', height: '140px', 
                  backgroundColor: '#151b29', 
                  borderRadius: '12px', marginBottom: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden'
                 }}>
                  {(item.thumbnail || item.modelUrl) ? (
                    <img src={item.thumbnail || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=250&fit=crop'} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <Box size={32} color="var(--text-muted)" />}
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.prompt || "Untitled Project"}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No recent projects found. Start above!</p>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>
        {/* Left Column Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/design')}>
             <div style={{ width: 40, height: 40, backgroundColor: 'rgba(37, 99, 235, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
               <Sparkles color="var(--accent-blue)" size={20} />
             </div>
             <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>AI Design Assistant</h4>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
               Get instant design suggestions and chat with our creative AI.
             </p>
             <span style={{ color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: 500 }}>Start Chatting →</span>
           </div>

           <div className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/library')}>
             <div style={{ width: 40, height: 40, backgroundColor: 'rgba(37, 99, 235, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
               <Box color="var(--accent-blue)" size={20} />
             </div>
             <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>3D Model Library</h4>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
               Explore thousands of 3D models of furniture and decor items.
             </p>
             <span style={{ color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: 500 }}>Browse Library →</span>
           </div>
        </div>

        {/* Right Column Inspiration */}
        <div>
          <h3 className="section-title">Get Inspired</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             {[
               { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop', title: 'Minimalist Living Rooms' },
               { img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop', title: 'Bohemian Bedrooms' },
               { img: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=500&h=300&fit=crop', title: 'Modern Kitchens' },
               { img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&h=300&fit=crop', title: 'Scandinavian Dining' }
             ].map((insp, i) => (
               <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                 <img src={insp.img} style={{ width: '100%', height: '160px', objectFit: 'cover' }} alt={insp.title} />
                 <div style={{ padding: '12px 4px', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{insp.title}</div>
               </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
}
