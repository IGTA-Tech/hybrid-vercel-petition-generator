# Netlify Deployment Guide - Visa Petition Generator

## 🎯 Overview

This guide will help you deploy the Visa Petition Generator to Netlify. This project has been specifically configured for Netlify to handle long-running document generation (30+ minutes) using Netlify's persistent function architecture.

## ✨ Why Netlify?

- **Persistent Function Instances**: Functions share in-memory storage across invocations
- **Long-running Processes**: Better support for background document generation
- **Instance Reuse**: Same function instance handles multiple requests
- **No Redis/KV Required**: In-memory Map storage works reliably

## 📋 Prerequisites

1. **Netlify Account** - https://netlify.com (free or paid)
2. **Netlify CLI** - Install with: `npm install -g netlify-cli`
3. **Node.js 20+** - Required for Next.js 14
4. **GitHub Repository** - Code must be in a Git repo

## 🚀 Quick Start Deployment

### Option 1: Automated Script

```bash
cd /home/innovativeautomations/hybrid-vercel-petition-generator
./deploy-netlify.sh
```

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
npm install

# 2. Login to Netlify
netlify login

# 3. Link to existing site or create new one
netlify link

# 4. Build the project
npm run build

# 5. Deploy to production
netlify deploy --prod
```

## 🔧 Initial Setup

### 1. Clone and Install

```bash
git clone https://github.com/IGTA-Tech/hybrid-vercel-petition-generator.git
cd hybrid-vercel-petition-generator
npm install
```

### 2. Set Environment Variables

See `NETLIFY_ENV_SETUP.md` for complete list. Quick setup:

```bash
netlify env:set ANTHROPIC_API_KEY "your_key"
netlify env:set PERPLEXITY_API_KEY "your_key"
netlify env:set LLAMA_CLOUD_API_KEY "your_key"
netlify env:set SENDGRID_API_KEY "your_key"
netlify env:set SENDGRID_FROM_EMAIL "your_email"
netlify env:set SENDGRID_REPLY_TO_EMAIL "your_email"
netlify env:set API2PDF_API_KEY "your_key"
```

### 3. Link to Netlify Site

**Option A: Link to existing site (visapetitionwriter.netlify.app)**
```bash
netlify link
# Select: "Use existing site"
# Choose: visapetitionwriter
```

**Option B: Create new site**
```bash
netlify init
# Follow prompts to create new site
```

### 4. Deploy

```bash
netlify deploy --prod
```

## 📁 Project Structure

```
hybrid-vercel-petition-generator/
├── app/
│   ├── api/               # API routes (converted to Netlify Functions)
│   │   ├── generate/      # Main document generation
│   │   ├── progress/      # Progress tracking
│   │   ├── upload/        # File upload (uses /tmp storage)
│   │   └── ...
│   ├── components/        # React components
│   ├── lib/              # Utility libraries
│   └── page.tsx          # Main application page
├── netlify.toml          # Netlify configuration
├── package.json          # Dependencies (Netlify-compatible)
├── NETLIFY_ENV_SETUP.md  # Environment variables guide
└── deploy-netlify.sh     # Automated deployment script
```

## 🔍 Key Configurations

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"

[functions]
  node_bundler = "esbuild"

[functions."api/*"]
  external_node_modules = ["sharp", "canvas", "tesseract.js"]
```

### In-Memory Storage (Global Maps)
```typescript
// Works on Netlify due to instance persistence
const globalForCases = global as unknown as {
  cases?: Map<string, PetitionCase>;
  progress?: Map<string, any>;
};

// Always persist - Netlify functions have better instance reuse
globalForCases.cases = cases;
globalForCases.progress = progress;
```

## 🧪 Testing

### Local Development
```bash
# Use Netlify Dev for local testing
netlify dev

# Or standard Next.js dev
npm run dev
```

### Test Document Generation
1. Navigate to deployed site
2. Fill out petition form
3. Upload test PDF
4. Click "Generate Documents"
5. Monitor progress in real-time
6. Verify email delivery

## 📊 Monitoring

### View Function Logs
```bash
# Real-time logs
netlify logs --follow

# Recent logs
netlify logs
```

### Netlify Dashboard
1. Go to https://app.netlify.com
2. Select your site
3. Navigate to **Functions** → View logs
4. Monitor generation progress

## ⚠️ Troubleshooting

### Issue: Build fails with module not found
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
netlify deploy --prod
```

### Issue: API routes return 404
**Solution**: Verify `@netlify/plugin-nextjs` is installed and configured in `netlify.toml`

### Issue: Environment variables not loading
**Solution**:
```bash
# Set variables
netlify env:set VARIABLE_NAME "value"

# Redeploy
netlify deploy --prod
```

### Issue: Generation fails with "Case ID not found"
**Solution**: This was a Vercel-specific issue. On Netlify, in-memory storage persists correctly. If you still see this:
1. Check function logs for errors
2. Verify global storage initialization in `/api/generate/route.ts`
3. Ensure function instance is reused (not cold-starting every time)

### Issue: File upload fails
**Solution**: Verify `/tmp` directory permissions. Netlify functions have access to `/tmp` for temporary storage.

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate API keys regularly** - Update in Netlify dashboard
3. **Use environment variables** - Never hardcode secrets
4. **Enable HTTPS** - Netlify provides this automatically
5. **Monitor usage** - Check API usage for unexpected spikes

## 📈 Scaling Considerations

### Current Architecture Supports:
- ✅ Concurrent petition generations
- ✅ 30+ minute generation times
- ✅ Multiple users simultaneously
- ✅ File uploads up to 50MB
- ✅ In-memory storage for active cases

### If you need to scale beyond:
- Consider Netlify Pro plan for increased function limits
- Implement Redis/database for persistent storage
- Use Netlify Blobs for file storage (already in dependencies)
- Add rate limiting for API protection

## 🔄 Continuous Deployment

### GitHub Integration
1. Go to Netlify Dashboard
2. Site settings → Build & deploy → Continuous deployment
3. Link GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Enable auto-deploy on push to `master`

### Manual Deploys
```bash
# Deploy specific branch
netlify deploy --prod --branch=main

# Deploy with message
netlify deploy --prod --message="Updated document generation"
```

## 📞 Support

- **Netlify Docs**: https://docs.netlify.com
- **Next.js on Netlify**: https://docs.netlify.com/frameworks/next-js/
- **Netlify Functions**: https://docs.netlify.com/functions/overview/

## ✅ Deployment Checklist

- [ ] All environment variables set in Netlify
- [ ] `netlify.toml` configured correctly
- [ ] Dependencies installed (`npm install`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Deployed to production (`netlify deploy --prod`)
- [ ] Test file upload feature
- [ ] Test document generation (wait for completion)
- [ ] Verify email delivery
- [ ] Check function logs for errors
- [ ] Monitor first few real petition generations

## 🎉 You're Done!

Your Visa Petition Generator is now running on Netlify with proper support for long-running background processes!

**Production URL**: Check `netlify status` or Netlify dashboard for your site URL
