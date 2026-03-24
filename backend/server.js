import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Configuration
const supabaseUrl = 'https://rurbsodgubtzdthhwovi.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Environment Variables
const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
if (!TRIPO_API_KEY) {
  console.warn('⚠️ TRIPO_API_KEY is missing! 3D generation will fail.');
}

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// API Endpoints
app.get('/api/health', (req, res) => res.json({ status: 'healthy', service: 'DecoraAI Backend (Supabase)' }));

app.post('/api/ai/generate-3d', async (req, res) => {
  const { prompt, user_id } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  console.log(`[AI] Starting Tripo3D Generation for user ${user_id}: "${prompt}"`);

  try {
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
      return res.json({ success: false, error: submitData.message, code: submitData.code });
    }

    const taskId = submitData.data.task_id;
    let completedUrl = null;
    let attempts = 0;
    
    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const pollRes = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
        headers: { 'Authorization': `Bearer ${TRIPO_API_KEY}` }
      });
      const pollData = await pollRes.json();
      
      if (pollData.data.status === 'success') {
        const result = pollData.data.result;
        completedUrl = result?.pbr_model?.url || result?.model?.url;
        break;
      } else if (pollData.data.status === 'failed') {
        throw new Error('Tripo3D task failed.');
      }
      attempts++;
    }

    if (!completedUrl) throw new Error('Generation timed out.');

    // Save to Supabase
    const { data, error } = await supabase
      .from('generated_models')
      .insert([
        { user_id, prompt, model_url: completedUrl }
      ])
      .select();

    if (error) throw error;

    res.json({
      success: true,
      prompt,
      modelUrl: completedUrl,
      status: 'completed'
    });

  } catch (error) {
    console.error('[AI] Generation Error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/designs', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  const { data, error } = await supabase
    .from('generated_models')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ designs: data });
});

app.post('/api/screenshot', (req, res) => {
  res.json({ success: true, message: 'Snapshot functionality pending Supabase Storage' });
});

app.listen(PORT, () => {
  console.log(`🚀 DecoraAI REST API (Supabase) running at http://localhost:${PORT}`);
});