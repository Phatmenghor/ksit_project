# 🚀 Complete Deployment Guide - KSIT Mobile App

## 📋 Overview

This deployment package includes two scripts that are fully auto-configured from your `.env.production` file:

1. **`deploy.sh`** - Full deployment (build + nginx + pm2)
2. **`setup-nginx.sh`** - Nginx-only configuration

## 🔧 What Was Fixed

### CORS Issue Resolution

The original nginx configuration was blocking the `X-Request-Id` header, causing this error:

```
Access to XMLHttpRequest has been blocked by CORS policy:
Request header field x-request-id is not allowed by Access-Control-Allow-Headers
```

**Fix Applied:**

- Added `X-Request-Id` to `Access-Control-Allow-Headers` in both regular requests and OPTIONS preflight
- Updated from: `"Authorization, Content-Type, Accept, X-Requested-With, Origin"`
- Updated to: `"Authorization, Content-Type, Accept, X-Requested-With, Origin, X-Request-Id"`

## 📦 Files Included

### 1. deploy.sh (Complete Deployment)

Full deployment script that:

- ✅ Auto-configures from `.env.production`
- ✅ Checks and adds 3GB swap if needed
- ✅ Stops PM2 application
- ✅ Pulls latest code from git
- ✅ Cleans cache
- ✅ Installs dependencies
- ✅ Builds Next.js application
- ✅ Creates PM2 configuration
- ✅ Starts PM2 application
- ✅ Configures Nginx with CORS fix

### 2. setup-nginx.sh (Nginx Only)

Nginx-only configuration script that:

- ✅ Auto-configures from `.env.production`
- ✅ Removes old nginx configs
- ✅ Creates new nginx config with CORS support
- ✅ Tests and reloads nginx

## 🎯 Quick Start

### Option 1: Full Deployment (Recommended)

```bash
# Upload deploy.sh and .env.production to your server
sudo bash deploy.sh
```

### Option 2: Nginx Only (If app is already running)

```bash
# Upload setup-nginx.sh and .env.production to your server
sudo ./setup-nginx.sh
```

## 📝 Current Configuration (from .env.production)

```
App Name:          ksit
External Port:     8443
Internal Port:     3000
Backend API:       http://159.223.75.193:8080
Frontend API:      http://159.223.75.193:8443/api
Server IP:         159.223.75.193
Git Branch:        production
```

## 🌐 Access URLs

After deployment, access your application at:

- **Frontend**: http://159.223.75.193:8443
- **API Endpoint**: http://159.223.75.193:8443/api
- **Backend Direct**: http://159.223.75.193:8080
- **Health Check**: http://159.223.75.193:8443/health
- **Swagger**: http://159.223.75.193:8080/swagger-ui/swagger-ui/index.html

## ⚡ API Flow

```
1. Frontend calls:     http://159.223.75.193:8443/api/v1/*
2. Nginx receives:     Port 8443
3. Nginx proxies to:   http://159.223.75.193:8080/api/*
4. CORS headers allow: X-Request-Id, Authorization, Content-Type, etc.
5. Frontend served:    127.0.0.1:3000 (PM2)
```

## 🧪 Testing

### Test Health Check

```bash
curl http://159.223.75.193:8443/health
```

### Test API Login

```bash
curl -X POST http://159.223.75.193:8443/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"your@email.com","password":"yourpass"}'
```

### Check PM2 Status

```bash
pm2 status
pm2 logs ksit
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
cat /etc/nginx/conf.d/ksit.conf
```

## 🔍 Troubleshooting

### If CORS error persists:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check nginx config:
   ```bash
   cat /etc/nginx/conf.d/ksit.conf | grep "Access-Control-Allow-Headers"
   ```
   Should show: `X-Request-Id` in the list

### If deployment fails:

1. Check logs:

   ```bash
   pm2 logs ksit
   tail -f logs/error.log
   ```

2. Verify .env.production is present:

   ```bash
   cat .env.production
   ```

3. Check nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Memory issues during build:

If build fails due to memory, consider building locally:

```bash
# On local machine:
npm run build
git add -f .next/BUILD_ID .next/package.json .next/server .next/static .next/types
git commit -m "Add pre-built files"
git push

# On server:
git pull
pm2 restart ksit
```

## 📊 Configuration Variables

The scripts read these variables from `.env.production`:

**Required:**

- `APP_NAME`
- `EXTERNAL_PORT`
- `PORT`
- `NEXT_PUBLIC_API_BASE_URL`
- `BACKEND_API_URL`
- `NEXT_PUBLIC_API_BASE_URL_IMAGE`

**Optional (with defaults):**

- `NGINX_CLIENT_MAX_BODY_SIZE` (default: 50M)
- `NGINX_PROXY_TIMEOUT` (default: 90s)
- `NGINX_KEEPALIVE_CONNECTIONS` (default: 32)
- `NGINX_MAX_FAILS` (default: 3)
- `NGINX_FAIL_TIMEOUT` (default: 30s)
- `STATIC_CACHE_TIME` (default: 1h)
- `NEXTJS_CACHE_TIME` (default: 5m)

## 🎉 Success Indicators

After successful deployment, you should see:

1. ✅ PM2 shows `ksit` app online
2. ✅ Nginx test passes (`nginx -t`)
3. ✅ Health check returns 200 OK
4. ✅ Frontend loads without errors
5. ✅ API calls work without CORS errors
6. ✅ No `X-Request-Id` CORS errors in browser console

## 📞 Support

If you encounter any issues:

1. Check all logs (PM2, Nginx, application)
2. Verify all required variables in `.env.production`
3. Ensure ports 8443 and 3000 are not in use
4. Verify backend is running on port 8080

## 🔐 Security Notes

- The scripts require root/sudo access
- Nginx configuration includes security headers
- CORS is configured to allow all origins (`*`) - adjust if needed for production
- Swap is configured with swappiness=60 for optimal performance

---

**Generated for:** KSIT Institute Management System
**Configuration:** Auto-loaded from `.env.production`
**CORS Fix:** X-Request-Id header support added
**Last Updated:** November 2024
