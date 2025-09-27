# Librasy Zen - Complete Setup Guide

This guide will help you set up both the frontend and backend for the Librasy Zen Library Management System.

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run setup script:**
   ```bash
   npm run setup
   ```
   This will create the `.env` file with your MongoDB connection.

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install frontend dependencies (if not already done):**
   ```bash
   npm install
   ```

2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
librasy-zen-design/
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── src/                    # Frontend React app
│   ├── components/        # React components
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── ...
└── SETUP_GUIDE.md        # This file
```

## 🔧 Configuration

### Backend Environment Variables

The backend uses these environment variables (automatically created by setup script):

```env
MONGODB_URI=mongodb+srv://jenil:jenil@cluster0.tk9mqsc.mongodb.net/lib
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🗄️ Database

The app connects to MongoDB Atlas using the provided connection string:
- **Database**: `lib`
- **Connection**: `mongodb+srv://jenil:jenil@cluster0.tk9mqsc.mongodb.net/lib`

## 🔐 Authentication

### User Roles
- **Admin**: Full access to admin dashboard
- **Student**: Access to student catalog and personal books

### API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

## 🚦 Running the Application

### Development Mode

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend (in new terminal):**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/api/health

### Production Mode

1. **Build Frontend:**
   ```bash
   npm run build
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

## 🧪 Testing the Setup

1. **Visit the application** at http://localhost:5173
2. **You should see the login page** (since no user is authenticated)
3. **Create a new account** using the signup form
4. **Login with your credentials**
5. **You'll be redirected** based on your role:
   - Admin users → `/admin`
   - Student users → `/student/catalog`

## 🔍 Troubleshooting

### Common Issues

1. **Backend not starting:**
   - Check if MongoDB connection is working
   - Verify all dependencies are installed
   - Check if port 5000 is available

2. **Frontend can't connect to backend:**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify API URL in frontend

3. **Authentication not working:**
   - Check if JWT_SECRET is set
   - Verify MongoDB connection
   - Check browser console for errors

### Logs and Debugging

- **Backend logs**: Check terminal where backend is running
- **Frontend logs**: Check browser developer console
- **Network requests**: Check Network tab in browser dev tools

## 📚 Features

### ✅ Implemented
- User authentication (login/register)
- JWT token-based authentication
- Role-based access control
- MongoDB integration
- Protected routes
- Responsive UI
- Form validation
- Error handling

### 🔄 Next Steps
- Book management system
- Library catalog
- User dashboard
- Admin panel features
- Book borrowing system

## 🆘 Support

If you encounter any issues:

1. Check the console logs for errors
2. Verify all environment variables are set
3. Ensure MongoDB connection is working
4. Check if all dependencies are installed
5. Verify both frontend and backend are running

## 🎉 Success!

Once everything is running, you should have:
- A fully functional authentication system
- MongoDB database connection
- Protected routes working
- User role management
- Beautiful, responsive UI

The login page will appear first, and users will be redirected based on their role after authentication!
