#!/bin/bash
# Quick Netlify deployment script for Livestock Sentinel

echo "🚀 Livestock Sentinel - Netlify Deployment Script"
echo "=================================================="

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build frontend
echo ""
echo "📦 Building frontend..."
cd frontend
npm ci
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Netlify
echo ""
echo "🌐 Deploying to Netlify..."
cd ..
netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo "Visit your site at: https://your-site-name.netlify.app"
