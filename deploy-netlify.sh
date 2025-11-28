#!/bin/bash

echo "🚀 Starting Netlify Deployment for Visa Petition Generator"
echo "=========================================================="

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if we're logged in
echo "📝 Checking Netlify authentication..."
netlify status || {
    echo "❌ Not logged into Netlify. Please run: netlify login"
    exit 1
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to production
echo "🚀 Deploying to Netlify Production..."
netlify deploy --prod

if [ $? -eq 0 ]; then
    echo "=========================================================="
    echo "✅ Deployment Complete!"
    echo "=========================================================="
    echo ""
    echo "📋 Next steps:"
    echo "1. Check deployment at: https://app.netlify.com/"
    echo "2. Verify environment variables are set"
    echo "3. Test document generation"
    echo ""
    echo "🔧 Useful commands:"
    echo "  - View logs: netlify logs"
    echo "  - Check status: netlify status"
    echo "  - List env vars: netlify env:list"
else
    echo "❌ Deployment failed! Check errors above."
    exit 1
fi
