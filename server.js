// Plain ES Module server implementation
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { CLIENT_CONFIG, isValidGoogleReviewUrl } from './src/config/clientConfig.js';
import { generateReviewDraft } from './src/server/reviewGenerator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10kb' }));

// In-memory rate limiting map (IP -> timestamps[])
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < CLIENT_CONFIG.rateLimitWindowMs
  );
  if (timestamps.length >= CLIENT_CONFIG.maxRequestsPerWindow) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

// 1. Client Business Public Config endpoint
app.get('/api/config', (req, res) => {
  const isGoogleUrlValid = isValidGoogleReviewUrl(CLIENT_CONFIG.googleReviewUrl);
  res.json({
    businessName: CLIENT_CONFIG.businessName,
    tagline: CLIENT_CONFIG.tagline,
    shortScanInstruction: CLIENT_CONFIG.shortScanInstruction,
    googleReviewUrl: isGoogleUrlValid ? CLIENT_CONFIG.googleReviewUrl : '',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
});

// 2. AI Review Draft Generation endpoint
app.post('/api/generate-draft', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before trying again.',
    });
  }

  const { notes, rating, style } = req.body || {};

  const cleanNotes = typeof notes === 'string' ? notes.trim() : '';

  if (cleanNotes.length > CLIENT_CONFIG.maxInputLength) {
    return res.status(400).json({
      error: `Feedback is too long (maximum ${CLIENT_CONFIG.maxInputLength} characters).`,
    });
  }

  const numericRating = rating !== undefined ? Number(rating) : undefined;
  if (
    numericRating !== undefined &&
    (numericRating < CLIENT_CONFIG.allowedRatingRange.min ||
      numericRating > CLIENT_CONFIG.allowedRatingRange.max)
  ) {
    return res.status(400).json({
      error: 'Rating must be between 1 and 5.',
    });
  }

  try {
    const result = await generateReviewDraft({
      rawNotes: cleanNotes,
      rating: numericRating,
      style,
      apiKey: process.env.GEMINI_API_KEY,
    });

    res.json({
      draft: result.reviewText,
      isFallback: result.isFallback,
    });
  } catch (error) {
    console.error('Draft generation error:', error?.message || error);
    res.status(500).json({
      error: error?.message || 'Failed to generate review draft.',
    });
  }
});

// 3. Dynamic QR Code Generator endpoint (Data URL)
app.get('/api/qr', async (req, res) => {
  try {
    const targetUrl = req.query.url || process.env.APP_BASE_URL || 'http://localhost:5173';
    
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    res.json({
      url: targetUrl,
      qrDataUrl,
      businessName: CLIENT_CONFIG.businessName,
      instruction: CLIENT_CONFIG.shortScanInstruction,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Serve frontend static files if built
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Vite Dev Server is running on port 5173');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Roadstar Review Server] running on http://localhost:${PORT}`);
  console.log(`- Google Review Target: ${CLIENT_CONFIG.googleReviewUrl}`);
  console.log(`- Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
});
