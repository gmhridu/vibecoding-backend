# Backend API with HonoJS, Drizzle ORM, and NeonDB

A robust, production-ready backend project built with modern technologies and best practices.

## 🚀 Features

- **HonoJS** - Fast, lightweight web framework
- **Drizzle ORM** - Type-safe database toolkit
- **NeonDB** - Serverless PostgreSQL database
- **TypeScript** - Full type safety
- **Zod** - Runtime validation
- **JWT Authentication** - Secure authentication middleware
- **Comprehensive Error Handling** - Centralized error management
- **Testing Setup** - Vitest for unit and integration tests
- **Environment Configuration** - Secure environment variable management

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # Database connection setup
│   │   └── env.ts          # Environment variables validation
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication middleware
│   │   ├── errorHandler.ts # Global error handling
│   │   └── notFoundHandler.ts # 404 handler
│   ├── routes/
│   │   ├── index.ts        # Main routes aggregator
│   │   └── v1/             # API version 1
│   │       ├── users.ts    # User management routes
│   │       ├── posts.ts    # Post management routes
│   │       └── categories.ts # Category management routes
│   ├── schemas/
│   │   └── index.ts        # Database schema definitions
│   ├── test/
│   │   ├── setup.ts        # Test configuration
│   │   └── users.test.ts   # Example tests
│   └── index.ts            # Application entry point
├── drizzle/
│   ├── migrations/         # Database migration files
│   └── config.ts           # Drizzle configuration
├── .env                    # Environment variables (create from .env.example)
├── .env.example           # Environment variables template
├── drizzle.config.ts      # Drizzle configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vitest.config.ts       # Testing configuration
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+
- NeonDB account and database

### 2. Installation

```bash
cd backend
npm install
```

### 3. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your NeonDB connection string:
```env
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
```

3. Configure other environment variables as needed:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Database Setup

#### Generate Migrations
```bash
npm run db:generate
```

#### Run Migrations
```bash
npm run db:migrate
```

#### Push Schema to Database (Alternative)
```bash
npm run db:push
```

#### View Database with Drizzle Studio
```bash
npm run db:studio
```

### 5. Development

#### Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

#### Type Checking
```bash
npm run type-check
```

#### Linting
```bash
npm run lint
```

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Run Tests Once
```bash
npm run test:run
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## 🚀 Production Build

### Build Application
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Posts
- `GET /posts` - List all posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

#### Categories
- `GET /categories` - List all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Health Check
- `GET /health` - Application health status

## 🔐 Authentication

The API includes JWT-based authentication middleware. To use protected routes:

1. Include `Authorization: Bearer <token>` header
2. Use the `authMiddleware` in your routes

## 🛡️ Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: 400 status with detailed Zod validation messages
- **Not Found**: 404 status for non-existent resources
- **Unauthorized**: 401 status for authentication failures
- **Database Errors**: Proper handling of constraint violations
- **Generic Errors**: 500 status for unexpected errors

## 🔧 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking

## 📝 Next Steps

1. **Set up your NeonDB database** and update the `DATABASE_URL`
2. **Run migrations** to create database tables
3. **Configure JWT secret** for authentication
4. **Add more routes** as needed for your application
5. **Set up testing database** for comprehensive tests
6. **Add rate limiting** and other security middleware
7. **Configure logging** for production monitoring

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Write tests for new features
3. Update documentation as needed
4. Ensure type safety with TypeScript
5. Run linting and tests before committing

## 📄 License

ISC License - see package.json for details.
