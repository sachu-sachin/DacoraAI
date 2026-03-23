# DecoraAI - AI-Powered WebAR Interior Design Studio

DecoraAI is an advanced web-based prototype designed to merge Generative AI (Text-to-3D) with Augmented Reality (WebXR) for real-time interior design visualization directly in the browser. 

This repository contains both a React (Vite) Frontend and a Node.js/Express Backend connected to MongoDB, successfully fulfilling the architecture specified in the DecoraAI research methodology.

## Features Implemented
1. **AI-Based Text-to-3D Generation:** Connects to Tripo3D V2 API to dynamically generate `.glb` files from natural language prompts. *(Fallback to mockup meshes enabled if API returns 'Insufficient Credits')*.
2. **Photo/Camera Design Recommendation:** Smart Chat component utilizing an invisible HTML5 canvas to natively detect room dominant hex colors and relative luminance to automatically propose tailored furniture.
3. **Live Camera Background & AR:** Employs `navigator.mediaDevices.getUserMedia` for desktop "window" AR, and `@react-three/xr` `createXRStore` for native device Augmented Reality.
4. **Interactive Object Manipulation:** Integration of Drei `<PivotControls>` to translate, scale, and rotate objects accurately within physical spaces.
5. **Smart Environment Detection:** Native WebXR Hit-Testing requested on the store, supplemented by dynamic `<ContactShadows>` for realistic flooring occlusion.

## Technology Stack
- **Frontend:** React 19, Vite, `@react-three/fiber` (v9), `@react-three/drei`, `@react-three/xr` (v6), React Router, Lucide React icons.
- **Backend:** Node.js, Express, Mongoose (MongoDB).
- **External AI:** Tripo3D API (Text-to-3D generation pipelines).

## Setup Instructions
### 1. Install Dependencies
```bash
# In the frontend directory
npm install

# In the backend directory
npm install
```

### 2. Configure Environment Variables
In the `backend/` directory, create a `.env` file (if not present) to house dynamic keys:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/decoraai
TRIPO_API_KEY=your_tripo3d_key_here
```
*(Note: In the current server.js, the API key is hardcoded as a fallback mechanism. Be sure to replace it when injecting real credits).*

### 3. Run the Servers
```bash
# Start backend (Port 5000)
node server.js

# Start frontend (Port 5173 default)
npm run dev
```

## Troubleshooting Note
If you are testing on Desktop using the **WebXR API Emulator** Chrome Extension, ensure you DO NOT pass `requiredFeatures: ['hit-test']` to `createXRStore()`, as the Chrome extension's outdated injected materials will crash the modern WebGL 2.0 Renderer (`material.onBuild is not a function`). Hit-testing works natively on Android/iOS without issue.
