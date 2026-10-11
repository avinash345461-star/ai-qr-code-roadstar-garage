// Client configuration in ES module
export const CLIENT_CONFIG = {
  businessName: 'ROADSTAR GARAGE',
  tagline: 'Precision Auto Service & Repairs',
  shortScanInstruction: 'Scan with your smartphone camera to write your review',
  googleReviewUrl: 'https://maps.app.goo.gl/Kx5GARa59d3Wif9f6',
  googlePlaceIdOrUrlPattern: /^https:\/\/(maps\.app\.goo\.gl|g\.page|www\.google\.[a-z.]+\/maps)/i,
  allowedRatingRange: { min: 1, max: 5 },
  maxInputLength: 500,
  rateLimitWindowMs: 60 * 1000,
  maxRequestsPerWindow: 20,
};

export function isValidGoogleReviewUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return CLIENT_CONFIG.googlePlaceIdOrUrlPattern.test(url.trim());
}
