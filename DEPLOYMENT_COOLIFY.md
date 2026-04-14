# Portfolio Website - Deployment Guide for Coolify

Deploy your portfolio website to Coolify with automated Docker management, built-in PostgreSQL, and one-click SSL.

**Coolify Benefits:**
- ✅ No manual Docker Compose commands
- ✅ Built-in PostgreSQL database service
- ✅ Automatic SSL/TLS certificates
- ✅ Easy environment variable management
- ✅ Automatic deployments from Git
- ✅ One-click backups
- ✅ Resource monitoring & logs
- ✅ Custom domains & subdomains

---

## Step 1: Coolify Server Setup

### 1.1 Install Coolify on Your Server

```bash
# SSH into your server
ssh user@your-server-ip

# Install Coolify (one command)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

**Expected output:**
```
Coolify installed successfully!
Access it at: https://your-server-ip:3000
Default credentials: admin / admin
```

### 1.2 Access Coolify Dashboard

1. Open browser: `https://your-server-ip:3000`
2. Login with default credentials (admin / admin)
3. Change password immediately (Settings → Account)
4. Add your SSH key for security (Settings → SSH Keys)

### 1.3 Configure Server

In Coolify Dashboard:
1. Go to **Settings → Servers**
2. Verify your server is listed
3. Check Docker status: should show "Connected"
4. Check disk space (needs ~20GB minimum)

---

## Step 2: Create Coolify Project

### 2.1 Create New Project

1. Click **Projects** in left sidebar
2. Click **+ New Project**
3. Enter name: `portfolio-website`
4. Click **Create**

### 2.2 Create Services

In your project, you'll create 3 services:
- **PostgreSQL Database**
- **Backend API** (Express.js)
- **Frontend** (Next.js)

---

## Step 3: Setup PostgreSQL Database

### 3.1 Add Database Service

1. In project, click **+ New Service**
2. Select **PostgreSQL**
3. Configure:
   - **Name:** `portfolio-db`
   - **Version:** 15
   - **Database:** `portfolio_db`
   - **Username:** `portfolio`
   - **Password:** Generate strong password (Coolify will generate one)
4. Click **Save**

Coolify will:
- ✅ Create PostgreSQL container
- ✅ Create volume for persistence
- ✅ Set up backups automatically
- ✅ Generate credentials in environment

**Note:** Copy the connection string Coolify generates:
```
postgresql://portfolio:PASSWORD@portfolio-db:5432/portfolio_db
```

---

## Step 4: Deploy Backend API

### 4.1 Add Backend Service

1. In project, click **+ New Service**
2. Select **Docker Compose** (or **Generic Docker**)
3. Configure:
   - **Name:** `portfolio-backend`
   - **Image:** Use Git repository

### 4.2 Configure Backend as Git Source

Choose: **Git Repository**

1. **Repository URL:** `https://github.com/samzalzz/02_Site_vitrine.git`
2. **Branch:** `main`
3. **Build Path:** `backend`
4. **Dockerfile:** Select `Dockerfile` in backend/
5. **Port:** `5000`

### 4.3 Set Environment Variables

Click **Variables** and add:

```
DATABASE_URL=postgresql://portfolio:PASSWORD@portfolio-db:5432/portfolio_db
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secure-random-key-here
JWT_EXPIRES_IN=7d
ADMIN_PASSWORD=your-secure-admin-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@yourname.com
FRONTEND_URL=https://your-domain.com
```

**⚠️ IMPORTANT:** 
- Generate JWT_SECRET: `openssl rand -base64 32`
- Use strong ADMIN_PASSWORD
- Get SMTP credentials from your email provider

### 4.4 Deploy

1. Click **Deploy**
2. Coolify will:
   - ✅ Clone repository
   - ✅ Build Docker image
   - ✅ Start container
   - ✅ Set up networking
   - ✅ Create logs

**Monitor deployment:**
- Click **Logs** tab
- Watch build progress
- Verify "Build successful" message

### 4.5 Verify Backend

```bash
# From your server
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-04-14T..."}
```

---

## Step 5: Deploy Frontend

### 5.1 Add Frontend Service

1. In project, click **+ New Service**
2. Select **Docker Compose** (or **Generic Docker**)
3. Configure:
   - **Name:** `portfolio-frontend`
   - **Image:** Use Git repository

### 5.2 Configure Frontend as Git Source

1. **Repository URL:** `https://github.com/samzalzz/02_Site_vitrine.git`
2. **Branch:** `main`
3. **Build Path:** `frontend`
4. **Dockerfile:** Select `Dockerfile` in frontend/
5. **Port:** `3000`

### 5.3 Set Environment Variables

Click **Variables** and add:

```
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
NODE_ENV=production
```

### 5.4 Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Verify "Build successful"

---

## Step 6: Setup Custom Domain & SSL

### 6.1 Add Custom Domain

For Backend:
1. Open **portfolio-backend** service
2. Click **Settings** → **General**
3. Under **Domains**, click **+ Add Domain**
4. Enter: `api.your-domain.com`
5. Click **Save**

For Frontend:
1. Open **portfolio-frontend** service
2. Click **Settings** → **General**
3. Under **Domains**, click **+ Add Domain**
4. Enter: `your-domain.com` (or `www.your-domain.com`)
5. Click **Save**

### 6.2 Generate SSL Certificates

Coolify automatically generates Let's Encrypt certificates:

1. Click each service's **Settings**
2. Go to **Domains**
3. You should see:
   ```
   ✓ your-domain.com (SSL Active)
   ✓ api.your-domain.com (SSL Active)
   ```

If SSL isn't showing:
1. Click the domain
2. Click **Generate SSL Certificate**
3. Wait ~2-3 minutes for generation

### 6.3 Update DNS Records

In your domain registrar (GoDaddy, Namecheap, etc.):

```
Type    Name                Value
A       your-domain.com     your-server-ip
A       www                 your-server-ip
A       api                 your-server-ip
```

Wait for DNS to propagate (5-30 minutes).

### 6.4 Update Environment Variables

Update **portfolio-frontend** variables:
```
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

Update **portfolio-backend** variables:
```
FRONTEND_URL=https://your-domain.com
```

Redeploy both services (click **Deploy** button).

---

## Step 7: Initialize Database

### 7.1 Run Database Migrations

Coolify allows running commands in containers.

1. Open **portfolio-backend** service
2. Click **Exec** tab (or **Terminal**)
3. Run:
   ```bash
   npx prisma migrate deploy
   ```
4. Expected output: "All pending migrations have been applied"

### 7.2 Seed Database (Optional)

1. In same **Exec** tab:
   ```bash
   npm run db:seed
   ```
2. Expected output: "✅ Database seeded successfully"

---

## Step 8: Verify Deployment

### 8.1 Test Endpoints

```bash
# Frontend
curl https://your-domain.com

# Backend API
curl https://api.your-domain.com/api/health

# Projects endpoint
curl https://api.your-domain.com/api/projects
```

### 8.2 View Logs

In Coolify Dashboard:
1. Click **portfolio-backend** → **Logs**
2. Should show startup messages
3. No errors

### 8.3 Monitor Resources

In Coolify Dashboard:
1. Click **Monitoring**
2. View:
   - CPU usage
   - Memory usage
   - Network I/O
   - Disk usage

---

## Step 9: Backup & Maintenance

### 9.1 Database Backups

Coolify **automatically backs up PostgreSQL**:

1. Go to **portfolio-db** service
2. Click **Settings** → **Backups**
3. Configure:
   - **Backup frequency:** Daily
   - **Retention:** 30 days
4. Manual backup: Click **Backup Now**

### 9.2 Update Application

To deploy new code:

1. Push changes to GitHub:
   ```bash
   git push origin main
   ```

2. In Coolify:
   - Click **portfolio-backend** → **Deploy**
   - Or set up **automatic deployments** (see below)

3. Coolify will:
   - ✅ Pull latest code
   - ✅ Rebuild Docker image
   - ✅ Restart container
   - ✅ Zero downtime (depends on service)

### 9.3 Automatic Deployments from Git

Setup automatic redeployment on push:

1. Click service → **Settings** → **Webhooks**
2. Select **GitHub** as provider
3. Copy webhook URL
4. In GitHub repository:
   - Go to **Settings** → **Webhooks**
   - Click **Add webhook**
   - **Payload URL:** Paste Coolify webhook URL
   - **Content type:** application/json
   - Click **Add webhook**

Now every push to `main` triggers automatic deployment!

### 9.4 View Application Logs

Monitor your running application:

1. Click service → **Logs**
2. See real-time output:
   ```
   2026-04-14 10:30:45 Server running on port 5000
   2026-04-14 10:31:02 GET /api/projects (200)
   2026-04-14 10:31:15 POST /api/contact (201)
   ```

---

## Step 10: Admin API Access

### 10.1 Login to Admin API

```bash
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'

# Response:
# {"token":"eyJhbGc...","expiresIn":"7d"}
```

### 10.2 Manage Content via API

```bash
# Add new project
curl -X POST https://api.your-domain.com/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Project",
    "description": "Project description...",
    "technologies": ["React", "Node.js"],
    "images": ["https://..."],
    "deployedUrl": "https://...",
    "githubUrl": "https://..."
  }'
```

---

## Coolify Admin Dashboard Features

### Dashboard Overview
1. **Services Status** - All running services with health
2. **Resource Usage** - CPU, memory, disk space
3. **Recent Logs** - Last activities
4. **Deployment History** - Past deployments

### Common Tasks

**View Service Status:**
- Click service → **Overview**
- Green = Running ✅
- Red = Error ❌

**Check Logs:**
- Click service → **Logs**
- Filter by level: All, Info, Error, Warning
- Search for errors

**Restart Service:**
- Click service → **... menu** → **Restart**
- Takes ~10 seconds

**Stop/Start Service:**
- Click service → **... menu** → **Stop/Start**

**View Resource Usage:**
- Click **Monitoring**
- Real-time CPU, memory, network graphs

**Manage Backups:**
- Click **portfolio-db** → **Backups**
- Create, restore, or delete backups

**Update Environment Variables:**
- Click service → **Variables**
- Edit and click **Redeploy**

---

## Troubleshooting Coolify Deployments

### Service Not Starting

**Check:**
1. Click service → **Logs**
2. Look for error messages
3. Common issues:
   - Port already in use
   - Database connection failed
   - Missing environment variables

**Fix:**
```bash
# Restart service
Coolify Dashboard → Service → ... → Restart

# Or rebuild
Coolify Dashboard → Service → Deploy
```

### Database Connection Issues

**Verify Connection:**
1. Click **portfolio-db** → **Logs**
2. Check for "accepting connections"
3. Verify DATABASE_URL in backend variables

**Reset Database:**
1. Click **portfolio-db** → **... → Delete**
2. Click **+ New Service** → Add PostgreSQL again
3. Redeploy backend with new connection string

### SSL Certificate Not Generating

**Check:**
1. Click service → **Settings** → **Domains**
2. Verify domain DNS is pointing to server
3. Click **Generate SSL Certificate**
4. Wait 2-3 minutes

**Troubleshoot:**
```bash
# SSH into server
sudo docker logs coolify-proxy

# Look for certificate generation errors
```

### Out of Disk Space

**Check:**
1. Go to **Settings** → **Server**
2. Check disk usage percentage
3. If >90%, need to free space

**Clean up:**
1. Remove old images: `docker image prune`
2. Remove unused volumes: `docker volume prune`
3. View detailed usage: `df -h`

### Git Deployment Not Triggering

**Verify webhook:**
1. In GitHub → **Settings** → **Webhooks**
2. Click webhook → **Recent Deliveries**
3. Check if requests are successful (200)
4. If failing, verify webhook URL in Coolify is correct

---

## Security Best Practices with Coolify

✅ **Change default password** - Settings → Account → Change Password
✅ **Use SSH keys** - Settings → SSH Keys → Add your key
✅ **Enable 2FA** - Settings → Account → Enable Two-Factor Authentication
✅ **Secure secrets** - Use Coolify's Variables (encrypted)
✅ **Regular backups** - Enabled by default, verify in portfolio-db settings
✅ **Monitor logs** - Check logs regularly for suspicious activity
✅ **Keep Coolify updated** - Updates available in Settings → System
✅ **Firewall enabled** - Only allow HTTP/HTTPS traffic

---

## Performance Optimization on Coolify

### 1. Enable Service Scaling
```
Service → Settings → Advanced → Enable Auto-scaling
Set min/max replicas based on needs
```

### 2. Configure Resource Limits
```
Service → Settings → Advanced → Resource Limits
Set CPU and Memory limits to prevent runaway processes
```

### 3. Enable Service Health Checks
```
Service → Settings → Advanced → Health Check
Configure interval and timeout
```

### 4. View Performance Metrics
```
Dashboard → Monitoring
Watch CPU, Memory, Network in real-time
```

---

## Useful Coolify Commands

View all services:
```bash
docker ps
```

View service logs:
```bash
docker logs portfolio-backend
```

Execute command in service:
```bash
docker exec portfolio-backend npx prisma migrate deploy
```

Restart Coolify:
```bash
sudo systemctl restart coolify
```

---

## Cost Comparison: Coolify vs Manual Deployment

| Task | Manual | Coolify |
|------|--------|---------|
| Setup time | 2-3 hours | 30 minutes |
| SSL certificate | Manual renewal | Automatic |
| Database backup | Manual scripting | Automatic daily |
| Monitoring | Manual setup | Built-in |
| Scaling | Manual Docker | One-click |
| Team access | File-based | UI-based |
| Cost | Server only | Server only |

**Coolify saves ~10 hours of setup and maintenance** 🚀

---

## Support & Resources

- **Coolify Docs:** https://coolify.io/docs
- **Community:** https://coolify.io/community
- **GitHub:** https://github.com/coollabsio/coolify
- **Discord:** https://discord.gg/coollabs

---

**Your portfolio is now running on Coolify with automatic SSL, backups, and monitoring!** 🎉

Access your services:
- 🌐 **Frontend:** https://your-domain.com
- 🔌 **Backend API:** https://api.your-domain.com/api/health
- 📊 **Coolify Dashboard:** https://your-server-ip:3000

Ready to deploy? Start from **Step 1: Coolify Server Setup**!
