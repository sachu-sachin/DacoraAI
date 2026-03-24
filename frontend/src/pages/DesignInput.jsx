import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Wand2, PlusSquare, RotateCcw, HelpCircle, Box, Sparkles, UploadCloud } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DesignInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm DecoraAI. I can help you visualize your dream space. Upload a photo of your room so I can analyze the layout and lighting, or type a description of the furniture you want to generate!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!prompt.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    setPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Got it! I am ready to build a "${newMsg.text}". Click "Generate 3D Model" below when you are ready to send this configuration to Tripo3D and view it in Augmented Reality!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      isImage: true,
      url: imageUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setIsTyping(true);

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0, g = 0, b = 0, luminance = 0;
      let pixelCount = imgData.length / 4;

      for (let i = 0; i < imgData.length; i += 4) {
        r += imgData[i];
        g += imgData[i + 1];
        b += imgData[i + 2];
        luminance += (0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2]);
      }

      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);
      const avgLuminance = Math.floor(luminance / pixelCount);
      
      const lightingState = avgLuminance > 128 ? "bright natural lighting" : "dim or warm artificial lighting";
      const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: `I have analyzed the provided room image. I detected ${lightingState}. The dominant space color is mostly rgb(${r}, ${g}, ${b}) (Hex: ${hexColor}).\n\nBased on this layout and palette, I suggest the following tailored pieces to balance the room:\n1. A minimalist accent chair in a contrasting warm tone\n2. A modern geometric floor lamp\n3. An organic-shaped coffee table\n\nWhich of these would you like to build?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1500);
    };
  };

  const handleSuggest = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        text: "Based on current trending interior design aesthetics, I recommend exploring 'Japandi' style (a mix of Japanese and Scandinavian elements). How about generating a 'Japandi style woven accent chair'?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const handleGenerate = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user' && !m.isImage);
    const targetPrompt = prompt || (lastUserMsg ? lastUserMsg.text : "A modern chair");
    navigate('/ar-view', { state: { prompt: targetPrompt } });
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - var(--header-height))' }}>
      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', gap: '0.5rem' }}>
         <button onClick={() => setMessages([messages[0]])} style={{ width: 36, height: 36, backgroundColor: 'var(--bg-panel)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><RotateCcw size={18} color="white" /></button>
         <button style={{ width: 36, height: 36, backgroundColor: 'var(--bg-panel)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlusSquare size={18} color="white" /></button>
         <button style={{ width: 36, height: 36, backgroundColor: 'var(--bg-panel)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HelpCircle size={18} color="white" /></button>
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
              <div style={{ backgroundColor: 'var(--accent-blue)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '16px', borderTopRightRadius: '0px', maxWidth: '80%', fontSize: '0.92rem', lineHeight: 1.5 }}>
                 {msg.isImage ? <img src={msg.url} alt="Uploaded Room" style={{ maxWidth: '100%', borderRadius: '8px' }} /> : msg.text}
              </div>
            ) : (
              <div style={{ flex: 1, maxWidth: '80%' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                   <strong style={{ fontSize: '0.9rem', color: 'white' }}>DecoraAI</strong>
                   <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{msg.time}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>
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
                 DecoraAI is analyzing...
              </div>
           </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area" style={{ padding: '1rem 5%', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border-color)' }}>
         <div style={{ display: 'flex', gap: '0.75rem', backgroundColor: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '8px 14px', marginBottom: '0.75rem' }}>
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe the furniture you want to see..." 
              style={{ backgroundColor: 'transparent', border: 'none', flex: 1, padding: '6px 0', color: 'white', outline: 'none', fontSize: '0.92rem' }}
            />
            <button onClick={handleSend} className="flex-center" style={{ backgroundColor: 'var(--accent-blue)', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', border: 'none', flexShrink: 0 }}>
              <Send size={15} color="white" />
            </button>
         </div>
         
         <div className="chat-action-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={handleGenerate} className="btn-secondary flex-center" style={{ gap: '6px', padding: '9px 14px', cursor: 'pointer', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', flex: '1 1 auto', fontSize: '0.88rem' }}>
               <Wand2 size={15} /> Generate 3D Model
            </button>
            <button onClick={handleSuggest} className="btn-secondary flex-center" style={{ gap: '6px', padding: '9px 14px', cursor: 'pointer', flex: '1 1 auto', fontSize: '0.88rem' }}>
               <Sparkles size={15} /> Suggest Designs
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current.click()} className="btn-secondary flex-center" style={{ gap: '6px', padding: '9px 14px', cursor: 'pointer', flex: '1 1 auto', fontSize: '0.88rem' }}>
               <UploadCloud size={15} /> Upload Image
            </button>
         </div>
      </div>
    </div>
  );
}
