import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_CONFIG = {
  businessName: 'ROADSTAR GARAGE',
  tagline: 'Precision Auto Service & Repairs',
  shortScanInstruction: 'Scan with your smartphone camera to write your review',
  googleReviewUrl: 'https://maps.app.goo.gl/Kx5GARa59d3Wif9f6',
  googlePlaceIdOrUrlPattern: /^https:\/\/(maps\.app\.goo\.gl|g\.page|www\.google\.[a-z.]+\/maps)/i,
};

function isValidGoogleReviewUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return CLIENT_CONFIG.googlePlaceIdOrUrlPattern.test(url.trim());
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const isGoogleUrlValid = isValidGoogleReviewUrl(CLIENT_CONFIG.googleReviewUrl);
  return res.status(200).json({
    businessName: CLIENT_CONFIG.businessName,
    tagline: CLIENT_CONFIG.tagline,
    shortScanInstruction: CLIENT_CONFIG.shortScanInstruction,
    googleReviewUrl: isGoogleUrlValid ? CLIENT_CONFIG.googleReviewUrl : '',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
}
