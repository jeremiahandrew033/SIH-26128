# Quick Netlify deployment script for Livestock Sentinel (Windows PowerShell)

Write-Host "🚀 Livestock Sentinel - Netlify Deployment Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if netlify-cli is installed
$netlifyExists = $null -ne (Get-Command netlify -ErrorAction SilentlyContinue)
if (-not $netlifyExists) {
    Write-Host "Installing Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# Build frontend
Write-Host ""
Write-Host "📦 Building frontend..." -ForegroundColor Cyan
Set-Location frontend
npm ci
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Deploy to Netlify
Write-Host ""
Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Cyan
Set-Location ..
netlify deploy --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Visit your site at: https://your-site-name.netlify.app" -ForegroundColor Yellow
