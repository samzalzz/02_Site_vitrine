# Portfolio Website

Professional fullstack portfolio and project showcase website built with modern web technologies.

**Live Demo:** https://github.com/samzalzz/02_Site_vitrine

## Features

✨ **Frontend**
- Responsive design (mobile-first)
- Home page with hero section
- Projects showcase gallery
- Experience & CV timeline
- Contact form with validation
- Newsletter subscription
- SEO optimized with metadata
- Full TypeScript support

🔌 **Backend API**
- 23 REST endpoints
- JWT authentication
- PostgreSQL database
- Input validation with Zod
- Complete CRUD operations
- Error handling & logging

🗄️ **Database**
- PostgreSQL 15 with Prisma ORM
- 5 data models (Projects, Experiences, Skills, Contacts, Newsletter)
- Automatic migrations
- Sample seed data included

## Technology Stack

**Frontend:**
- Next.js 15 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zod validation
- React Hook Form

**Backend:**
- Express.js 4
- Node.js 20
- TypeScript 5
- Prisma ORM
- JWT authentication

**Database & Infrastructure:**
- PostgreSQL 15
- Docker & Docker Compose
- Nginx reverse proxy
- Let's Encrypt SSL/TLS

## Project Structure

```
portfolio-website/
├── frontend/          # Next.js 15 application
│   ├── src/app/      # Pages (Home, Projects, CV, Contact)
│   ├── components/   # Reusable React components
│   ├── lib/          # API client, validators, utilities
│   └── [config files]
│
├── backend/           # Express.js API server
│   ├── src/routes/    # API endpoints
│   ├── src/controllers/
│   ├── src/middleware/
│   ├── prisma/        # Database schema & migrations
│   └── [config files]
│
├── docs/              # Design specs & implementation plans
├── docker-compose.yml # Full stack orchestration
├── DEPLOYMENT.md      # Manual deployment guide
└── DEPLOYMENT_COOLIFY.md # Coolify-specific guide
```

## Development Setup

### Local Development with Docker

```bash
# Clone repository
git clone https://github.com/samzalzz/02_Site_vitrine.git
cd 02_Site_vitrine

# Start all services
docker-compose up -d

# Services available at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# Database: postgres://portfolio:portfolio_dev@localhost:5432/portfolio_db
```

### Without Docker

See individual `frontend/README.md` and `backend/README.md` for detailed setup instructions.

## Deployment

### Option 1: Coolify (Recommended) ⭐

Easiest option with automated Docker management, SSL, and backups.

📖 **See:** `DEPLOYMENT_COOLIFY.md` for complete guide

**Quick Summary:**
```bash
# 1. Install Coolify on your server
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 2. Use Coolify Dashboard to:
#    - Connect GitHub repository
#    - Set environment variables
#    - Enable SSL automatically
#    - Configure backups
#    - Monitor services

# Takes ~30 minutes total
```

**Benefits:**
- ✅ No Docker Compose commands needed
- ✅ Automatic SSL certificates
- ✅ One-click database backups
- ✅ Real-time monitoring & logs
- ✅ Automatic deployments on Git push
- ✅ Beautiful admin dashboard

### Option 2: Manual Deployment

For full control using Docker Compose directly.

📖 **See:** `DEPLOYMENT.md` for complete guide

**Quick Summary:**
```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Docker & Nginx
# 3. Clone repository
# 4. Configure environment variables
# 5. Run docker-compose up -d
# 6. Setup Nginx reverse proxy
# 7. Generate SSL with certbot

# Takes ~2 hours total
```

**Recommended if you:**
- Prefer manual control
- Want to customize everything
- Are comfortable with Docker
- Have specific infrastructure requirements

## API Documentation

### Public Endpoints

```
GET    /api/projects              # List all projects
GET    /api/projects/:id          # Get single project
GET    /api/experiences           # List work experience
GET    /api/skills                # List technical skills
POST   /api/contact               # Submit contact form
POST   /api/newsletter/subscribe  # Subscribe to newsletter
POST   /api/auth/login            # Admin login
```

### Admin Endpoints (Require JWT Token)

```
POST   /api/projects              # Create project
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project

POST   /api/experiences           # Create experience
PUT    /api/experiences/:id       # Update experience
DELETE /api/experiences/:id       # Delete experience

POST   /api/skills                # Create skill
PUT    /api/skills/:id            # Update skill
DELETE /api/skills/:id            # Delete skill

GET    /api/contact               # View submissions
DELETE /api/contact/:id           # Delete submission

GET    /api/newsletter            # View subscribers
POST   /api/newsletter/unsubscribe # Unsubscribe
```

### Example API Calls

```bash
# Login to get admin token
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'

# Response: {"token":"eyJhbGc...","expiresIn":"7d"}

# Use token to create project
curl -X POST https://api.your-domain.com/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Title",
    "description": "Project description",
    "technologies": ["React", "Node.js"],
    "images": ["https://..."],
    "deployedUrl": "https://...",
    "githubUrl": "https://..."
  }'
```

## Configuration

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-password
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

See deployment guides for complete environment setup.

## Project Details

- **Design Specification:** `docs/superpowers/specs/2026-04-14-portfolio-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-04-14-portfolio-implementation.md`
- **Build Status:** ✅ Complete (12/12 tasks)
- **Code Quality:** TypeScript strict mode, full type safety
- **Repository:** https://github.com/samzalzz/02_Site_vitrine

## Support

- 📚 **Coolify Docs:** https://coolify.io/docs
- 🐛 **Report Issues:** GitHub Issues
- 💬 **Discussions:** GitHub Discussions

## License

Private

---

**Built with ❤️ using Next.js, Express.js, and TypeScript**
