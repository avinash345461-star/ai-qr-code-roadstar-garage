import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CLIENT_CONFIG } from '../../src/config/clientConfig';
import { generateReviewDraft } from '../../src/server/reviewGenerator';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notes, rating } = req.body || {};

  if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
    return res.status(400).json({
      error: 'Please enter a few words about your real experience.',
    });
  }

  if (notes.trim().length > CLIENT_CONFIG.maxInputLength) {
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
      rawNotes: notes.trim(),
      rating: numericRating,
      apiKey: process.env.GEMINI_API_KEY,
    });

    return res.status(200).json({
      draft: result.reviewText,
      isFallback: result.isFallback,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Failed to generate review draft.',
    });
  }
}
