# Re-implementing Smart Environment Detection (AR Hit-Testing)

This document outlines how to re-implement surface and floor detection in your WebAR application (`ARView.jsx`) using `@react-three/xr`. This feature allows you to place 3D furniture accurately on real-world floors instead of floating them in the screen center.

## Why it was removed
It was temporarily removed because the WebXR API Emulator Chrome extension crashes on newer versions of Three.js when trying to build its hit-test UI.

---

## Steps to Implement

### 1. Re-enable Hit-Test Features in XR Store
You need to request the `hit-test` feature from the device when the AR session starts. Update your XR store initialization at the top of your `ARView.jsx`:

```javascript
// Change this:
// const xrStore = createXRStore();

// To this:
const xrStore = createXRStore({
  sessionInit: { requiredFeatures: ['hit-test'] }
});
```

### 2. Import the Required Hooks
Import the XR and Hit Test hooks from `@react-three/xr`. Depending on your `@react-three/xr` library version (v5 or v6), you will either use `useHitTest` or extract it via `xrStore`.

```javascript
// For older standard @react-three/xr setups:
import { useHitTest, Interactive } from '@react-three/xr';
```

### 3. Create a Reticle (Target Indicator) Component
The reticle is a visual marker (like a glowing ring on the floor) that tells the user where the current detected surface is.

```javascript
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

function Reticle({ onSelectSurface }) {
  const reticleRef = useRef();
  
  // This hook updates the reticle position every frame based on floor detection
  useHitTest((hitMatrix, hit) => {
    if (hit) {
      reticleRef.current.visible = true;
      // Apply the real-world surface matrix to the reticle
      reticleRef.current.matrix.copy(hitMatrix);
    } else {
      reticleRef.current.visible = false;
    }
  });

  return (
    <mesh 
      ref={reticleRef} 
      matrixAutoUpdate={false} // Important: Let the hitMatrix control it
      visible={false} 
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.1, 0.2, 32]} />
      <meshBasicMaterial color="#3b82f6" />
    </mesh>
  );
}
```

### 4. Anchoring the Model
You will need to maintain a state for the 3D model's actual coordinates in physical space (`modelPosition`).

```javascript
const [modelPosition, setModelPosition] = useState(null);

// When the user taps the screen to place the object:
const placeObject = (event) => {
  // Extract coordinate x, y, z from the reticle's current matrix
  // and set your modelPosition.
}
```

### 5. Combine it in your Canvas
Wrap your `<Scene>` in the XR components, showing the `Reticle` when a model is NOT placed, and showing the `<Model />` when it IS placed.

```javascript
<Canvas>
  <XR store={xrStore}>
    {/* Always run hit testing invisible ring */}
    <Reticle />
    
    {/* Render your model if placed */}
    {modelPosition && (
       <group position={modelPosition}>
          <Model url={modelUrl} />
       </group>
    )}
  </XR>
</Canvas>
```

### Summary of Future Architecture:
- User points phone at the ground.
- The `hit-test` API gathers depth mapping points from the camera.
- The `<Reticle>` visually locks onto that physical plane matrix.
- The user taps the display.
- The app saves those X/Y/Z vector coordinates.
- The 3D furniture is drawn exactly at those real-world coordinates.
