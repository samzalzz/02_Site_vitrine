# Claude.ai Prompt: Deploy Portfolio to Coolify

Use this prompt with Claude.ai or Claude Code to get step-by-step help deploying your portfolio website to Coolify.

---

## 📋 Copy This Prompt and Paste into Claude.ai

```
I have a fullstack portfolio website built with:
- Frontend: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- Backend: Express.js 4 + Node.js 20 + PostgreSQL 15 + Prisma
- Repository: https://github.com/samzalzz/02_Site_vitrine

I want to deploy this to Coolify on my personal Linux server (Ubuntu 20.04+).

I have:
- SSH access to my server
- A domain name (your-domain.com)
- Coolify installation guide: DEPLOYMENT_COOLIFY.md in the repo

Please help me:

1. Walk me through the Coolify deployment process step-by-step
2. Help me set up environment variables correctly
3. Configure database migrations
4. Set up custom domains and SSL
5. Verify everything is working
6. Troubleshoot any issues that come up

I'll provide you with:
- My server IP address when asked
- My domain name when asked
- Any error messages or logs
- Information about my environment

Start with the first step and wait for me to confirm before moving to the next step.

Reference the DEPLOYMENT_COOLIFY.md file from https://github.com/samzalzz/02_Site_vitrine for detailed instructions.
```

---

## 🚀 Advanced Prompt (For Specific Tasks)

Use these prompts for specific deployment tasks:

### **Setup Coolify Server**
```
I need to set up Coolify on my Ubuntu server at 192.168.1.100.

Please give me:
1. The exact commands to install Coolify
2. How to access the dashboard
3. How to change the default password
4. How to configure my server

Wait for confirmation after each step before proceeding.
```

### **Deploy Backend to Coolify**
```
I have an Express.js backend at https://github.com/samzalzz/02_Site_vitrine

I need to deploy it to Coolify with:
- GitHub repository integration
- Environment variables:
  - DATABASE_URL
  - JWT_SECRET
  - ADMIN_PASSWORD
  - SMTP credentials
  - FRONTEND_URL

Please walk me through:
1. Creating the service in Coolify
2. Configuring Git integration
3. Setting environment variables
4. Deploying the service
5. Running database migrations

Wait for confirmation after each step.
```

### **Deploy Frontend to Coolify**
```
I have a Next.js frontend at https://github.com/samzalzz/02_Site_vitrine

I need to deploy it to Coolify with:
- GitHub repository integration
- Custom domain (your-domain.com)
- Environment variable: NEXT_PUBLIC_API_BASE_URL
- Automatic SSL certificate

Please walk me through:
1. Creating the service in Coolify
2. Configuring Git integration
3. Setting environment variables
4. Adding custom domain
5. Generating SSL certificate
6. Verifying deployment

Wait for confirmation after each step.
```

### **Configure Database**
```
I need to set up PostgreSQL in Coolify for my portfolio.

Database requirements:
- Name: portfolio_db
- User: portfolio
- Port: 5432
- Backup: Daily

Please guide me through:
1. Creating the PostgreSQL service
2. Configuring credentials
3. Setting up backups
4. Running Prisma migrations
5. Seeding sample data
6. Verifying the database

Wait for confirmation after each step.
```

### **Setup Custom Domain & SSL**
```
I want to deploy my portfolio to:
- Frontend: your-domain.com
- Backend API: api.your-domain.com

My domain registrar is: [GoDaddy / Namecheap / etc]

Please guide me through:
1. Configuring domains in Coolify
2. Getting DNS records to add to my registrar
3. Adding DNS records in my registrar
4. Generating SSL certificates in Coolify
5. Verifying SSL is working
6. Testing the domains

My current server IP is: [your-ip]

Wait for confirmation after each step.
```

### **Troubleshooting Deployment**
```
I'm trying to deploy my portfolio to Coolify but encountering an issue.

Error/Issue: [Paste error message or describe problem]

Service: [Backend / Frontend / Database]

I've tried: [What you've already tried]

Please help me:
1. Understand what's causing this issue
2. Check logs in Coolify
3. Fix the problem step-by-step
4. Verify the fix worked

Here's the error message:
[Paste full error/logs]

Wait for my confirmation before moving to next step.
```

---

## 💡 Example Usage Conversation

### **User Message:**
```
I'm ready to deploy. I have Coolify installed at 192.168.1.100:3000
My domain is example.com
I want to deploy: https://github.com/samzalzz/02_Site_vitrine

Help me deploy this to Coolify.
```

### **Claude Will Response:**
```
Great! Let's deploy your portfolio to Coolify. I'll walk you through 
each step. Let's start with the first step:

**Step 1: Access Coolify Dashboard**

1. Open your browser
2. Go to: https://192.168.1.100:3000
3. Login with your credentials

Once you're logged in, reply with: "✓ Logged in to Coolify"

Then we'll move to Step 2: Create PostgreSQL Database Service
```

---

## 🎯 Tips for Using These Prompts

### **Best Practices:**
1. **Be Specific** - Include your actual values (IP, domain, errors)
2. **Share Errors** - Paste full error messages or logs
3. **Wait Between Steps** - Confirm each step before moving on
4. **Ask Questions** - Don't hesitate to ask "Why?" for any step
5. **Provide Feedback** - Tell Claude if something doesn't match

### **Example Messages During Deployment:**

```
"✓ I've logged into Coolify dashboard"

"✗ I'm getting a 'Port 3000 already in use' error"

"I created the PostgreSQL service but can't find the connection string"

"What should I use for JWT_SECRET? How do I generate it?"

"The SSL certificate didn't generate. What should I do?"

"Everything is deployed! How do I verify it's working?"
```

---

## 🔧 Information to Have Ready

Before starting, gather these details:

```
Server Information:
- [ ] Server IP address: ___________________
- [ ] SSH username: ___________________
- [ ] Server OS version: ___________________

Domain Information:
- [ ] Primary domain: ___________________
- [ ] API subdomain: ___________________
- [ ] Domain registrar: ___________________

Portfolio Information:
- [ ] GitHub repository URL: https://github.com/samzalzz/02_Site_vitrine
- [ ] Branch: main
- [ ] Frontend path: frontend/
- [ ] Backend path: backend/

Environment Variables:
- [ ] JWT_SECRET (or ready to generate): ___________________
- [ ] ADMIN_PASSWORD: ___________________
- [ ] SMTP service (Gmail/Sendgrid): ___________________
- [ ] SMTP email: ___________________
- [ ] SMTP password/token: ___________________

Coolify Details:
- [ ] Coolify dashboard URL: https://[server-ip]:3000
- [ ] Coolify admin password: (if changed): ___________________
```

---

## 📚 Additional Resources

**In Your Repository:**
- `/DEPLOYMENT_COOLIFY.md` - Full deployment guide
- `/README.md` - Project overview
- `/docker-compose.yml` - Service configuration

**External Resources:**
- [Coolify Documentation](https://coolify.io/docs)
- [Coolify GitHub](https://github.com/coollabsio/coolify)
- [Coolify Community Discord](https://discord.gg/coollabs)

---

## ✅ Deployment Checklist

Use this checklist with Claude to track progress:

```
Coolify Setup:
- [ ] Coolify installed on server
- [ ] Dashboard accessible
- [ ] Default password changed
- [ ] SSH keys configured

Database:
- [ ] PostgreSQL service created
- [ ] Database credentials generated
- [ ] Backups configured
- [ ] Migrations ran successfully
- [ ] Sample data seeded

Backend Deployment:
- [ ] Service created in Coolify
- [ ] GitHub connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Logs show no errors
- [ ] Health check responding

Frontend Deployment:
- [ ] Service created in Coolify
- [ ] GitHub connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Logs show no errors

Domain & SSL:
- [ ] Frontend domain configured (example.com)
- [ ] Backend domain configured (api.example.com)
- [ ] DNS records added to registrar
- [ ] SSL certificates generated
- [ ] HTTPS working on both domains

Testing:
- [ ] Frontend loads at https://example.com
- [ ] Backend API responds at https://api.example.com/api/health
- [ ] Contact form works
- [ ] Projects API endpoint works
- [ ] Admin login works
- [ ] Database connected successfully

Monitoring:
- [ ] Services show "Running" in Coolify
- [ ] CPU/memory usage normal
- [ ] No errors in logs
- [ ] Backups configured
```

---

## 🎓 Learning Resources

### **If Claude Explains Something and You Want to Learn More:**

Ask Claude:
```
"Can you explain what [term] means?"
"Why do we need [step]?"
"What would happen if we skipped [this step]?"
"How does [feature] work in Coolify?"
```

### **Common Questions to Ask Claude:**

```
"What's the difference between DATABASE_URL and FRONTEND_URL?"
"Why do I need JWT_SECRET?"
"How do SSL certificates work with Coolify?"
"What are Docker containers and why do we use them?"
"How does GitHub integration work for auto-deployments?"
```

---

## 🚀 Quick Start (Copy & Paste Ready)

### **One-Minute Version:**
```
Help me deploy my fullstack Next.js + Express.js portfolio to Coolify.

Repository: https://github.com/samzalzz/02_Site_vitrine
Server: Ubuntu 20.04+
Domain: [your-domain.com]
Coolify: Already installed

Walk me through step-by-step, waiting for my confirmation after each step.

Start with: "What's your server IP address?"
```

### **Detailed Version:**
```
I'm deploying a portfolio website to Coolify.

Project Details:
- Frontend: Next.js 15 in /frontend
- Backend: Express.js 4 in /backend
- Database: PostgreSQL 15
- Repo: https://github.com/samzalzz/02_Site_vitrine

Current Status:
- Coolify is installed at my-server-ip:3000
- Server is Ubuntu 20.04+
- I have a domain: example.com

What I Need:
1. Step-by-step deployment instructions
2. Help with environment variables
3. Database setup & migrations
4. Domain & SSL configuration
5. Verification that everything works
6. Troubleshooting if needed

Please start with the first step and wait for my confirmation before proceeding.
```

---

## 📞 Getting Help with Your Deployment

### **If Something Goes Wrong:**

Tell Claude:
```
I'm following the Coolify deployment guide, but I'm stuck on Step 5.

Error/Issue: [Describe problem]

What I've tried: [What you already tried]

Service logs: [Paste error messages]

Can you help me fix this?
```

### **If You Want to Understand Something:**

Tell Claude:
```
I don't understand [concept/step]. 

Can you explain:
1. What it does
2. Why we need it
3. What happens if we skip it
4. How it works in Coolify
```

---

## 🎉 You're Ready!

You now have everything needed to deploy your portfolio to Coolify with Claude's help.

**Next Steps:**
1. Copy the main prompt above
2. Go to [Claude.ai](https://claude.ai)
3. Paste the prompt
4. Follow Claude's step-by-step guidance
5. Share errors/logs when asked
6. Confirm after each step

**Your portfolio will be live in ~30 minutes!** 🚀

---

**Good luck with your deployment! 🎉**

If you need help at any point, just copy one of these prompts and ask Claude!
