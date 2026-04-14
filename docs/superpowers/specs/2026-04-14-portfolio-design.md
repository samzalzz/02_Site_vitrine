# Portfolio Website Design Specification

**Date:** 2026-04-14  
**Project:** Vitrine Website - Professional Portfolio & Project Showcase  
**Owner:** Fullstack Developer  
**Status:** Design Approved

---

## 1. Project Overview

A professional fullstack portfolio website to showcase projects and attract potential clients. The site demonstrates fullstack expertise with a focus on understanding business needs and technical implementation. It features a portfolio section (2-3 projects), a professional CV/experience timeline, and a contact/newsletter system.

**Key Users:**
- **Visitors:** Potential clients looking for development services
- **Admin/Owner:** Portfolio manager who can edit projects, experiences, skills, and view contact submissions

**Success Criteria:**
- Loads quickly and ranks well in search engines (SEO)
- Professional, trust-building design
- Easy content management via admin dashboard (no coding required)
- Fully functional contact form and newsletter signup
- Responsive on mobile, tablet, desktop

---

## 2. Architecture

### 2.1 High-Level System Design

```
┌─────────────────────────────────────────┐
│  Frontend (Next.js)                     │
│  - Pages: Home, Projects, CV, Contact   │
│  - Admin Dashboard                      │
│  - SEO optimized, responsive            │
└──────────────┬──────────────────────────┘
               │ API REST (JSON)
┌──────────────▼──────────────────────────┐
│  Backend (Node.js/Express)              │
│  - REST API endpoints                   │
│  - Authentication (JWT)                 │
│  - Email service (nodemailer)           │
│  - Validation & error handling          │
└──────────────┬──────────────────────────┘
               │ ORM (Prisma)
┌──────────────▼──────────────────────────┐
│  Database (PostgreSQL)                  │
│  - Projects, Experiences, Skills        │
│  - Contact submissions, Newsletter      │
└─────────────────────────────────────────┘
```

### 2.2 Deployment

**Environment:** Single personal server  
**Server Components:**
- **Reverse Proxy:** Nginx (ports 80/443)
- **Frontend:** Next.js (port 3000)
- **Backend:** Express.js (port 5000)
- **Database:** PostgreSQL
- **Process Manager:** PM2 or systemd
- **SSL:** Let's Encrypt (certbot)

**Orchestration:** Docker Compose (optional, recommended)  
**CI/CD:** Git webhooks for auto-deployment

---

## 3. Frontend (Next.js)

### 3.1 Pages and Features

| Page | Purpose | Features |
|------|---------|----------|
| **Home** | Entry point, establish credibility | Hero section, brief intro, CTAs to projects/contact |
| **Projects** | Portfolio showcase | Gallery of 2-3 projects, filters, case study details |
| **CV/Experience** | Professional background | Timeline/list of experiences, skills by category, formations, PDF export |
| **Contact** | Lead generation | Contact form, newsletter signup, contact info |
| **Admin Dashboard** | Content management | CRUD for projects, experiences, skills, view submissions |

### 3.2 Technical Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **Validation:** Zod
- **State Management:** TanStack Query (React Query) v5+
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion or Tailwind CSS
- **PDF Export:** react-pdf

### 3.3 Key Features

- **SEO:** Metadata, Open Graph, structured data (JSON-LD)
- **Performance:** Image optimization (next/image), lazy loading, code splitting
- **Responsive:** Mobile-first design, works on all devices
- **Accessibility:** WCAG 2.1 AA standard
- **Authentication:** JWT-based session for admin access
- **UX:** Smooth animations, professional design, fast load times

---

## 4. Backend (Node.js/Express)

### 4.1 Technical Stack

- **Framework:** Express.js (latest stable)
- **Language:** TypeScript 5.x
- **Database ORM:** Prisma
- **Validation:** Zod
- **Authentication:** JWT (jsonwebtoken)
- **Email:** Nodemailer
- **Logging:** Pino (optional, for production)

### 4.2 API Endpoints

#### Projects
```
GET    /api/projects              # Get all projects
GET    /api/projects/:id          # Get single project
POST   /api/projects              # Create (admin)
PUT    /api/projects/:id          # Update (admin)
DELETE /api/projects/:id          # Delete (admin)
```

#### Experiences
```
GET    /api/experiences           # Get all experiences
POST   /api/experiences           # Create (admin)
PUT    /api/experiences/:id       # Update (admin)
DELETE /api/experiences/:id       # Delete (admin)
```

#### Skills
```
GET    /api/skills                # Get all skills
POST   /api/skills                # Create (admin)
PUT    /api/skills/:id            # Update (admin)
DELETE /api/skills/:id            # Delete (admin)
```

#### Contact & Newsletter
```
POST   /api/contact               # Submit contact form
GET    /api/contact               # Get submissions (admin)
POST   /api/newsletter/subscribe  # Subscribe to newsletter
GET    /api/newsletter            # Get subscribers (admin)
```

#### Authentication
```
POST   /api/auth/login            # Admin login
POST   /api/auth/logout           # Admin logout
GET    /api/auth/me               # Check session
```

### 4.3 Middleware & Security

- **CORS:** Configured for frontend domain
- **Rate Limiting:** On public endpoints (contact, newsletter)
- **JWT Validation:** On admin-only endpoints
- **Error Handling:** Consistent error responses with status codes
- **Validation:** All input validated with Zod before processing
- **Logging:** Request/response logging for debugging

---

## 5. Database (PostgreSQL + Prisma)

### 5.1 Data Model

#### Projects Table
```prisma
model Project {
  id          String    @id @default(cuid())
  title       String
  description String    @db.Text
  technologies String[] // JSON array: ["React", "Node.js"]
  images      String[]  // URLs to project images
  deployedUrl String?
  githubUrl   String?
  order       Int       // For display ordering
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### Experiences Table
```prisma
model Experience {
  id          String    @id @default(cuid())
  title       String    // Job title
  company     String
  startDate   DateTime
  endDate     DateTime?
  description String    @db.Text
  technologies String[]
  order       Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### Skills Table
```prisma
model Skill {
  id        String   @id @default(cuid())
  name      String
  category  String   // "frontend", "backend", "devops", etc.
  level     String?  // "beginner", "intermediate", "advanced"
  order     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Contact Submissions
```prisma
model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String   @db.Text
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

#### Newsletter Subscribers
```prisma
model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

### 5.2 Database Operations

- **Create:** Add new projects, experiences, skills
- **Read:** Fetch data for frontend + admin dashboard
- **Update:** Edit any content without code changes
- **Delete:** Remove outdated items

---

## 6. Email and Notifications

### 6.1 Contact Form Workflow

1. **User submits form** → Frontend validation (Zod) → API call
2. **Backend receives** → Server-side validation → Store in DB
3. **Notification sent** → Email to portfolio owner
4. **Response sent** → Success message to user

### 6.2 Email Configuration

- **Service:** Nodemailer
- **SMTP:** Configured on personal server or external provider (Gmail, SendGrid, etc.)
- **Templates:** HTML email templates for contact notifications and newsletter

### 6.3 Newsletter

- **Signup:** Simple email input on contact page
- **Opt-in:** Double opt-in recommended (confirmation email)
- **Management:** Admin can view/export subscriber list
- **Future:** Integration with email marketing service if needed

---

## 7. Admin Dashboard

### 7.1 Features

The admin dashboard allows the portfolio owner to:

- **Manage Projects:**
  - Create, edit, delete portfolio projects
  - Upload images, set deployed URL and GitHub links
  - Order display

- **Manage Experience:**
  - Add/edit/delete work experiences
  - Set dates, technologies, descriptions
  - Chronological ordering

- **Manage Skills:**
  - Add technical skills by category (frontend, backend, devops)
  - Set proficiency level
  - Organize by category

- **View Contact Submissions:**
  - See all contact form submissions
  - Mark as read/unread
  - Delete old submissions

- **Manage Newsletter:**
  - View subscriber count and list
  - Export subscribers
  - (Optional) Campaign management

### 7.2 Security

- **Authentication:** Login with admin credentials (JWT)
- **Protected Routes:** All admin endpoints require valid JWT
- **Session Timeout:** Auto-logout after inactivity
- **HTTPS Only:** All traffic encrypted with SSL/TLS

---

## 8. Project Structure

```
portfolio-website/
├── frontend/                        # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── projects/
│   │   │   │   └── page.tsx        # Projects gallery
│   │   │   ├── cv/
│   │   │   │   └── page.tsx        # Experience & CV
│   │   │   ├── contact/
│   │   │   │   └── page.tsx        # Contact form
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx        # Admin dashboard
│   │   │   │   ├── projects/       # Project management
│   │   │   │   ├── experiences/    # Experience management
│   │   │   │   └── skills/         # Skills management
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── api/                # Optional API routes for admin
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ExperienceCard.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── AdminPanel/         # Admin components
│   │   ├── lib/
│   │   │   ├── api.ts              # API client functions
│   │   │   ├── auth.ts             # Auth utilities
│   │   │   └── utils.ts            # General utilities
│   │   └── styles/
│   │       └── globals.css         # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
│
├── backend/                         # Node.js/Express application
│   ├── src/
│   │   ├── routes/
│   │   │   ├── projects.ts
│   │   │   ├── experiences.ts
│   │   │   ├── skills.ts
│   │   │   ├── contact.ts
│   │   │   ├── newsletter.ts
│   │   │   └── auth.ts
│   │   ├── controllers/
│   │   │   ├── projectController.ts
│   │   │   ├── experienceController.ts
│   │   │   ├── skillController.ts
│   │   │   ├── contactController.ts
│   │   │   ├── newsletterController.ts
│   │   │   └── authController.ts
│   │   ├── services/
│   │   │   ├── emailService.ts
│   │   │   ├── authService.ts
│   │   │   └── validationService.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT verification
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── cors.ts
│   │   ├── utils/
│   │   │   ├── validators.ts       # Zod schemas
│   │   │   └── logger.ts           # Logging utility
│   │   └── index.ts                # Entry point
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── migrations/             # Database migrations
│   │   └── seed.ts                 # Seed data (optional)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
│
├── docker-compose.yml              # Services orchestration
├── nginx.conf                       # Reverse proxy config
├── .gitignore
├── README.md
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-04-14-portfolio-design.md  # This file
```

---

## 9. Technology Versions (Stable/Latest)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| Next.js | 15+ | Frontend framework |
| React | 19+ | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Express.js | 4.x | Backend framework |
| Prisma | 5.x+ | Database ORM |
| PostgreSQL | 15+ | Database |
| Docker | Latest | Containerization (optional) |

---

## 10. Development Workflow

### 10.1 Local Development

```bash
# Setup
git clone <repo>
cd portfolio-website
docker-compose up -d              # or manually start services

# Frontend development
cd frontend
npm install
npm run dev                       # http://localhost:3000

# Backend development
cd ../backend
npm install
npm run dev                       # http://localhost:5000
```

### 10.2 Database

```bash
# Setup database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed data (optional)
npx prisma db seed
```

### 10.3 Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_PASSWORD=your_admin_password
NODE_ENV=development
```

---

## 11. Deployment

### 11.1 On Personal Server

1. **Prepare server:**
   - Install Node.js 20.x, PostgreSQL, Docker (optional), Nginx
   - Configure firewall and SSL certificates (Let's Encrypt)

2. **Deploy:**
   ```bash
   git clone <repo> /var/www/portfolio
   cd /var/www/portfolio
   
   # Database setup
   cd backend && npx prisma migrate deploy
   
   # Install dependencies
   npm ci --production
   
   # Start services (with PM2 or Docker)
   pm2 start ecosystem.config.js
   ```

3. **Configure Nginx** as reverse proxy:
   - Frontend (port 3000) → localhost:3000
   - Backend API (port 5000) → localhost:5000
   - HTTPS on ports 80/443

4. **Auto-deployment:**
   - Git webhook triggers deployment script on push
   - Script pulls latest code and restarts services

### 11.2 Backups

- Database backups: Daily automated backups
- Code: Git repository (backed up)
- Files: Any uploaded images/assets

---

## 12. Scope & Constraints

### In Scope
- Full-featured portfolio with projects and CV
- Admin dashboard for content management
- Contact form with email notifications
- Newsletter subscription system
- Professional, responsive design
- SEO optimization
- Secure authentication for admin

### Out of Scope
- Blog system (can be added later)
- Multiple user accounts (admin-only)
- Advanced analytics (can be added later)
- E-commerce functionality
- Payment processing

### Constraints
- Single personal server (no scaling initially)
- Manual SSL certificate renewal (or automated with certbot)
- Storage: Limited by server capacity
- Bandwidth: Limited by ISP

---

## 13. Success Metrics

✓ Load time < 3 seconds (Lighthouse)  
✓ Mobile responsiveness (100% on all devices)  
✓ SEO: Indexable by search engines  
✓ Admin can manage content without code changes  
✓ Contact form works reliably  
✓ Zero downtime on deployment  
✓ HTTPS/SSL properly configured  
✓ Professional appearance builds client trust  

---

## 14. Future Enhancements

- Blog section for technical articles
- Case study templates for detailed project breakdowns
- Analytics dashboard (visitor metrics)
- Testimonials/reviews section
- Service pricing page
- Automated email campaigns via newsletter
- Integration with third-party email services
- Dark mode toggle
- Internationalization (i18n)

---

**Design approved:** Ready for implementation planning.
