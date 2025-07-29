#!/bin/bash

echo "🚀 Starting Vercel deployment..."

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN environment variable is not set"
    echo "Please set your Vercel token: export VERCEL_TOKEN=your_token_here"
    exit 1
fi

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Deploy to Vercel
echo "🔄 Deploying to Vercel..."
vercel --prod --token=$VERCEL_TOKEN

echo "✅ Deployment complete!"
echo "🌐 Your site should be live at: https://experiences.olta.art"