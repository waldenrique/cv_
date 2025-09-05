<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1T5MG0OY1K4YwkRxl4nLxI_5S6a4Zf_b2

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Set your `GEMINI_API_KEY` in `.env.local` (get it at: https://aistudio.google.com/app/apikey)
   - Set your `VITE_STRIPE_PUBLISHABLE_KEY` in `.env.local` (get it at: https://dashboard.stripe.com/apikeys)
   - Set your `VITE_STRIPE_PRICE_ID` in `.env.local` (create a product at: https://dashboard.stripe.com/products)

3. Run the app:
   ```bash
   npm run dev
   ```
