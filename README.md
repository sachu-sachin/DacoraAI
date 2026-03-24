# DecoraAI - AI-Powered WebAR Interior Design Studio

DecoraAI is a state-of-the-art web application that leverages Generative AI and Augmented Reality (WebXR) to revolutionize interior design. Transform your space by generating custom 3D furniture from text prompts, analyzing room layouts with Gemini Vision, and visualizing designs in your real-world environment.

## 🚀 Key Features

*   **Google OAuth Authentication:** Secure, frictionless login using Supabase and Gmail.
*   **AI Text-to-3D Generation:** Powered by **Tripo3D API** to create high-quality `.glb` models from natural language descriptions.
*   **Gemini Vision AI Chat:** Intelligent interior design assistant using **Google Gemini 2.0 Flash** to analyze uploaded room photos and suggest tailored improvements.
*   **Persistent 3D Library:** Manage your generated models in a personal gallery. Models are stored permanently in **Supabase Storage**.
*   **Real-time AR Visualization:** Integrated **WebXR (Hit-Testing)** for placing and manipulating 3D objects with realistic persistence and contact shadows.
*   **Interactive Controls:** Rotate, scale, and move 3D models within your space using high-precision pivot controls.
*   **AR Snapshots:** Capture beautiful screenshots of your furniture designs overlaid on your real room.

## 🛠️ Technology Stack

*   **Frontend:** React (Vite), `@react-three/fiber`, `@react-three/xr`, Supabase-js, Lucide Icons, React-Markdown.
*   **Backend:** Node.js, Express, Supabase Admin SDK.
*   **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Google Auth).
*   **Storage:** Supabase Storage (Bucket: `models`) for permanent 3D asset persistence.
*   **AI Engines:** Tripo3D (3D Models) & Google Gemini (Vision/Chat).

## 📦 Setup & Installation

### 1. Prerequisites
- Node.js 20+
- A Supabase Project
- Tripo3D API Key
- Google Gemini API Key

### 2. Environment Configuration

#### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_key
```

#### Backend (`backend/.env`)
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TRIPO_API_KEY=your_tripo_key
FRONTEND_URL=http://localhost:5173
```

### 3. Database Initializatiton
Run the provided `supabase_schema.sql` in your Supabase SQL Editor to set up the necessary tables (`profiles`, `generated_models`) and Storage bucket policies.

### 4. Run Locally
```bash
# In the root directory
# Run Backend
cd backend && npm install && npm start

# In a new terminal, run Frontend
cd frontend && npm install && npm run dev
```

## 🌐 Deployment
- **Backend:** Optimized for **Render** (via `render.yaml`).
- **Frontend:** Optimized for **Netlify** (via `netlify.toml`).

---
Designed with ❤️ for modern interior enthusiasts.
