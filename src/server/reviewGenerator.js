import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Real workshop services provided by Roadstar Garage.
 * Customers give their car for these services (NEVER buying a car).
 */
export const ROADSTAR_SERVICES = [
  {
    name: 'Denting & Painting',
    lead: 'I gave my car to Roadstar Garage for denting and painting',
    benefits: 'The paint finish and panel alignment look brand new. Color match was 100% spot on, and the staff were so polite and transparent with the pricing.',
  },
  {
    name: 'Periodic Servicing',
    lead: 'I gave my car to Roadstar Garage for periodic servicing',
    benefits: 'The vehicle is running noticeably smoother and quiet. The mechanics explained all the checkpoints clearly and the rates are genuinely affordable with no hidden costs.',
  },
  {
    name: 'Robotic Car Wash',
    lead: 'I gave my car to Roadstar Garage for their robotic car wash',
    benefits: 'The cleaning was thorough and super fast. Every corner and the underbody came out spotless without any scratches. Great value for money and welcoming staff!',
  },
  {
    name: 'Engine Diagnostic & Tune-up',
    lead: 'I gave my car to Roadstar Garage for engine diagnostics and tuning',
    benefits: 'The technicians pinpointed the issue right away and solved it quickly. Highly trained staff, honest advice, and very reasonable charges.',
  },
  {
    name: 'Brake & Suspension Overhaul',
    lead: 'I gave my car to Roadstar Garage for brake and suspension repair',
    benefits: 'The car feels so stable and safe to drive now. The mechanics were honest, showed me the parts, and finished the work right on time.',
  },
  {
    name: 'Wheel Alignment & Balancing',
    lead: 'I gave my car to Roadstar Garage for wheel alignment and balancing',
    benefits: 'The steering is perfectly centered now with zero vibration. Super quick service, respectful technicians, and very affordable prices.',
  },
];

// Rich Mixture reviews (40% of reviews) combining multiple garage aspects
const MIXTURE_REVIEWS = [
  `I gave my car to Roadstar Garage for complete servicing and denting painting work. The staff were exceptionally polite and kept me updated at every stage. The paint match is flawless, the engine feels so smooth, and the pricing was genuinely affordable without any unnecessary upsells. True 5-star workmanship!`,
  `Took my vehicle to Roadstar Garage for maintenance and robotic car wash. The mechanics clearly know their trade and handled the job with total care. Honest billing, polite customer service, and my car came out looking and driving like new. Highly recommend them!`,
  `I gave my car to Roadstar Garage for periodic servicing and suspension check. They diagnosed everything accurately and finished the work right on schedule. The team is very respectful, transparent with costs, and provides top quality repairs at reasonable rates.`,
  `Really impressed with the quality at Roadstar Garage. Gave my car for denting, painting and a robotic wash—the finish is showroom quality! The staff were very courteous and the prices are far better than other workshops.`,
];

// Dynamic AI background cache for fast responses
let pregeneratedAiReviews = [];

/**
 * Returns a natural, realistic workshop review INSTANTLY (<25ms).
 * Corrects phrasing: Always "I gave my car for [service]", NEVER "I bought a car".
 */
export async function generateReviewDraft({ rawNotes, rating, apiKey }) {
  const sanitized = (rawNotes || '').trim();

  // If customer provided specific custom notes (e.g. "ac repair", "clutch work")
  if (sanitized) {
    // If Gemini API is available and responds within reasonable time
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash-lite',
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 600,
          },
        });

        const prompt = `You are a real customer writing an honest Google review for "Roadstar Garage" (an auto repair & maintenance garage).
The customer gave their car for: "${sanitized}".
Rules:
1. Write 2 to 3 natural sentences in the first person starting like: "I gave my car to Roadstar Garage for ${sanitized}..."
2. NEVER say "I bought my car". This is a service garage, not a car showroom.
3. Highlight polite staff, reasonable/affordable pricing, and quality workmanship.
4. Output ONLY the raw review text.`;

        const response = await model.generateContent(prompt);
        const text = response.response.text()?.trim();
        if (text) {
          return {
            reviewText: text.replace(/^["']|["']$/g, ''),
            isFallback: false,
          };
        }
      } catch (e) {
        // Fall back to immediate template
      }
    }

    return {
      reviewText: `I gave my car to Roadstar Garage for ${sanitized}. The team was very polite, the mechanical work was done cleanly, and the pricing was honest and fair. Car is running great!`,
      isFallback: true,
    };
  }

  // 1-Tap / Instant flow (No custom notes typed)
  // Check if background AI generated review is available
  if (pregeneratedAiReviews.length > 0) {
    const aiReview = pregeneratedAiReviews.shift();
    replenishAiPoolInBackground(apiKey);
    return {
      reviewText: aiReview,
      isFallback: false,
      isInstant: true,
    };
  }

  // 40% probability: Mixture of multiple workshop services & qualities
  if (Math.random() < 0.40) {
    const review = MIXTURE_REVIEWS[Math.floor(Math.random() * MIXTURE_REVIEWS.length)];
    replenishAiPoolInBackground(apiKey);
    return {
      reviewText: review,
      isFallback: false,
      isInstant: true,
    };
  }

  // 60% probability: Specific workshop service (denting painting, robotic wash, servicing, etc.)
  const service = ROADSTAR_SERVICES[Math.floor(Math.random() * ROADSTAR_SERVICES.length)];
  const review = `${service.lead}. ${service.benefits}`;
  replenishAiPoolInBackground(apiKey);

  return {
    reviewText: review,
    isFallback: false,
    isInstant: true,
  };
}

/**
 * Background AI worker to replenish reviews continuously
 */
async function replenishAiPoolInBackground(apiKey) {
  if (!apiKey || pregeneratedAiReviews.length >= 4) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 600,
      },
    });

    const chosenService = ROADSTAR_SERVICES[Math.floor(Math.random() * ROADSTAR_SERVICES.length)];
    const prompt = `Write a realistic 2-sentence Google review for Roadstar Garage.
Context: I gave my car for ${chosenService.name.toLowerCase()}.
Mention: polite staff behavior, quick turnaround, and fair affordable pricing.
DO NOT say "I bought my car". Say "I gave my car for ${chosenService.name.toLowerCase()}".
Output ONLY the review text.`;

    const res = await model.generateContent(prompt);
    const text = res.response.text()?.trim();
    if (text) {
      pregeneratedAiReviews.push(text.replace(/^["']|["']$/g, ''));
    }
  } catch (e) {
    // Ignore background errors
  }
}
