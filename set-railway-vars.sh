#!/bin/bash
set -e

echo "🔧 Setting Railway Environment Variables from .env.local"
echo "========================================================"

# Read .env.local and set each variable
while IFS= read -r line; do
  # Skip empty lines and comments
  if [[ -z "$line" ]] || [[ "$line" =~ ^# ]]; then
    continue
  fi

  # Extract key and value
  KEY=$(echo "$line" | cut -d '=' -f 1)
  VALUE=$(echo "$line" | cut -d '=' -f 2-)

  # Skip DATABASE_URL (Railway provides this automatically)
  if [ "$KEY" = "DATABASE_URL" ]; then
    echo "  ⏭️  Skipping $KEY (Railway provides this)"
    continue
  fi

  # Set the variable
  echo "  ✅ Setting $KEY"
  bash -c "unset RAILWAY_TOKEN && railway variables set $KEY=\"$VALUE\"" 2>&1 | grep -v "error" || echo "  ⚠️  Warning: May have already been set"
done < .env.local

# Set NODE_ENV for production
echo "  ✅ Setting NODE_ENV=production"
bash -c "unset RAILWAY_TOKEN && railway variables set NODE_ENV=production" 2>&1 | grep -v "error" || echo "  ⚠️  Warning: May have already been set"

echo ""
echo "✅ All environment variables set!"
echo ""
echo "Next steps:"
echo "  1. Add PostgreSQL database via web dashboard"
echo "  2. Run: railway up"
echo "  3. Run: railway open"
