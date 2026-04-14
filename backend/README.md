# Portfolio Backend

Express.js backend server for the portfolio website with TypeScript support, PostgreSQL database, JWT authentication, and email notifications.

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm or yarn
- PostgreSQL 13+
- Git

## Setup Instructions

### 1. Environment Configuration

Copy the environment example file and configure it with your settings:

```bash
cp .env.example .env
```

Update the `.env` file with your actual values:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development, production)
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time
- `ADMIN_PASSWORD`: Admin account password
- `SMTP_*`: Email service configuration
- `FRONTEND_URL`: Frontend application URL

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create and migrate the database:

```bash
npm run db:push
```

To run database migrations:

```bash
npm run db:migrate
```

To seed the database with initial data:

```bash
npm run db:seed
```

### 4. Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

### 5. Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### 6. Production

Start the production server:

```bash
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns the health status of the server
  - No authentication required

### Authentication
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/logout` - User logout
- **POST** `/api/auth/refresh` - Refresh JWT token
- **GET** `/api/auth/me` - Get current user profile

### Portfolio Projects
- **GET** `/api/projects` - List all projects
- **POST** `/api/projects` - Create new project (admin only)
- **GET** `/api/projects/:id` - Get project details
- **PUT** `/api/projects/:id` - Update project (admin only)
- **DELETE** `/api/projects/:id` - Delete project (admin only)

### Contact & Messages
- **POST** `/api/messages` - Submit contact form message
- **GET** `/api/messages` - Get all messages (admin only)
- **DELETE** `/api/messages/:id` - Delete message (admin only)

### Skills
- **GET** `/api/skills` - List all skills
- **POST** `/api/skills` - Create skill (admin only)
- **PUT** `/api/skills/:id` - Update skill (admin only)
- **DELETE** `/api/skills/:id` - Delete skill (admin only)

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── routes/               # API route definitions
│   ├── controllers/          # Request handlers and business logic
│   ├── services/             # Business logic and data operations
│   ├── middleware/           # Custom middleware (auth, validation, etc.)
│   └── utils/                # Utility functions and helpers
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seed script
├── dist/                     # Compiled JavaScript output
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment variables template
└── Dockerfile                # Docker container configuration
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run type-check` - Type check without compiling
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Run database seed script
- `npm run db:studio` - Open Prisma Studio for database management

## Technologies

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database operations
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **zod** - Schema validation
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - API rate limiting

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint rules configured in the project
- Use meaningful variable and function names
- Add comments for complex logic

### Database
- Write migrations for schema changes
- Use Prisma for database operations
- Seed test data for development

### Security
- Never commit `.env` files
- Use environment variables for secrets
- Implement rate limiting on public endpoints
- Validate and sanitize all inputs
- Use HTTPS in production

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists and credentials are correct

### Port Already in Use
- Change the PORT in .env
- Or kill the process using the port

### TypeScript Compilation Errors
- Run `npm install` to ensure all dependencies are installed
- Check that all imports have correct paths
- Verify tsconfig.json settings

## License

This project is part of the portfolio website. All rights reserved.
