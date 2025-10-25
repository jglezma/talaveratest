# TalaveraTest - Full Stack Application

A modern full-stack application built with Node.js, Express, TypeScript, React, and PostgreSQL in a monorepo structure.

## 🏗️ Project Structure

```
talaveratest/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── database/        # Database connection and migrations
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   └── types/          # TypeScript type definitions
│   └── tests/              # Backend tests (Cucumber BDD)
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── stores/         # State management
├── docker-compose.yml      # Docker orchestration
└── package.json           # Monorepo configuration
```

## 🚀 Features

- **Authentication System**: JWT-based auth with signup/signin
- **Project Management**: CRUD operations for user projects
- **Subscription System**: Multiple subscription plans with billing
- **Database Migrations**: Automated PostgreSQL setup
- **Testing**: Cucumber BDD tests for API endpoints
- **Docker Support**: Complete containerization
- **TypeScript**: Strict typing throughout the application
- **Monorepo**: Unified dependency management

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **npm** or **yarn**

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd talaveratest

# Install all dependencies (backend + frontend)
npm run setup
```

### 2. Environment Configuration

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start with Docker (Recommended)

```bash
# Start all services (database, backend, frontend)
npm run docker:up

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - PostgreSQL: localhost:5432
```

### 4. Alternative: Local Development

```bash
# Start only the database
docker-compose up -d db

# Wait for database to be ready
sleep 15

# Initialize database
cd backend && npm run init-db

# Start backend (in one terminal)
npm run dev

# Start frontend (in another terminal)
cd ../frontend && npm run dev
```

## 🔧 Database Setup

The application uses PostgreSQL with automated migrations:

```bash
# Check database connection
cd backend && npm run check-db

# Reset database (if needed)
npm run reset-db

# Initialize database with migrations
npm run init-db

# Or do both at once
npm run setup-db
```

## 📡 API Endpoints

### Authentication

```
POST /api/auth/signup      # User registration
POST /api/auth/signin      # User login
GET  /api/auth/profile     # Get user profile (requires auth)
```

### Projects

```
GET    /api/projects       # Get user projects (requires auth)
POST   /api/projects       # Create project (requires auth)
GET    /api/projects/:id   # Get specific project (requires auth)
PUT    /api/projects/:id   # Update project (requires auth)
DELETE /api/projects/:id   # Delete project (requires auth)
```

### Subscriptions

```
GET  /api/plans                    # Get available plans
POST /api/subscriptions            # Subscribe to plan (requires auth)
GET  /api/subscriptions/invoices   # Get user invoices (requires auth)
```

### Health Check

```
GET /health                # API health status
```

## 🧪 Testing the API

### Basic Health Check

```bash
curl http://localhost:3001/health
```

### Get Available Plans

```bash
curl http://localhost:3001/api/plans
```

### Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Use the JWT Token

```bash
# Replace YOUR_JWT_TOKEN with the token from login response
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/auth/profile
```

## 🧪 Running Tests

### Backend Tests (Cucumber BDD)

```bash
cd backend
npm run test:cucumber
```

### Unit Tests

```bash
cd backend
npm run test
```

### Watch Mode

```bash
cd backend
npm run test:watch
```

## 📦 Available Scripts

### Root Level

```bash
npm run setup          # Install all dependencies
npm run docker:up      # Start all services with Docker
npm run docker:down    # Stop all services
npm run dev           # Start backend and frontend in development
```

### Backend

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run check-db      # Test database connection
npm run reset-db      # Reset database
npm run init-db       # Initialize database
npm run setup-db      # Reset and initialize database
npm run test          # Run unit tests
npm run test:cucumber # Run BDD tests
```

### Frontend

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
```

## 🐳 Docker Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Reset everything (including data)
docker-compose down -v
```

### Individual Services

```bash
# Start only database
docker-compose up -d db

# Start only backend
docker-compose up -d api

# Start only frontend
docker-compose up -d web
```

## 🗄️ Database Schema

The application includes these main tables:

- **users**: User accounts with authentication
- **projects**: User projects with CRUD operations
- **plans**: Subscription plans (Basic, Pro, Enterprise)
- **invoices**: Billing and subscription tracking
- **migrations**: Database migration history

### Sample Data

The system comes with 3 predefined subscription plans:

- **Basic** ($9.99/month): 1 project, basic support, 1GB storage
- **Pro** ($19.99/month): 5 projects, priority support, 10GB storage
- **Enterprise** ($49.99/month): Unlimited projects, 24/7 support, 100GB storage

## 🔧 Environment Variables

### Backend (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=talaveratest
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3001  # for backend
lsof -i :3000  # for frontend
lsof -i :5432  # for database

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db

# Reset database completely
docker-compose down -v
docker-compose up -d db
sleep 15
cd backend && npm run init-db
```

### Clear Everything and Restart

```bash
# Stop everything
docker-compose down -v

# Remove node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Reinstall dependencies
npm run setup

# Start fresh
npm run docker:up
```

## 📚 Technology Stack

### Backend

- **Express.js 4** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin requests

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **Axios** - HTTP client

### Development

- **Docker & Docker Compose** - Containerization
- **Jest** - Unit testing
- **Cucumber** - BDD testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🔄 Development Workflow

1. **Start the database**: `docker-compose up -d db`
2. **Run migrations**: `cd backend && npm run init-db`
3. **Start backend**: `npm run dev`
4. **Start frontend**: `cd frontend && npm run dev`
5. **Make changes and test**
6. **Run tests**: `npm run test`
7. **Build for production**: `npm run build`

## 📝 License

This project is licensed under the MIT License.

**Happy coding! 🚀**
