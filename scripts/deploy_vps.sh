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

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Binance Proxy
    location /binance-api/ {
        proxy_pass https://api.binance.com/;
        proxy_ssl_server_name on;
        proxy_set_header Host api.binance.com;
    }

    # Bybit Proxy
    location /bybit-api/ {
        proxy_pass https://api.bybit.com/;
        proxy_ssl_server_name on;
        proxy_set_header Host api.bybit.com;
    }

    # Etherscan Proxy
    location /etherscan-api/ {
        proxy_pass https://api.etherscan.io/;
        proxy_ssl_server_name on;
        proxy_set_header Host api.etherscan.io;
    }

    # Solscan Proxy
    location /solscan-api/ {
        proxy_pass https://api.solscan.io/;
        proxy_ssl_server_name on;
        proxy_set_header Host api.solscan.io;
    }

    # ChainGPT RSS Proxy
    location /chaingpt-rss/ {
        proxy_pass https://news.chaingpt.org/rss/;
        proxy_ssl_server_name on;
        proxy_set_header Host news.chaingpt.org;
    }
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
