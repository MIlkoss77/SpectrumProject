#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting infrastructure setup..."

# 1. Install PM2 logrotate to prevent disk space issues
if ! pm2 list | grep -q "pm2-logrotate"; then
    echo "📦 Installing pm2-logrotate..."
    pm2 install pm2-logrotate
fi

# 2. Configure logrotate
echo "⚙️ Configuring logrotate..."
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# 3. Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs backups

# 4. Set permissions
chmod +x scripts/*.sh

echo "✅ Infrastructure setup complete!"
echo "Next steps:"
echo "1. Configure Nginx using scripts/spectr-nginx.conf"
echo "2. Setup daily backups with crontab -e: 0 0 * * * $(pwd)/scripts/backup_db.sh"
