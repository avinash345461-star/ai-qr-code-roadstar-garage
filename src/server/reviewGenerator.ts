import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateReviewParams {
  rawNotes?: string;
  rating?: number;
  apiKey?: string;
}

interface GenerateReviewResult {
  reviewText: string;
  isFallback?: boolean;
  isInstant?: boolean;
}

export const ROADSTAR_SERVICES = [
  {
    category: 'wash',
    name: 'Robotics Wash & Foam Wash',
    lead: 'I brought my car to Roadstar Garage for robotic wash and thick foam wash',
    benefits: 'The automatic wash was super quick and gave a spotless scratch-free shine. Staff were very polite and attentive to detailing!',
  },
  {
    category: 'wash',
    name: 'Under Body Wash & Foam Wash',
    lead: 'Gave my car for underbody wash and full foam cleaning at Roadstar Garage',
    benefits: 'All the dirt and grime from underneath was completely cleared out. Outstanding equipment, courteous staff, and very affordable rates.',
  },
  {
    category: 'interior',
    name: 'Interior Clean & Vacuum',
    lead: 'I gave my car to Roadstar Garage for deep interior cleaning and vacuum',
    benefits: 'Every seat, mat, and dashboard corner was vacuumed and detailed thoroughly. Smells fresh and looks brand new inside. Truly great job!',
  },
  {
    category: 'bike',
    name: 'Bike Wash & Servicing',
    lead: 'I brought my bike to Roadstar Garage for foam wash and bike servicing',
    benefits: 'The bike is running super smooth and the wash was done with great care. Very honest technicians, polite reception, and fair prices.',
  },
  {
    category: 'coating',
    name: 'Ceramic Coating',
    lead: 'Got ceramic coating done on my vehicle at Roadstar Garage',
    benefits: 'The glossy glass-like shine and water beading finish are phenomenal. Highly trained team who explained the curing process clearly. Worth every single rupee!',
  },
  {
    category: 'service',
    name: 'Car Servicing & Checkup',
    lead: 'I gave my car to Roadstar Garage for periodic car servicing',
    benefits: 'Engine is noticeably smoother and quiet. The mechanics are thoroughly trained, polite, and there were no hidden charges on the bill.',
  },
  {
    category: 'paint',
    name: 'Denting & Painting',
    lead: 'I gave my car to Roadstar Garage for denting and painting work',
    benefits: 'The paint matching is 100% factory finish. You cannot tell where the scratch was. Polite staff and very reasonable pricing.',
  },
  {
    category: 'wash',
    name: 'Complete Car Wash & Detailing',
    lead: 'Visited Roadstar Garage for car wash, underbody clean, and vacuuming',
    benefits: 'Done with great speed and attention to detail. The team was so respectful and welcoming. Easily the best auto wash in the area!',
  },
];

const MIXTURE_REVIEWS = [
  `Gave my car to Roadstar Garage for full servicing, robotic wash, and deep vacuum interior cleaning. The staff were exceptionally polite and guided me through the entire job. Car feels showroom fresh inside and out with super smooth engine performance. Truly affordable and honest pricing!`,
  `Brought my vehicle in for ceramic coating and underbody foam wash at Roadstar Garage. The gloss finish is stunning and the wash was done to perfection. The technicians clearly know their trade, treat customers with great respect, and charge very fair rates. 10/10 experience!`,
  `Took my car for periodic servicing, robotic car wash, and complete interior clean. The team was punctual, courteous, and very transparent with billing. No unnecessary pushy upsells—just genuine quality care. Highly recommend Roadstar Garage!`,
  `Got my bike servicing and foam wash done here. Excellent customer behavior, thorough vacuuming and wash quality, and the bike rides like new. Very happy with the fair rates and trained staff!`,
];

let pregeneratedAiReviews: string[] = [];

export async function generateReviewDraft({
  rawNotes,
  apiKey,
}: GenerateReviewParams): Promise<GenerateReviewResult> {
  const sanitized = (rawNotes || '').trim();

  if (sanitized) {
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash-lite',
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 600,
          },
        });

        const prompt = `You are a real customer writing a Google review for "Roadstar Garage".
Services they provide: Bike wash, car wash, foam wash, underbody wash, interior clean, vacuum, robotics wash, ceramic coating, car servicing, bike servicing, denting painting.
Customer gave their vehicle for: "${sanitized}".
Write 2 to 3 natural first-person sentences praising the polite staff behaviour, excellent cleaning/repair finish, and fair affordable pricing.
Never say "I bought a car". Output ONLY the review text.`;

        const response = await model.generateContent(prompt);
        const text = response.response.text()?.trim();
        if (text) {
          return {
            reviewText: text.replace(/^["']|["']$/g, ''),
            isFallback: false,
          };
        }
      } catch (e) {
        // Fallback
      }
    }

    return {
      reviewText: `I gave my vehicle to Roadstar Garage for ${sanitized}. The team was very polite, the job was done thoroughly, and the pricing was completely honest and fair. Great service!`,
      isFallback: true,
    };
  }

  if (pregeneratedAiReviews.length > 0) {
    const aiReview = pregeneratedAiReviews.shift()!;
    replenishAiPoolInBackground(apiKey);
    return {
      reviewText: aiReview,
      isFallback: false,
      isInstant: true,
    };
  }

  if (Math.random() < 0.40) {
    const review = MIXTURE_REVIEWS[Math.floor(Math.random() * MIXTURE_REVIEWS.length)];
    replenishAiPoolInBackground(apiKey);
    return {
      reviewText: review,
      isFallback: false,
      isInstant: true,
    };
  }

  const service = ROADSTAR_SERVICES[Math.floor(Math.random() * ROADSTAR_SERVICES.length)];
  const review = `${service.lead}. ${service.benefits}`;
  replenishAiPoolInBackground(apiKey);

  return {
    reviewText: review,
    isFallback: false,
    isInstant: true,
  };
}

async function replenishAiPoolInBackground(apiKey?: string) {
  if (!apiKey || pregeneratedAiReviews.length >= 4) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        temperature: 0.88,
        maxOutputTokens: 600,
      },
    });

    const chosenService = ROADSTAR_SERVICES[Math.floor(Math.random() * ROADSTAR_SERVICES.length)];
    const prompt = `Write a realistic 2-sentence Google review for Roadstar Garage.
Service: ${chosenService.name}.
Mention: polite staff behavior, spotless finish or smooth drive, and fair affordable pricing.
Never say "I bought a car". Talk like a real customer on Google Maps. Output ONLY the review text.`;

    const res = await model.generateContent(prompt);
    const text = res.response.text()?.trim();
    if (text) {
      pregeneratedAiReviews.push(text.replace(/^["']|["']$/g, ''));
    }
  } catch (e) {
    // Ignore
  }
}
