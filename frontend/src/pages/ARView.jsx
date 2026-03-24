import { useState, useRef, useEffect, Suspense } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Move, RotateCcw, Maximize, Trash2, Box, MessageSquare, Settings, User, Image, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html, Center, PivotControls, ContactShadows } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';

const xrStore = createXRStore();

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2} />;
}

function Loader() {
  return (
    <Html center>
      <div style={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', backgroundColor: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '8px' }}>
        Loading Model...
      </div>
    </Html>
  );
}

export default function ARView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();   // ← Hooks must be at component level
  const [modelUrl, setModelUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const videoRef = useRef(null);
  
  const [prompt, setPrompt] = useState(location.state?.prompt || "Standard Object");
  // 'idle' | 'requesting' | 'active' | 'denied' | 'notfound' | 'https'
  const [cameraState, setCameraState] = useState('idle');
  const [cameraError, setCameraError] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [modelRotation, setModelRotation] = useState([0, 0, 0]);
  const [modelScale, setModelScale] = useState(1.0);

  // Prompt → matching demo GLB when Tripo has no credits
  const DEMO_MODELS = {
    chair:  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
    table:  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
    lamp:   'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb',
    default: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
  };

  const getDemoModel = (p) => {
    const lower = p.toLowerCase();
    if (lower.includes('table') || lower.includes('desk')) return DEMO_MODELS.table;
    if (lower.includes('lamp') || lower.includes('light')) return DEMO_MODELS.lamp;
    return DEMO_MODELS.chair;
  };

  const SUGGESTIONS = [
    { title: 'Minimalist Living', sub: 'Suggestion 1', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop' },
    { title: 'Bohemian Corner', sub: 'Suggestion 2', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop' },
    { title: 'Industrial Loft', sub: 'Suggestion 3', img: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200&h=800&fit=crop' },
    { title: 'Scandi Chic', sub: 'Suggestion 4', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=800&fit=crop' }
  ];

  // Called when user taps the "Allow Camera" button
  const requestCamera = async () => {
    setCameraState('requesting');
    try {
      // Check if we're on HTTP (non-localhost) — camera blocked by browsers
      const isInsecure = location.protocol === 'http:' && !location.hostname.includes('localhost') && location.hostname !== '127.0.0.1';
      if (isInsecure) {
        setCameraState('https');
        setCameraError(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraState('active');
      setCameraError(false);
    } catch (err) {
      console.warn('Camera error:', err.name, err.message);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('notfound');
      } else {
        setCameraState('denied');
      }
      setCameraError(true);
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera on mount
  useEffect(() => {
    requestCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch 3D model whenever prompt changes
  useEffect(() => {
    const fetchModel = async () => {
      try {
        if (!user) return;
        setIsGenerating(true);
        const response = await fetch(`${API_BASE_URL}/api/ai/generate-3d`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, user_id: user.id })
        });
        const data = await response.json();
        if (data.success) {
          setModelUrl(data.modelUrl);
        } else {
          console.warn('Tripo API error, using demo model:', data.error);
          setModelUrl(getDemoModel(prompt));
        }
      } catch (e) {
        console.error("Backend error:", e);
        setModelUrl(getDemoModel(prompt));
      } finally {
        setIsGenerating(false);
      }
    };
    
    fetchModel();
  }, [prompt]);


  const captureSnapshot = async () => {
    const canvas = document.querySelector('#canvas-container canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `DecoraAI_Snapshot_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    try {
      await fetch(`${API_BASE_URL}/api/screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
    } catch (err) {
      console.log('Failed to save to backend', err);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', backgroundColor: '#111', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      
      {/* === BACKGROUND LAYER === */}
      {/* Always render the video (hidden until stream starts) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
          display: cameraError ? 'none' : 'block'
        }}
      />

      {/* Camera blocked — show context-aware permission prompt */}
      {cameraError && (() => {
        const configs = {
          denied: {
            icon: '🔒',
            title: 'Camera Permission Denied',
            body: 'Your browser blocked camera access. To fix this:',
            steps: ['Click the 🔒 lock icon in your address bar', 'Set Camera → Allow', 'Then tap Retry below'],
            btnLabel: '🔄 Retry Camera',
            btnAction: requestCamera,
          },
          notfound: {
            icon: '📷',
            title: 'No Camera Found',
            body: 'No camera device was detected on this device.',
            steps: ['Make sure a camera is connected', 'Check that no other app is using it'],
            btnLabel: '🔄 Try Again',
            btnAction: requestCamera,
          },
          https: {
            icon: '🔐',
            title: 'HTTPS Required',
            body: 'Browsers only allow camera on secure (HTTPS) connections.',
            steps: ['Access via localhost:5173 on this PC, OR', 'Deploy to HTTPS to use on mobile'],
            btnLabel: '📺 Use Demo Mode',
            btnAction: () => setCameraError(false),
          },
          requesting: {
            icon: '⏳',
            title: 'Requesting Camera…',
            body: 'Please allow camera access in your browser popup.',
            steps: [],
            btnLabel: null,
            btnAction: null,
          },
        };
        const cfg = configs[cameraState] || configs.denied;
        return (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, overflow: 'hidden' }}>
            <img src={SUGGESTIONS[selectedRoomId].img} alt="Room bg" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px) brightness(0.3)', transform: 'scale(1.05)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white', padding: '2rem', backgroundColor: 'rgba(10,13,20,0.92)', borderRadius: '20px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', maxWidth: '360px', width: '90%' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{cfg.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{cfg.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: cfg.steps.length ? '0.75rem' : '1.5rem', lineHeight: 1.6 }}>{cfg.body}</p>
              {cfg.steps.length > 0 && (
                <ol style={{ textAlign: 'left', fontSize: '0.83rem', color: 'rgba(255,255,255,0.75)', lineHeight: 2, paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
                  {cfg.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              )}
              {cfg.btnLabel && (
                <button onClick={cfg.btnAction} className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '1rem' }}>
                  {cfg.btnLabel}
                </button>
              )}
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>3D models still load in demo mode</p>
            </div>
          </div>
        );
      })()}


      {/* Top Header */}
      <div className="ar-header">
        <div className="ar-header-brand">
          <div style={{ width: 30, height: 30, backgroundColor: 'var(--accent-blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <Box size={18} color="white" />
          </div>
          <span style={{ display: 'none' }} className="mobile-hidden">AR Design Studio</span>
          <span className="mobile-shown" style={{ fontSize: '0.95rem' }}>AR Studio</span>
        </div>

        <div className="ar-header-actions">
          <button 
             onClick={async () => {
               try {
                 await xrStore.enterAR();
               } catch (e) {
                 if (e.name === 'InvalidStateError') {
                   alert("AR session already active. Please wait.");
                 } else if (e.name === 'NotSupportedError') {
                   alert("WebXR not supported on this device/browser.");
                 }
               }
             }}
             className="btn-primary" 
             style={{
               background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
               color: 'white',
               padding: '8px 14px',
               borderRadius: '8px',
               border: 'none',
               fontWeight: 600,
               cursor: 'pointer',
               fontSize: '0.82rem'
             }}
          >
            Enter WebXR
          </button>
          <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ backgroundColor: 'var(--accent-blue)', padding: '8px 14px', fontSize: '0.82rem' }}>
            Exit AR
          </button>
          <button style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Settings size={18} color="white" />
          </button>
          <button style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={18} color="#0f141e" />
          </button>
        </div>
      </div>

      {/* Left Sidebar / Bottom Strip (mobile) */}
      <div className="ar-overlay-left">
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-blue)', gap: '6px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
          <ArrowLeft size={16} /> <span>Back</span>
        </button>
        
        <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.4rem' }}>Object Library</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>Tap to switch</p>

        <div className="ar-objects-list">
          <div
            className={`ar-object-item active`}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
             <Box size={18} /> {prompt.length > 14 ? prompt.slice(0, 14) + '…' : prompt}
          </div>
          <div
            className="ar-object-item"
            onClick={() => setPrompt("A modern table")}
            style={{ color: prompt === "A modern table" ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
          >
             <Box size={18} /> Tables
          </div>
          <div
            className="ar-object-item"
            onClick={() => setPrompt("A floor lamp")}
            style={{ color: prompt === "A floor lamp" ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
          >
             <Box size={18} /> Lamps
          </div>
        </div>
      </div>

      {isGenerating && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, color: 'white', fontSize: '1.1rem', fontWeight: 600, textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.8)', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '12px' }}>
          Contacting Tripo3D API...<br/>
          <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>This may take 30–60 seconds</span>
        </div>
      )}

      {/* === 3D CANVAS — transparent bg so camera shows through === */}
      <div id="canvas-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: modelUrl ? 'auto' : 'none' }}>
        <Canvas
          camera={{ position: [0, 1.5, 4], fov: 50 }}
          gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0); // fully transparent background
          }}
        >
          <XR store={xrStore}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
            <Suspense fallback={<Loader />}>
              <Center>
                {modelUrl && (
                  <PivotControls 
                    key={resetKey}
                    activeAxes={[true, true, true]} 
                    scale={1.5} 
                    anchor={[0, -1, 0]}
                    depthTest={false}
                    lineWidth={4}
                    axisColors={['#ff4a4a', '#2ca47e', '#3b82f6']}
                  >
                    <group rotation={modelRotation} scale={modelScale}>
                      <Model url={modelUrl} />
                    </group>
                  </PivotControls>
                )}
                <ContactShadows position={[0, -1.05, 0]} opacity={0.65} scale={10} blur={2.5} far={4} />
              </Center>
            </Suspense>
            <OrbitControls makeDefault />
          </XR>
        </Canvas>
      </div>

      {/* Center Controls Toolbar */}
      <div style={{ pointerEvents: 'none', position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
         <div style={{ pointerEvents: 'auto', padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderRadius: '12px', display: 'flex', gap: '16px' }}>
            <Move size={20} color="white" style={{ cursor: 'pointer' }} />
            <RotateCcw onClick={() => setModelRotation(r => [r[0], r[1] + Math.PI/2, r[2]])} size={20} color="white" style={{ cursor: 'pointer' }} title="Rotate 90°" />
            <Maximize onClick={() => setModelScale(s => s === 1.0 ? 1.5 : 1.0)} size={20} color="white" style={{ cursor: 'pointer' }} title="Toggle Scale" />
            <Trash2 onClick={() => setModelUrl(null)} size={20} color="#ff4a4a" style={{ cursor: 'pointer' }} title="Remove Object" />
         </div>
      </div>

      {/* Bottom Suggestions */}
      <div className="ar-bottom-suggestions">
        {SUGGESTIONS.map((item, i) => (
          <div
            key={i}
            className="ar-suggestion-card"
            onClick={() => setSelectedRoomId(i)}
            style={{ border: selectedRoomId === i ? '2px solid var(--accent-blue)' : '2px solid transparent' }}
          >
            <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.6rem 0.75rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Capture Button */}
      <button onClick={captureSnapshot} className="btn-primary ar-capture-btn">
        <Image size={16} /> <span>Capture</span>
      </button>

    </div>
  );
}
