# 🚀 Deploy to Railway in 2 Commands

## Quick Start (No Manual Setup Required!)

### 1. Get your Railway token
Visit: https://railway.app/account/tokens

Click "Create Token" and copy it.

### 2. Run these commands:

```bash
# Set your token (replace with your actual token)
export RAILWAY_TOKEN='your-token-here'

# Deploy everything automatically
./railway-deploy.sh
```

**That's it!** The script will:
- Create Railway project
- Add PostgreSQL database
- Copy ALL environment variables from .env.local automatically
- Deploy your app
- Give you the live URL

## What Happens Behind the Scenes

The `railway-deploy.sh` script:

1. ✅ Reads your `.env.local` file
2. ✅ Creates a new Railway project named "visa-petition-generator"
3. ✅ Provisions a PostgreSQL database (no manual setup!)
4. ✅ Sets **every single environment variable** via CLI
5. ✅ Deploys your Next.js 14 app
6. ✅ Returns the live URL

**Zero manual variable entry required!**

## After Deployment

### View your app:
```bash
railway open
```

### Check logs:
```bash
railway logs
```

### Check status:
```bash
railway status
```

## Why Railway?

✅ **Full Next.js 14 App Router support** (Netlify plugin has bugs)
✅ **PostgreSQL for persistent storage** (No more /tmp issues)
✅ **CLI-based deployment** (No manual variable copying)
✅ **Auto-scaling** (Handles traffic spikes)
✅ **$5/month free tier** (Plenty for this app)

## Troubleshooting

### "Railway token not set"
```bash
export RAILWAY_TOKEN='your-actual-token'
```

### "Command not found: railway"
Railway CLI is already installed. Try:
```bash
which railway
```

### Need to update environment variables later?
```bash
railway variables --set KEY=VALUE
```

### Want to redeploy after code changes?
```bash
git push origin master  # Push changes
railway up              # Deploy to Railway
```

## Cost Estimate

- **Free tier**: $5 credit/month
- **Typical cost**: $5-10/month with moderate usage
- **PostgreSQL**: Included in Railway's pricing

Much cheaper than manually managing servers!
