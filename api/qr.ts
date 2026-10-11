import type { VercelRequest, VercelResponse } from '@vercel/node';
import QRCode from 'qrcode';
import { CLIENT_CONFIG } from '../../src/config/clientConfig';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const targetUrl =
      (req.query.url as string) ||
      process.env.APP_BASE_URL ||
      `https://${req.headers.host || 'localhost:3000'}`;

    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    return res.status(200).json({
      url: targetUrl,
      qrDataUrl,
      businessName: CLIENT_CONFIG.businessName,
      instruction: CLIENT_CONFIG.shortScanInstruction,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate QR code' });
  }
}
