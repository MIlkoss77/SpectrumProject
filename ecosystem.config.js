module.exports = {
  apps: [
    {
      name: 'spectr-api',
      script: './server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 8787
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'spectr-bot',
      script: './bot/index.js',
      instances: 1,
      env_production: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/bot-error.log',
      out_file: './logs/bot-out.log',
      autorestart: true
    }
  ]
};
