# Portfolio Website - Deployment Guide

Deploy your portfolio website to a personal Linux server using Docker Compose, Nginx, and Let's Encrypt SSL.

## Prerequisites

- **Linux Server** (Ubuntu 20.04+ recommended)
- **SSH Access** to your server
- **Domain Name** (optional but recommended for SSL)
- **Docker & Docker Compose** installed on server
- **Nginx** installed on server
- **Git** installed on server

---

## Step 1: Server Setup

### 1.1 Connect to Your Server
```bash
ssh user@your-server-ip
# Or if using a domain
ssh user@your-domain.com
```

### 1.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git
```

### 1.3 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

### 1.4 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
curl http://localhost
```

### 1.5 Install Certbot for SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 2: Prepare Application

### 2.1 Clone Repository
```bash
cd /var/www
sudo git clone <your-git-repo-url> portfolio
sudo chown -R $USER:$USER portfolio
cd portfolio
```

Or copy your local files:
```bash
scp -r ~/Desktop/Websites/02_Site_vitrine/* user@your-server:/var/www/portfolio/
```

### 2.2 Configure Environment

#### Backend .env
```bash
cat > backend/.env << 'EOF'
DATABASE_URL="postgresql://portfolio:portfolio_dev@postgres:5432/portfolio_db"
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secure-random-key-here-change-this
JWT_EXPIRES_IN=7d
ADMIN_PASSWORD=your-secure-admin-password-change-this
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@yourname.com
FRONTEND_URL=https://your-domain.com
EOF
```

#### Frontend .env.local
```bash
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
EOF
```

**⚠️ IMPORTANT:** Replace:
- `JWT_SECRET` with a long random string: `openssl rand -base64 32`
- `ADMIN_PASSWORD` with a strong password
- SMTP credentials with your email service (Gmail, SendGrid, etc.)
- `your-domain.com` with your actual domain

### 2.3 Update docker-compose.yml for Production

Edit `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: portfolio_dev
      POSTGRES_DB: portfolio_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U portfolio"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://portfolio:portfolio_dev@postgres:5432/portfolio_db
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      SMTP_FROM: ${SMTP_FROM}
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Step 3: Configure Nginx Reverse Proxy

### 3.1 Create Nginx Config
```bash
sudo cat > /etc/nginx/sites-available/portfolio << 'EOF'
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

### 3.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

---

## Step 4: Setup SSL with Let's Encrypt

### 4.1 Generate SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@gmail.com --agree-tos -n
```

### 4.2 Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal
sudo certbot renew --dry-run
```

---

## Step 5: Deploy with Docker Compose

### 5.1 Build and Start Services
```bash
cd /var/www/portfolio

# Load environment variables
set -a
source backend/.env
source frontend/.env.local
set +a

# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 5.2 Initialize Database
```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed sample data (optional)
docker-compose exec backend npm run db:seed
```

### 5.3 View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

## Step 6: Verify Deployment

### 6.1 Test Endpoints
```bash
# Frontend
curl https://your-domain.com

# API Health
curl https://your-domain.com/api/health

# Projects endpoint
curl https://your-domain.com/api/projects
```

### 6.2 Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### 6.3 Check Docker Services
```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

---

## Step 7: Backup & Maintenance

### 7.1 Database Backup
```bash
# Create backup directory
mkdir -p /var/backups/portfolio

# Daily backup script
cat > /home/user/backup-portfolio.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/portfolio"
DATE=$(date +%Y%m%d_%H%M%S)

cd /var/www/portfolio

# Backup database
docker-compose exec -T postgres pg_dump -U portfolio portfolio_db > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/user/backup-portfolio.sh

# Add to crontab
crontab -e
# Add line: 0 2 * * * /home/user/backup-portfolio.sh
```

### 7.2 Update Application
```bash
cd /var/www/portfolio

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 7.3 Monitor Services
```bash
# Check service health
docker-compose ps

# View resource usage
docker stats

# Check disk space
df -h

# Check logs for errors
docker-compose logs backend | grep -i error
```

---

## Step 8: Admin Login

### 8.1 Get Admin Token
```bash
# Login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'

# Response:
# {"token":"eyJhbGc...","expiresIn":"7d"}
```

### 8.2 Use Token for Admin Requests
```bash
# Add project
curl -X POST https://your-domain.com/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project",
    "description": "Project description",
    "technologies": ["React", "Node.js"],
    "images": ["https://example.com/image.jpg"],
    "deployedUrl": "https://project.com",
    "githubUrl": "https://github.com/project"
  }'
```

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 5000
sudo lsof -i :5000

# Change port in docker-compose.yml and nginx config
```

### Database Connection Issues
```bash
# Verify postgres is running
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

### SSL Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Application Not Loading
```bash
# Check all services running
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Full restart
docker-compose down
docker-compose up -d
```

---

## Security Checklist

- [ ] Change `JWT_SECRET` to a random secure key
- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Update SMTP credentials for your email service
- [ ] Enable firewall (UFW): `sudo ufw enable`
- [ ] Allow SSH, HTTP, HTTPS: 
  ```bash
  sudo ufw allow 22
  sudo ufw allow 80
  sudo ufw allow 443
  ```
- [ ] Disable root login
- [ ] Use SSH keys instead of passwords
- [ ] Regular backups enabled
- [ ] Monitor logs for suspicious activity
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`

---

## Performance Tips

1. **Enable Gzip Compression** in Nginx:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

2. **Enable Caching** in Nginx:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m use_temp_path=off;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
}
```

3. **Monitor Resource Usage**:
```bash
# Real-time monitoring
docker stats

# Check logs for slow queries
docker-compose logs postgres | grep duration
```

---

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check Nginx configuration: `sudo nginx -t`
4. Restart services: `docker-compose restart`
5. Review troubleshooting section above

---

**Your portfolio is now live!** 🚀

Access it at: **https://your-domain.com**

API Documentation: **https://your-domain.com/api**
