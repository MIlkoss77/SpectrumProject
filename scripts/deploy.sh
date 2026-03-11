#!/bin/bash

# Spectr Trading - Deployment Script
# This script automates the deployment process on a VPS.

# --- Configuration ---
APP_NAME="spectr-trading"
GIT_BRANCH="feature/live-bybit" # Change to 'main' when ready
BUILD_FRONTEND=true

# --- Colors ---
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🚀 Starting Deployment for ${APP_NAME}...${NC}"

# 1. Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from Git (${GIT_BRANCH})...${NC}"
git pull origin $GIT_BRANCH
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed. Please check your credentials and network connection.${NC}"
    exit 1
fi

# 2. Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ NPM install failed.${NC}"
    exit 1
fi

# 3. Prisma setup
echo -e "${YELLOW}🗄️ Running Prisma migrations...${NC}"
npx prisma generate
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Prisma migration failed.${NC}"
    exit 1
fi

# 4. Build Frontend (if required)
if [ "$BUILD_FRONTEND" = true ]; then
    echo -e "${YELLOW}🏗️ Building Frontend...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Frontend build failed.${NC}"
        exit 1
    fi
fi

# 5. Restart Process (PM2 recommended)
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}♻️ Restarting application via PM2...${NC}"
    # Try to restart, if fails (first time), start it
    pm2 restart $APP_NAME || pm2 start server/index.js --name $APP_NAME
else
    echo -e "${YELLOW}⚠️ PM2 not found. Re-starting server manually...${NC}"
    # This part is risky as it depends on how the user ran it before.
    # We recommend using PM2.
    pkill -f "node server/index.js" || true
    nohup node server/index.js > server.log 2>&1 &
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${CYAN}-----------------------------------${NC}"
echo -e "Server is running. Logs can be viewed with: ${YELLOW}pm2 logs $APP_NAME${NC} or ${YELLOW}tail -f server.log${NC}"
