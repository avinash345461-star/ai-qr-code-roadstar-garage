import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ROADSTAR_SERVICES = [
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notes, rating } = req.body || {};
  const sanitized = (notes && typeof notes === 'string' ? notes.trim() : '');
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';

  // 1. If user typed notes & Gemini API key is configured
  if (sanitized && apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
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
        return res.status(200).json({
          draft: text.replace(/^["']|["']$/g, ''),
          isFallback: false,
        });
      }
    } catch (aiErr: any) {
      console.warn('Gemini generation failed, falling back to instant template:', aiErr?.message);
    }
  }

  // 2. If user typed notes (or AI fallback)
  if (sanitized) {
    return res.status(200).json({
      draft: `I gave my vehicle to Roadstar Garage for ${sanitized}. The team was very polite, the job was done thoroughly, and the pricing was completely honest and fair. Great service!`,
      isFallback: true,
    });
  }

  // 3. Instant 1-tap review (No notes typed) - Randomize authentic workshop reviews
  if (Math.random() < 0.40) {
    const review = MIXTURE_REVIEWS[Math.floor(Math.random() * MIXTURE_REVIEWS.length)];
    return res.status(200).json({
      draft: review,
      isFallback: false,
    });
  }

  const service = ROADSTAR_SERVICES[Math.floor(Math.random() * ROADSTAR_SERVICES.length)];
  const review = `${service.lead}. ${service.benefits}`;
  return res.status(200).json({
    draft: review,
    isFallback: false,
  });
}
