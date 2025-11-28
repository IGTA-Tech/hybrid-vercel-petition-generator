#!/bin/bash
set -e

echo "🚂 Railway Deployment Setup - Fully Automated"
echo "=============================================="

# Check if Railway token is set
if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ Error: RAILWAY_TOKEN environment variable not set"
  echo "Please set your Railway token:"
  echo "  export RAILWAY_TOKEN='your-token-here'"
  echo ""
  echo "Get your token from: https://railway.app/account/tokens"
  exit 1
fi

echo "✓ Railway token found"

# Read environment variables from .env.local
if [ ! -f ".env.local" ]; then
  echo "❌ Error: .env.local file not found"
  exit 1
fi

echo "✓ Found .env.local"

# Create new Railway project
echo ""
echo "📦 Creating Railway project..."
PROJECT_ID=$(railway init --name "visa-petition-generator" 2>&1 | grep -o 'project-[a-zA-Z0-9-]*' || railway status | grep -o 'project-[a-zA-Z0-9-]*' | head -1)

if [ -z "$PROJECT_ID" ]; then
  echo "⚠️  Project may already exist, linking to existing project..."
  railway link
else
  echo "✓ Project created: $PROJECT_ID"
fi

# Add PostgreSQL database
echo ""
echo "🗄️  Adding PostgreSQL database..."
railway add --database postgresql || echo "⚠️  Database may already exist"

# Wait for database to be ready
echo "⏳ Waiting for database to initialize (30 seconds)..."
sleep 30

# Get database connection string
echo ""
echo "🔗 Getting database URL..."
export DATABASE_URL=$(railway variables | grep DATABASE_URL | awk '{print $2}')

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: Could not get DATABASE_URL"
  exit 1
fi

echo "✓ Database URL obtained"

# Set environment variables from .env.local
echo ""
echo "⚙️  Setting environment variables..."

# Read each line from .env.local and set it
while IFS= read -r line; do
  # Skip empty lines and comments
  if [[ -z "$line" ]] || [[ "$line" =~ ^# ]]; then
    continue
  fi

  # Extract key and value
  KEY=$(echo "$line" | cut -d '=' -f 1)
  VALUE=$(echo "$line" | cut -d '=' -f 2-)

  # Skip if already DATABASE_URL (Railway provides this)
  if [ "$KEY" = "DATABASE_URL" ]; then
    continue
  fi

  # Set the variable
  echo "  Setting $KEY..."
  railway variables --set "$KEY=$VALUE" 2>&1 | grep -v "error" || true
done < .env.local

# Set NODE_ENV
echo "  Setting NODE_ENV=production..."
railway variables --set "NODE_ENV=production"

# Show all variables (without values for security)
echo ""
echo "✓ Environment variables set:"
railway variables | awk '{print "  - " $1}'

# Deploy
echo ""
echo "🚀 Deploying to Railway..."
railway up --detach

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Check deployment status:"
echo "   railway status"
echo ""
echo "📝 View logs:"
echo "   railway logs"
echo ""
echo "🌐 Open in browser:"
echo "   railway open"
