# Railway Deployment - Fully Automated Setup

This guide shows you how to deploy the Visa Petition Generator to Railway with PostgreSQL storage via CLI - **no manual variable entry required**.

## Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **Railway Token**: Get your token at https://railway.app/account/tokens

## One-Command Deployment

### Step 1: Set Your Railway Token

```bash
export RAILWAY_TOKEN='your-token-from-railway-app'
```

### Step 2: Run the Deployment Script

```bash
chmod +x railway-deploy.sh
./railway-deploy.sh
```

That's it! The script will:
- ✅ Create a new Railway project
- ✅ Add PostgreSQL database automatically
- ✅ Read all environment variables from `.env.local`
- ✅ Set all variables via CLI (no manual entry!)
- ✅ Deploy your application
- ✅ Provide you with the live URL

## What You Get

- **Persistent Storage**: PostgreSQL database for all case data
- **No /tmp issues**: Data persists across deployments
- **Full Next.js 14 Support**: App Router works perfectly
- **Auto-scaling**: Railway handles traffic spikes
- **Zero Config**: Everything automated via CLI

## Post-Deployment Commands

### View deployment status:
```bash
railway status
```

### View live logs:
```bash
railway logs
```

### Open app in browser:
```bash
railway open
```

### Update environment variable:
```bash
railway variables --set KEY=VALUE
```

### Redeploy after code changes:
```bash
git push origin master  # Push to GitHub
railway up              # Deploy to Railway
```

## Environment Variables

The script automatically reads from `.env.local` and sets:
- ANTHROPIC_API_KEY
- SENDGRID_API_KEY
- STRIPE_SECRET_KEY (if present)
- Any other variables in your .env.local

Plus Railway automatically provides:
- DATABASE_URL (PostgreSQL connection string)
- PORT (assigned by Railway)

## Troubleshooting

### "RAILWAY_TOKEN not set" error
Get your token from https://railway.app/account/tokens and run:
```bash
export RAILWAY_TOKEN='your-token-here'
```

### Check if deployment succeeded:
```bash
railway logs --tail 100
```

### Database not ready:
The script waits 30 seconds for PostgreSQL to initialize. If you see database connection errors, wait a bit longer and the app will auto-restart.

## Cost

Railway offers:
- **$5 free credit per month**
- **Pay-as-you-go** after that
- Typically costs $5-10/month for this app with moderate usage

## Migration from Netlify/Vercel

This Railway setup **replaces** Netlify Blobs with PostgreSQL, which:
- Is more reliable
- Has better query capabilities
- Persists data permanently
- Works with any hosting provider

The deployment script handles everything automatically - no manual setup required!
