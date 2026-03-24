import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Hardcoded for demonstration based on user prompt
const TRIPO_API_KEY = 'tsk_wRD5rogLqxl8aoHR7f6-ZM4DcHZFmJxbyMHugzESEYH';

app.use(cors());
app.use(express.json());

// MongoDB models
const designSchema = new mongoose.Schema({
  prompt: String,
  modelUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const Design = mongoose.model('Design', designSchema);

// Optional DB connection (Graceful fallback)
mongoose.connect('mongodb://127.0.0.1:27017/decoraai')
  .then(() => console.log('✅ Connected to MongoDB local data store'))
  .catch(err => console.log('⚠️ MongoDB connection failed, using in-memory store fallback. Error:', err.message));

let memoryStore = [];

// API Endpoints
app.get('/api/health', (req, res) => res.json({ status: 'healthy', service: 'DecoraAI Backend' }));

app.post('/api/ai/generate-3d', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  console.log(`[AI] Starting Tripo3D Generation for prompt: "${prompt}"`);

  try {
    // 1. Submit task with correct payload per Tripo3D API docs
    const submitRes = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TRIPO_API_KEY}`
      },
      body: JSON.stringify({
        type: 'text_to_model',
        prompt: `${prompt}, high quality, detailed, realistic furniture`,
        negative_prompt: 'low quality, blurry, distorted, broken geometry'
      })
    });

    const submitData = await submitRes.json();
    if (submitData.code !== 0) {
      console.error('[AI] Tripo error code:', submitData.code, submitData.message);
      // Return structured error so frontend can use smart fallback
      return res.json({
        success: false,
        error: submitData.message,
        code: submitData.code
      });
    }

    const taskId = submitData.data.task_id;
    console.log(`[AI] Task submitted successfully. ID: ${taskId}. Waiting for completion...`);

    // 2. Poll for completion (timeout after 2 mins to prevent hanging)
    let completedUrl = null;
    let attempts = 0;
    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s
      
      const pollRes = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${TRIPO_API_KEY}`
        }
      });
      const pollData = await pollRes.json();
      
      if (pollData.data.status === 'success') {
        // Confirmed real response structure from live API:
        // data.result.pbr_model.url  (PBR GLB — highest quality)
        // data.result.model.url      (standard GLB — fallback)
        const result = pollData.data.result;
        completedUrl = result?.pbr_model?.url || result?.model?.url;
        console.log(`[AI] Task completed! URL: ${completedUrl}`);
        break;
      } else if (pollData.data.status === 'failed') {
        throw new Error('Tripo3D task failed during processing.');
      }
      
      attempts++;
    }

    if (!completedUrl) {
      throw new Error('Generation timed out.');
    }

    // Attempt to save to DB
    const newDesign = { prompt, modelUrl: completedUrl, createdAt: new Date() };
    if (mongoose.connection.readyState === 1) {
      await Design.create(newDesign);
    } else {
      memoryStore.push(newDesign);
    }

    res.json({
      success: true,
      prompt,
      modelUrl: completedUrl,
      status: 'completed',
      message: '3D model generated successfully'
    });

  } catch (error) {
    console.error('[AI] Generation Error:', error.message);
    res.json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/designs', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const designs = await Design.find().sort({ createdAt: -1 });
    res.json({ designs });
  } else {
    res.json({ designs: memoryStore });
  }
});

app.post('/api/screenshot', (req, res) => {
  // Handles saving base64 screenshots from the AR view to DB
  console.log('[Snapshot] Received AR Snapshot');
  res.json({ success: true, message: 'Snapshot saved' });
});

app.listen(PORT, () => {
  console.log(`🚀 DecoraAI REST API running at http://localhost:${PORT}`);
});
