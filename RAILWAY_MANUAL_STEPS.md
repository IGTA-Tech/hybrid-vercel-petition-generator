# Railway Deployment - Final Steps (Manual)

## ✅ What's Already Done:
- Railway project created: `visa-petition-generator`
- Project linked to this directory
- You're logged in as: `applications@innovativeglobaltalent.agency`

## 🔗 Project URL:
https://railway.com/project/dc0a15c0-876b-483e-8fae-7dfdf63574ec

---

## 📋 Remaining Steps (5 minutes):

### Step 1: Add PostgreSQL Database (Web Dashboard)
1. **Open your project**: https://railway.com/project/dc0a15c0-876b-483e-8fae-7dfdf63574ec
2. **Click "New" button** (top right)
3. **Select "Database"**
4. **Choose "PostgreSQL"**
5. **Wait 30 seconds** for it to provision

### Step 2: Set Environment Variables (CLI - Automated!)

I've created a script that will automatically read `.env.local` and set ALL variables:

```bash
# Run this script to set all environment variables automatically:
./set-railway-vars.sh
```

This will set:
- ✅ ANTHROPIC_API_KEY
- ✅ SENDGRID_API_KEY (your new key)
- ✅ PERPLEXITY_API_KEY
- ✅ LLAMA_CLOUD_API_KEY
- ✅ API2PDF_API_KEY
- ✅ All email configuration
- ✅ All other variables from .env.local

**No manual copying required!**

### Step 3: Deploy Application

```bash
railway up
```

### Step 4: Check Deployment

```bash
# View logs
railway logs

# Check status
railway status

# Open in browser
railway open
```

---

## 🎯 Quick Summary:

1. Add PostgreSQL via web dashboard (1 click)
2. Run `./set-railway-vars.sh` (automated!)
3. Run `railway up` (deploy)
4. Run `railway open` (view your app!)

**Total time: ~5 minutes**

---

## 💡 Why Manual Database Addition?

Railway CLI changed in recent versions - databases must now be added through the web dashboard for better control and visibility. Everything else is still automated via CLI!

## 🔐 Environment Variables

The script will automatically read ALL variables from your `.env.local` file and set them in Railway, including:
- ANTHROPIC_API_KEY
- SENDGRID_API_KEY
- PERPLEXITY_API_KEY
- LLAMA_CLOUD_API_KEY
- API2PDF_API_KEY
- SENDGRID_FROM_EMAIL
- SENDGRID_REPLY_TO_EMAIL
- CUSTOMER_SERVICE_EMAIL

Plus Railway will automatically add:
- `DATABASE_URL` (from PostgreSQL)
- `PORT` (assigned by Railway)

---

## ✅ After Deployment

Your app will be live at a URL like:
`https://visa-petition-generator-production.up.railway.app`

You'll get persistent PostgreSQL storage with no more "/tmp" or "Case ID not found" issues!
