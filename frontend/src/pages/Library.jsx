import { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronDown, Heart, Plus, Box, Clock, SortAsc, SortDesc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAVORITES_KEY = 'decoraai_favorites';

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch { return []; }
}

export default function Library() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [showFavs, setShowFavs] = useState(false);
  const [favorites, setFavorites] = useState(getFavorites);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/designs?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => setModels(data.designs || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    const updated = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const displayed = useMemo(() => {
    let list = [...models];
    if (search.trim()) {
      list = list.filter(m => m.prompt?.toLowerCase().includes(search.toLowerCase()));
    }
    if (showFavs) {
      list = list.filter(m => favorites.includes(m.id));
    }
    list.sort((a, b) => {
      const da = new Date(a.created_at), db = new Date(b.created_at);
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return list;
  }, [models, search, sortOrder, showFavs, favorites]);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="title" style={{ margin: 0 }}>My 3D Model Library</h2>
        <button onClick={() => navigate('/design')} className="btn-primary flex-center" style={{ gap: '0.5rem' }}>
          <Plus size={18} /> Add New Model
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or prompt..."
          style={{ paddingLeft: '48px', backgroundColor: 'var(--bg-panel)' }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')}
          className="btn-secondary flex-center"
          style={{ padding: '8px 14px', gap: '6px', flexShrink: 0 }}
        >
          {sortOrder === 'newest' ? <SortDesc size={15} /> : <SortAsc size={15} />}
          {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
        </button>
        <button
          onClick={() => setShowFavs(v => !v)}
          className="btn-secondary flex-center"
          style={{ padding: '8px 14px', gap: '6px', flexShrink: 0, color: showFavs ? 'var(--accent-blue)' : undefined, borderColor: showFavs ? 'var(--accent-blue)' : undefined }}
        >
          <Heart size={15} fill={showFavs ? 'var(--accent-blue)' : 'none'} color={showFavs ? 'var(--accent-blue)' : 'currentColor'} />
          Favorites {showFavs && `(${displayed.length})`}
        </button>
        {(search || showFavs) && (
          <button onClick={() => { setSearch(''); setShowFavs(false); }} className="btn-secondary" style={{ padding: '8px 14px', flexShrink: 0 }}>
            Clear filters
          </button>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center', marginLeft: 'auto' }}>
          {displayed.length} model{displayed.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading your models...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {displayed.map((model) => (
            <div
              key={model.id}
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => navigate('/ar-view', { state: { prompt: model.prompt, modelUrl: model.model_url, fromLibrary: true } })}
            >
              <div style={{
                backgroundColor: '#151b29',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '0.75rem',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
                position: 'relative'
              }}>
                <Box size={32} color="var(--text-muted)" />
                {/* Favorite button */}
                <button
                  onClick={(e) => toggleFavorite(e, model.id)}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(0,0,0,0.5)', border: 'none',
                    borderRadius: '50%', width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Heart
                    size={15}
                    fill={favorites.includes(model.id) ? '#f87171' : 'none'}
                    color={favorites.includes(model.id) ? '#f87171' : 'white'}
                  />
                </button>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
                {model.prompt || 'Generated Model'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {formatDate(model.created_at)}
              </p>
            </div>
          ))}
          {displayed.length === 0 && (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              {search || showFavs ? 'No models match your filters.' : 'No models generated yet. Create one!'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
