# Librasy Zen Backend API

Backend API for the Librasy Zen Library Management System.

## Features

- User authentication (login/register)
- JWT token-based authentication
- Role-based access control (Admin/Student)
- MongoDB database integration
- Secure password hashing
- Input validation
- Rate limiting
- CORS support

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
MONGODB_URI=mongodb+srv://jenil:jenil@cluster0.tk9mqsc.mongodb.net/lib
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create your `.env` file with the environment variables above.

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)

### Health Check

- `GET /api/health` - API health status

## Request/Response Examples

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "jwt_token_here"
  }
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Input validation
- CORS protection
- Helmet security headers

## Database Schema

### User Model
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: String (enum: 'admin', 'student')
- `isActive`: Boolean (default: true)
- `lastLogin`: Date
- `createdAt`: Date
- `updatedAt`: Date
