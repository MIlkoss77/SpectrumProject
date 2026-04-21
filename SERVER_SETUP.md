# Spectr Trading — Production Server Setup (Unified VPS)

Этот документ содержит базовые шаги для запуска Spectr Trading на едином Ubuntu VPS сервере.

Инфраструктура:
- **Frontend (PWA)** отдается Nginx как статичный SPA (Single Page Application).
- **Backend (Node.js)** работает через PM2 на порту 3000 и проксируется с Nginx (`/api/`).

---

## Шаг 1: Сборка Frontend
Перед загрузкой на сервер, сгенерируй продакшн сборку:
```bash
npm install
npm run build
```
Папка `dist/` будет содержать все необходимые файлы. Загрузи содержимое папки `dist/` на сервер в `/var/www/spectr-trading/frontend`.

## Шаг 2: Запуск Backend через PM2
Загрузи содержимое папки `server/` на сервер в `/var/www/spectr-trading/backend`.
```bash
cd /var/www/spectr-trading/backend
npm install
# Запускаем сервер 
pm2 start index.js --name "spectr-api"
pm2 save
pm2 startup
```

## Шаг 3: Настройка Nginx
Создай файл конфигурации для Nginx: `sudo nano /etc/nginx/sites-available/spectr-trading`

Вставь следующий конфиг, заменив `yourdomain.com` на твой домен:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/spectr-trading/frontend;
    index index.html;

    # 1. Раздача статики Frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Проксирование API на Backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Передача IP-адреса для rate limiter'ов
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_addrs;
        
        # CORS (Если необходимо)
        proxy_set_header Access-Control-Allow-Origin *;
    }

    # Кеширование ассетов
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}
```

Активация сайта:
```bash
sudo ln -s /etc/nginx/sites-available/spectr-trading /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Шаг 4: SSL Сертификаты (Let's Encrypt)
Для работы Service Worker и PWA обязательно наличие HTTPS!

```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot автоматически изменит файл `/etc/nginx/sites-available/spectr-trading` на HTTPS порты (443).

## Шаг 5: Переменные Окружения (.env)
Не забудь пробросить боевые ключи в папке backend (e.g. `/var/www/spectr-trading/backend/.env`).
- Порт должен быть 3000 (так настроен Nginx).
- Дабавь IPN-секрет NOWPayments: `NOWPAYMENTS_IPN_SECRET=твой-секрет`.

Поздравляю! Теперь у тебя есть полноценный production flow.
