import express from 'express';
let cors: any;
try {
  // Import cors if available; keep example server resilient when dependency is not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  cors = require('cors');
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Optional dependency "cors" not installed. Requests may not be CORS-restricted in this example.');
  cors = (opts: any) => (_req: any, _res: any, next: any) => next();
}
import fetch from 'node-fetch';
import http from 'http';
import https from 'https';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.AI_API_KEY || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://<my-frontend>.vercel.app,https://hopementalhealthsupport.xyz,http://hopementalhealthsupport.xyz,https://www.hopementalhealthsupport.xyz,http://www.hopementalhealthsupport.xyz';

if (!AI_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('AI_API_KEY is not set; upstream calls will fail');
}

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: CORS_ORIGIN, methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type','Authorization','x-api-key'] }));

// Keep-alive agents to reduce cold start/request setup latency
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

async function fetchWithRetry(url: string, options: any, retries = 1, timeoutMs = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, agent: url.startsWith('https') ? httpsAgent : httpAgent } as any);
    if (res.status >= 500 && retries > 0) {
      await new Promise(r => setTimeout(r, 600));
      return fetchWithRetry(url, options, retries - 1, timeoutMs);
    }
    return res;
  } finally {
    clearTimeout(id);
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.post('/chat/sessions', (_req, res) => {
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  res.json({ sessionId });
});

app.get('/chat/sessions/:sessionId/history', (_req, res) => {
  res.json([]);
});

app.post('/chat/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const upstream = await fetchWithRetry(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
      }),
    }, 1, 30000);

    const ct = upstream.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return res.status(502).json({ error: 'AI upstream returned non-JSON' });
    }

    let data: any;
    try {
      data = await upstream.json();
    } catch {
      return res.status(502).json({ error: 'AI upstream returned invalid JSON' });
    }

    // Map upstream => unified response shape
    const aiText = data?.choices?.[0]?.message?.content || data?.output || data?.response || '';
    if (!aiText) {
      return res.status(502).json({ error: 'AI upstream returned empty response' });
    }
    return res.json({ message: 'ok', response: aiText, metadata: { technique: 'supportive', progress: [] } });
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    const status = isAbort ? 504 : 500;
    return res.status(status).json({ error: isAbort ? 'AI request timeout' : 'AI request failed' });
  }
});

app.post('/memory-enhanced-chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const upstream = await fetchWithRetry(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: message }] }),
    }, 1, 30000);

    const ct = upstream.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return res.status(502).json({ error: 'AI upstream returned non-JSON' });
    }
    let data: any;
    try { data = await upstream.json(); } catch { return res.status(502).json({ error: 'AI upstream returned invalid JSON' }); }

    const aiText = data?.choices?.[0]?.message?.content || data?.output || data?.response || '';
    if (!aiText) return res.status(502).json({ error: 'AI upstream returned empty response' });
    return res.json({ response: aiText, insights: [], techniques: [], breakthroughs: [], personalizedSuggestions: [] });
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    const status = isAbort ? 504 : 500;
    return res.status(status).json({ error: isAbort ? 'AI request timeout' : 'AI request failed' });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});


