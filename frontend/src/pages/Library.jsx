import { useState, useEffect } from 'react';
import { Search, ChevronDown, Heart, Plus, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Library() {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/designs` : 'http://localhost:5000/api/designs')
      .then(res => res.json())
      .then(data => setModels(data.designs || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="title" style={{ margin: 0 }}>My 3D Model Library</h2>
        <button onClick={() => navigate('/design')} className="btn-primary flex-center" style={{ gap: '0.5rem' }}>
          <Plus size={18} /> Add New Model
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder="Search by name, style, or room..."
          style={{ paddingLeft: '48px', backgroundColor: 'var(--bg-panel)' }} 
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button className="btn-secondary flex-center" style={{ padding: '8px 14px', gap: '6px', flexShrink: 0 }}>
          Room Type <ChevronDown size={15} />
        </button>
        <button className="btn-secondary flex-center" style={{ padding: '8px 14px', gap: '6px', flexShrink: 0 }}>
          Style <ChevronDown size={15} />
        </button>
        <button className="btn-secondary flex-center" style={{ padding: '8px 14px', gap: '6px', flexShrink: 0 }}>
          Date Created <ChevronDown size={15} />
        </button>
        <button className="btn-secondary flex-center" style={{ padding: '8px 14px', gap: '6px', flexShrink: 0, color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}>
          <Heart size={15} fill="var(--accent-blue)" /> My Favorites
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {models.map((model, i) => (
          <div key={i} style={{ cursor: 'pointer' }} onClick={() => navigate('/ar-view', { state: { prompt: model.prompt } })}>
            <div style={{ 
               backgroundColor: '#151b29', 
               borderRadius: '16px', 
               overflow: 'hidden', 
               marginBottom: '1rem',
               height: '240px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               border: '1px solid var(--border-color)'
            }}>
              {(model.thumbnail || model.modelUrl) ? (
                <img src={model.thumbnail || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop'} alt={model.prompt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <Box size={32} color="var(--text-muted)" />}
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.prompt || "Generated Model"}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(model.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {models.length === 0 && (
           <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No models generated yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
