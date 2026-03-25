#!/bin/bash

# Spectr Trading - VPS Deployment Script (Ubuntu/Debian)

echo "🚀 Starting Spectr Trading Deployment..."

# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v18+) if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 3. Install PM2 and Nginx
sudo npm install -g pm2
sudo apt install -y nginx

# 4. Preparation
WEB_ROOT="/var/www/spectrum"
echo "📂 Setting up project in $WEB_ROOT..."

# Ensure we are in the repo to get latest changes
git config core.ignorecase false

sudo mkdir -p $WEB_ROOT
sudo cp -r ./* $WEB_ROOT
cd $WEB_ROOT

echo "🧹 Cleaning up old dependencies and build..."
sudo rm -rf node_modules package-lock.json dist

echo "🔨 Installing Dependencies (this may take a minute)..."
sudo npm install --unsafe-perm

echo "🏗️ Building Frontend..."
sudo npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed! 'dist' directory not found."
    exit 1
fi

# 5. Start Backend with PM2
echo "⚙️ Starting Backend Server..."
pm2 delete spectr-api 2>/dev/null || true
pm2 start "$WEB_ROOT/server/index.js" --name "spectr-api"

# 6. Configure Nginx
echo "🌐 Configuring Nginx..."
# Try to get the public IP for server_name, fallback to _
IP_ADDR=$(hostname -I | awk '{print $1}')
cat <<EOF | sudo tee /etc/nginx/sites-available/spectr
server {
    listen 80;
    server_name $IP_ADDR _; # Specific IP + fallback

    root $WEB_ROOT/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API Backend (Includes all proxies now)
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' wss://stream.binance.com:9443 https://api.binance.com https://api.bybit.com https://api.etherscan.io https://api.solscan.io https://api.mainnet-beta.solana.com;" always;
}
EOF

sudo ln -sf /etc/nginx/sites-available/spectr /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Deployment Complete!"
echo "📡 Site is live on your VPS IP address."
pm2 status
