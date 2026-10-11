# ROADSTAR GARAGE — AI-Assisted QR Review Assistant

A single-client, production-ready, AI-assisted customer review website for **ROADSTAR GARAGE** Detailing Studio.

> **Client:** ROADSTAR GARAGE  
> **Official Google Review URL:** [https://maps.app.goo.gl/Kx5GARa59d3Wif9f6](https://maps.app.goo.gl/Kx5GARa59d3Wif9f6)  
> **Architecture:** React + Vite + TypeScript (Frontend), Express / Vercel Serverless (Backend), Google Gemini API (Server-side only).
> **UI/UX Aesthetic:** Premium Black & Gold Quiet Luxury Design System.

---

## ⭐️ Ethical & Transparent Review Policy
- **No Forced Ratings:** Star ratings are customer-controlled (1 to 5 stars) and are **never pre-selected** to 5 stars.
- **No Fictional Reviews:** The Gemini AI prompt is strictly constrained to only convert the customer's actual words into clear sentences. No fabricated praise, names, or prices.
- **Explicit Customer Confirmation:** The customer must verify and confirm the review before proceeding.
- **Manual Google Submission:** The customer is redirected directly to Google Reviews to paste and submit their review themselves. The application never manipulates Google's UI or claims a review was published when it wasn't.
- **No Gatekeeping:** All customers have identical access to post their review on Google, regardless of their star rating or experience.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (verified on Node v24)
- npm 9+

### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
APP_BASE_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Full Stack App
Start the backend server:
```bash
npm run server
```

In a separate terminal, start the Vite development server:
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build & Testing

Build and verify the production bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```
or serve with the Node.js production server:
```bash
npm run server
```

---

## ☁️ Deployment Instructions (Vercel)

This repository includes a deployment-ready `vercel.json` configuration and Vercel serverless functions in the `/api` directory.

### Deploying with Vercel CLI:
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Link & Deploy:
   ```bash
   vercel
   ```
3. Set your Production Environment Variable in the Vercel Dashboard:
   - `GEMINI_API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com).
   - `APP_BASE_URL`: Your Vercel production URL.
4. Redeploy to production:
   ```bash
   vercel --prod
   ```

---

## 🖨️ Printable QR Standee

- **In-App QR Sign & Generator:** Click the **"Printable QR"** button in the top navigation of the website.
- **Pre-generated PNG:** A ready-to-print file `roadstar-garage-printable-qr.png` is generated in the root of this project.
