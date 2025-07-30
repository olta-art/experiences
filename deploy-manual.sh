#!/bin/bash

echo "🚀 Manual Vercel Deployment Script"
echo "=================================="

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN is not set!"
    echo ""
    echo "Please set your token first:"
    echo "export VERCEL_TOKEN=your_actual_vercel_token"
    echo ""
    echo "You can get your token from: https://vercel.com/account/tokens"
    exit 1
fi

echo "✅ Token found - proceeding with deployment..."
echo ""

# Show what we're deploying
echo "📁 Deploying from: $(pwd)"
echo "🌐 Target: experiences.olta.art"
echo "📝 Mobile fix: INCLUDED"
echo ""

# Deploy to production
echo "🔄 Starting deployment..."
vercel --prod --token=$VERCEL_TOKEN

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🎉 Your mobile fix should now be live at: https://experiences.olta.art"
    echo ""
    echo "🔍 Check your mobile device to verify the fix is working!"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check the error messages above."
fi