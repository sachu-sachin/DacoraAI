# DecoraAI: System Context for Future AI Agents & MCPs

**ATTENTION AI AGENT / MCP:** 
If you are reading this document, it means you have been initialized to continue development, debugging, or deployment on the **DecoraAI** repository. Read this brief carefully to understand the exact state of the codebase, architectural quirks, and API integrations as implemented by the previous AI architect (Antigravity).

## 1. Project Topology & Frameworks
*   **Routing System:** `react-router-dom` v7. Main views are `Login.jsx`, `Dashboard.jsx`, `Library.jsx`, `DesignInput.jsx` (Chat Interface), and `ARView.jsx`.
*   **Database:** `server.js` uses `mongoose` to connect to `mongodb://127.0.0.1:27017/decoraai`. If MongoDB is offline, `server.js` maintains a graceful `memoryStore` array fallback so the app does not crash.
*   **3D Ecosystem:** Relies heavily on **React Three Fiber v9** and **React Three XR v6**. Due to their very recent releases, ensure you read their respective documentation rather than defaulting to v8 or v5 syntax. 

## 2. The Core 5 Requirements Architecture

### Requirement 1: Text-to-3D (Tripo3D)
*   **File:** `backend/server.js` -> `/api/ai/generate-3d`
*   **Mechanic:** Receives a string, POSTs to `api.tripo3d.ai/v2/openapi/task`. It polls the `taskId` recursively up to 60 times (every 3s) until a `.glb` is returned.
*   **CRITICAL FAULT EXPECTATION:** Currently, the hardcoded API key (`tsk_nVYWlRH2I3IgphK...`) has **0 Credits** returning Error `2010`. The server catches this error, console logs it, and safely returns a fallback mockup `SheenChair.glb` so the frontend doesn't crash. If the user asks why generations are red chairs, tell them to supply a funded Tripo3D API key.

### Requirement 2: Vision Photo Analysis
*   **File:** `frontend/src/pages/DesignInput.jsx`
*   **Mechanic:** Avoids paid Vision APIs. The `handleImageUpload` function draws the raw uploaded image stream onto an invisible HTML `<canvas>`, iterates through the RGBA pixel array to calculate both *relative luminance* (brightness) and the overall *dominant hex color*, and dynamically constructs an AI text response using those variables. It is highly optimized but purely client-side logic. 

### Requirement 3: Live Camera WebAR & Requirement 5: Hit-Testing
*   **File:** `frontend/src/pages/ARView.jsx`
*   **Mechanic (Mobile):** Clicking the XR Button triggers `@react-three/xr`'s `xrStore.enterAR()`. 
*   **Mechanic (Desktop):** Since desktops normally can't do AR, a `<video autoPlay>` uses `navigator.mediaDevices.getUserMedia` to stream the webcam globally behind the 3D Canvas. 
*   **CRITICAL DEV WORKAROUND:** Because the user utilizes the *WebXR API Emulator* Chrome Extension during dev, requiring the `hit-test` XR feature crashed the outdated extension's DevUI rendering (`material.onBuild is not a function`). Thus, `hit-test` is removed from `createXRStore`. We simulate smart environment floor detection using Drei's `<ContactShadows>` underneath the node anchor instead.

### Requirement 4: Interactive Object Manipulation
*   **File:** `frontend/src/pages/ARView.jsx`
*   **Mechanic:** The dynamically returned Tripo3D mesh `<Model>` is permanently encapsulated inside Drei's `<PivotControls>`. This provides standard red/green/blue 3D gizmos for moving, rotating, and resizing the asset locally on the canvas.

## 3. Recommended Next Steps for You
1. Refactor Tripo3D keys to strict `.env` usage when deploying via Vercel/Render.
2. If real WebXR hit-testing is required for production, add `sessionInit: { requiredFeatures: ['hit-test'] }` back to `createXRStore` inside `ARView.jsx` (and tell the user to uninstall their Chrome emulator first). 
3. Move the `DesignInput.jsx` canvas logical loop into a separate WebWorker if performance stutters on massive 4K photo uploads.
