# Server Setup Guide: Spectr Trading

Before running the deployment script, ensure your server (VPS) meets the following requirements:

## 1. System Dependencies
The app requires Node.js and Git.

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or higher recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y
```

## 2. Process Management (Recommended)
We recommend using **PM2** to keep the application running in the background and restart it automatically if it crashes.

```bash
sudo npm install -g pm2
```

## 3. Initial Setup
1. Clone the repository (if not already done):
   ```bash
   git clone -b feature/live-bybit https://github.com/MIlkoss77/SpectrumProject.git
   cd SpectrumProject
   ```
2. Create and configure your `.env` file:
   ```bash
   cp .env.example .env
   # Ensure DATABASE_URL="file:./dev.db" is present in your .env
   nano .env
   ```
3. Give execution permissions to the deployment script:
   ```bash
   chmod +x scripts/deploy.sh
   ```

## 4. Deploying
Simply run:
```bash
./scripts/deploy.sh
```

## 5. Troubleshooting
- **Database Errors**: Ensure the `prisma/` folder exists and you have write permissions for `dev.db`.
- **Port Busy**: If the server fails to start, check if port 3000 (or your configured port) is already in use.
- **NPM Errors**: If `npm install` fails, try `npm ci --legacy-peer-deps`.
