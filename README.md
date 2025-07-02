# AI Icebreaker Generator

Transform your prospect list into personalized conversation starters with AI-powered research.

## Features

- 🔍 AI Company Research using live web search
- 💼 LinkedIn Profile Analysis
- ⚡ Smart Icebreaker Generation
- 📊 Excel File Processing
- 📥 Downloadable Results

## Deployment

This application is optimized for deployment on Vercel.

### Environment Variables Required

- `OPENAI_API_KEY` - Your OpenAI API key
- `RAPIDAPI_KEY` - Your RapidAPI key for LinkedIn scraping

### Deploy to Vercel

1. Push this code to a GitHub repository
2. Connect your GitHub repo to Vercel
3. Add the required environment variables in your Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Local Development

1. Copy `.env.example` to `.env.local`
2. Add your API keys to `.env.local`
3. Run `npm install`
4. Run `npm run dev`

## How It Works

1. Upload Excel file with columns: Name, JobTitle, CompanyWebsite, CompanyName (optional), LinkedInURL (optional)
2. AI researches each company using live web search
3. LinkedIn profiles are analyzed (when provided)
4. Personalized icebreakers are generated using B2B copywriting expertise
5. Download enriched file with two unique icebreakers per prospect

## Tech Stack

- Next.js 13
- TypeScript
- Tailwind CSS
- OpenAI GPT-4
- RapidAPI LinkedIn Scraper
- Excel processing with SheetJS