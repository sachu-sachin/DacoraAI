import { useState, useRef, useEffect, Suspense } from 'react';
import { Move, RotateCcw, Maximize, Trash2, Box, MessageSquare, Settings, User, Image, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html, Center, PivotControls, ContactShadows } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';

// Initialize WebXR store globally outside component
// Note: We removed the 'hit-test' required feature because the WebXR API Emulator 
// Chrome extension crashes on newer versions of Three.js when trying to build its hit-test UI.
const xrStore = createXRStore();

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2} />;
}

function Loader() {
  return (
    <Html center>
      <div style={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', backgroundColor: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '8px' }}>
        Loading Tripo3D Model...
      </div>
    </Html>
  );
}

export default function ARView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [modelUrl, setModelUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const videoRef = useRef(null);
  
  const prompt = location.state?.prompt || "Standard Object";

  useEffect(() => {
    // Start Live Camera Background
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable', err);
      }
    };
    startCamera();

    return () => {
      // Cleanup camera on exit
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Poll the real backend to generate via Tripo3D
    const fetchModel = async () => {
      try {
        setIsGenerating(true);
        const response = await fetch('http://localhost:5000/api/ai/generate-3d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (data.success) {
          setModelUrl(data.modelUrl);
        }
      } catch (e) {
        console.error("Backend error:", e);
        setModelUrl('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb');
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
      await fetch('http://localhost:5000/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      alert('Snapshot captured and saved to project!');
    } catch (err) {
      console.log('Failed to save to backend', err);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#111', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      
      {/* Live Camera Feed Background */}
      <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />

      {/* Top Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 32, height: 32, backgroundColor: 'var(--accent-blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Box size={20} color="white" />
          </div>
          AR Design Studio
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
             onClick={async () => {
               try {
                 await xrStore.enterAR();
               } catch (e) {
                 console.warn("XR Session warning:", e);
                 if (e.name === 'InvalidStateError') {
                   alert("AR session is already active or finishing shutting down. Please wait a moment.");
                 } else if (e.name === 'NotSupportedError') {
                   alert("Your current device or browser does not support WebXR natively. Download the WebXR Emulator extension or try on a mobile phone!");
                 }
               }
             }}
             className="btn-primary" 
             style={{
               background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
               color: 'white',
               padding: '10px 20px',
               borderRadius: '8px',
               border: 'none',
               fontWeight: 600,
               cursor: 'pointer'
             }}
          >
            Enter WebXR (Device Only)
          </button>
          <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ backgroundColor: 'var(--accent-blue)', padding: '10px 20px' }}>
            Exit AR Mode
          </button>
          <button style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} color="white" />
          </button>
          <button style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={20} color="white" />
          </button>
          <button style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="#0f141e" />
          </button>
        </div>
      </div>

      {/* Left Sidebar Overlay */}
      <div style={{ position: 'absolute', top: '90px', left: 0, bottom: 0, width: '280px', backgroundColor: 'rgba(22, 27, 38, 0.85)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '2rem', zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-blue)', gap: '8px', marginBottom: '2rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Chat
        </button>
        
        <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Object Library</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Drag to place items</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
             <Box size={20} /> Generating: {prompt}
          </div>
          <div style={{ padding: '14px 16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
             <Box size={20} /> Tables
          </div>
          <div style={{ padding: '14px 16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
             <Box size={20} /> Lamps
          </div>
        </div>
      </div>

      {isGenerating && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, color: 'white', fontSize: '1.5rem', fontWeight: 600, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          Contacting Tripo3D API... This may take up to 30-60 seconds.
        </div>
      )}

      {/* 3D Canvas rendering the Tripo3D Model */}
      <div id="canvas-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
          <XR store={xrStore}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
            <Suspense fallback={<Loader />}>
              <Center>
                {modelUrl && (
                  <PivotControls 
                    activeAxes={[true, true, true]} 
                    scale={1.5} 
                    anchor={[0, -1, 0]}
                    depthTest={false}
                    lineWidth={4}
                    axisColors={['#ff4a4a', '#2ca47e', '#3b82f6']}
                  >
                    <Model url={modelUrl} />
                  </PivotControls>
                )}
                {/* Surface Environment Shadow Catcher - anchors to detected floor */}
                <ContactShadows position={[0, -1.05, 0]} opacity={0.65} scale={10} blur={2.5} far={4} />
              </Center>
            </Suspense>
            <OrbitControls makeDefault />
          </XR>
        </Canvas>
      </div>

      {/* Center 3D Object Overlay mockup (over canvas) */}
      <div style={{ pointerEvents: 'none', position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
         <div style={{ pointerEvents: 'auto', padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderRadius: '12px', display: 'flex', gap: '16px', marginBottom: '1rem' }}>
            <Move size={20} color="white" style={{ cursor: 'pointer' }} />
            <RotateCcw size={20} color="white" style={{ cursor: 'pointer' }} />
            <Maximize size={20} color="white" style={{ cursor: 'pointer' }} />
            <Trash2 size={20} color="#ff4a4a" style={{ cursor: 'pointer' }} />
         </div>
      </div>

      {/* Bottom Suggestions Carousel */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '320px', right: '180px', display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', zIndex: 10 }}>
        {[
          { title: 'Minimalist Living', sub: 'Suggestion 1', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&h=200&fit=crop', active: true },
          { title: 'Bohemian Corner', sub: 'Suggestion 2', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop' },
          { title: 'Industrial Loft', sub: 'Suggestion 3', img: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=300&h=200&fit=crop' },
          { title: 'Scandi Chic', sub: 'Suggestion 4', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&h=200&fit=crop' }
        ].map((item, i) => (
          <div key={i} style={{ minWidth: '220px', height: '140px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: item.active ? '3px solid var(--accent-blue)' : 'none' }}>
            <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Capture button bottom right */}
      <button onClick={captureSnapshot} className="btn-primary" style={{ position: 'absolute', bottom: '2rem', right: '3rem', borderRadius: '30px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', zIndex: 10 }}>
        <Image size={18} /> Capture Canvas
      </button>

    </div>
  );
}
