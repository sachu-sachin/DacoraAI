import { useState, useRef, useEffect } from 'react';
import { Send, Wand2, PlusSquare, RotateCcw, HelpCircle, Box, Sparkles, UploadCloud } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const INITIAL_MESSAGE = {
  id: 1,
  sender: 'ai',
  text: "Hello! I'm DecoraAI. Upload a photo of your room and I'll analyze it with AI to suggest furniture and design improvements. Or type a description to generate a 3D model!",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

async function analyzeImageWithGemini(base64Data, mimeType) {
  if (!GEMINI_API_KEY) {
    return "Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.";
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: { mime_type: mimeType, data: base64Data }
            },
            {
              text: `You are an expert interior designer. Analyze this room image and provide:
1. A brief analysis of the current room style, lighting, and layout
2. 3 specific furniture recommendations that would complement the space (include material, color, and style)
3. 2 design improvement suggestions

Keep your response concise, practical, and enthusiastic. Format with clear numbered sections.`
            }
          ]
        }]
      })
    }
  );
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text
    || "I couldn't analyze the image. Please try again.";
}

export default function DesignInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(location.state?.initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Session-persist messages keyed to the user
  const SESSION_KEY = `decoraai_chat_${user?.id || 'guest'}`;

  const getStoredMessages = () => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : [INITIAL_MESSAGE];
    } catch {
      return [INITIAL_MESSAGE];
    }
  };

  const [messages, setMessages] = useState(getStoredMessages);

  // Save messages to sessionStorage on every update
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    } catch { }
  }, [messages, SESSION_KEY]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMsg = (msg) => setMessages(prev => [...prev, msg]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    addMsg({ id: Date.now(), sender: 'user', text: prompt, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    const sent = prompt;
    setPrompt('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMsg({
        id: Date.now() + 1,
        sender: 'ai',
        text: `Got it! I'm ready to build a "${sent}". Click "Generate 3D Model" below to send this to Tripo3D and view it in AR!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 1000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    addMsg({ id: Date.now(), sender: 'user', isImage: true, url: objectUrl, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    setIsTyping(true);

    try {
      // Convert to base64 for Gemini
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        const analysis = await analyzeImageWithGemini(base64, mimeType);
        setIsTyping(false);
        addMsg({
          id: Date.now() + 1,
          sender: 'ai',
          text: analysis,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsTyping(false);
      addMsg({ id: Date.now() + 1, sender: 'ai', text: "Failed to analyze image. Please try again.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    }
  };

  const handleSuggest = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMsg({ id: Date.now(), sender: 'ai', text: "Based on current trends, try 'Japandi style woven accent chair' — a mix of Japanese minimalism and Scandinavian warmth. Perfect for any living room!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    }, 1000);
  };

  const handleClearChat = () => {
    const fresh = [INITIAL_MESSAGE];
    setMessages(fresh);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh)); } catch { }
  };

  const handleGenerate = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user' && !m.isImage);
    const targetPrompt = prompt || (lastUserMsg ? lastUserMsg.text : 'A modern chair');
    navigate('/ar-view', { state: { prompt: targetPrompt } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - var(--header-height))' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
          Session chat — messages saved until you close the tab
        </span>
        <button onClick={handleClearChat} title="Clear chat" style={{ width: 36, height: 36, backgroundColor: 'var(--bg-panel)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RotateCcw size={16} color="var(--text-secondary)" />
        </button>
        <button style={{ width: 36, height: 36, backgroundColor: 'var(--bg-panel)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HelpCircle size={16} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="chat-area" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 5%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: '0.75rem', alignItems: 'flex-start' }}>
            {msg.sender === 'ai' && (
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#2ca47e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Box size={18} color="white" />
              </div>
            )}
            {msg.sender === 'user' ? (
              <div style={{ backgroundColor: 'var(--accent-blue)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '16px', borderTopRightRadius: 0, maxWidth: '80%', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {msg.isImage ? <img src={msg.url} alt="Uploaded Room" style={{ maxWidth: '100%', borderRadius: 8 }} /> : msg.text}
              </div>
            ) : (
              <div style={{ flex: 1, maxWidth: '80%' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <strong style={{ fontSize: '0.9rem', color: 'white' }}>DecoraAI</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{msg.time}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              </div>
            )}
            {msg.sender === 'user' && (
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <strong style={{ color: 'white', fontSize: '0.9rem' }}>U</strong>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#2ca47e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Box size={18} color="white" />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              {GEMINI_API_KEY ? 'Analyzing with Gemini AI...' : 'DecoraAI is thinking...'}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area" style={{ padding: '1rem 5%', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: 'var(--bg-input)', borderRadius: 12, border: '1px solid var(--border-color)', padding: '8px 14px', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe furniture to generate, or upload a room photo for AI analysis..."
            style={{ backgroundColor: 'transparent', border: 'none', flex: 1, padding: '6px 0', color: 'white', outline: 'none', fontSize: '0.92rem' }}
          />
          <button onClick={handleSend} style={{ backgroundColor: 'var(--accent-blue)', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', border: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={15} color="white" />
          </button>
        </div>
        <div className="chat-action-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleGenerate} className="btn-secondary flex-center" style={{ gap: 6, padding: '9px 14px', cursor: 'pointer', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', flex: '1 1 auto', fontSize: '0.88rem' }}>
            <Wand2 size={15} /> Generate 3D Model
          </button>
          <button onClick={handleSuggest} className="btn-secondary flex-center" style={{ gap: 6, padding: '9px 14px', cursor: 'pointer', flex: '1 1 auto', fontSize: '0.88rem' }}>
            <Sparkles size={15} /> Suggest Designs
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current.click()} className="btn-secondary flex-center" style={{ gap: 6, padding: '9px 14px', cursor: 'pointer', flex: '1 1 auto', fontSize: '0.88rem' }}>
            <UploadCloud size={15} /> Upload Room Photo
          </button>
        </div>
      </div>
    </div>
  );
}
