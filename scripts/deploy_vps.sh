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
# Assuming the script is run from the project root
echo "🔨 Installing Dependencies..."
npm install

echo "🏗️ Building Frontend..."
npm run build

# 5. Start Backend with PM2
echo "⚙️ Starting Backend Server..."
pm2 start server/index.js --name "spectr-api"

# 6. Configure Nginx
echo "🌐 Configuring Nginx..."
cat <<EOF | sudo tee /etc/nginx/sites-available/spectr
server {
    listen 80;
    server_name _; # Change this to your domain or IP

    root $(pwd)/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/spectr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Deployment Complete!"
echo "📡 Site is live on your VPS IP address."
pm2 status
