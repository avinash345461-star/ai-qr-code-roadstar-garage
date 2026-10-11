import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CLIENT_CONFIG, isValidGoogleReviewUrl } from '../../src/config/clientConfig';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const isGoogleUrlValid = isValidGoogleReviewUrl(CLIENT_CONFIG.googleReviewUrl);
  res.status(200).json({
    businessName: CLIENT_CONFIG.businessName,
    tagline: CLIENT_CONFIG.tagline,
    shortScanInstruction: CLIENT_CONFIG.shortScanInstruction,
    googleReviewUrl: isGoogleUrlValid ? CLIENT_CONFIG.googleReviewUrl : '',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
}
