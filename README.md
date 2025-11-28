# Visa Petition Generator

An AI-powered visa petition generator with async job processing, built for Vercel deployment.

## Features

- Async job processing with Vercel KV (Redis)
- AI-powered petition generation using Claude 3.5 Sonnet
- Perplexity AI integration for research
- PDF document upload and text extraction (LlamaParse)
- AI auto-fill from uploaded documents
- Job history viewer
- Email notifications via SendGrid
- PDF exhibit generation (URLs to PDFs)
- Automatic job cleanup

## Tech Stack

- Next.js 14.2.18 with App Router
- TypeScript
- Vercel KV (Redis)
- Anthropic Claude API
- Perplexity API
- SendGrid
- API2PDF
- LlamaParse

## Environment Variables

See `VERCEL_ENV_SETUP.md` for the complete list of required environment variables.

## Deployment

This app is designed for Vercel deployment with Vercel KV for job storage.

1. Add all environment variables to Vercel
2. Deploy: `vercel --prod`

## Live Demo

https://vercel-petition-generator-d34qlfmke.vercel.app

## Repository

https://github.com/IGTA-Tech/vercel-petition-generator
