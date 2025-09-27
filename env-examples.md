# Environment Files Setup

## Backend Environment File

Create a file named `.env` in the `backend/` folder with the following content:

```env
MONGODB_URI=mongodb+srv://jenil:jenil@cluster0.tk9mqsc.mongodb.net/lib
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789
PORT=5000
NODE_ENV=development
```

## Frontend Environment File

Create a file named `.env` in the root directory (same level as `package.json`) with the following content:

```env
VITE_API_URL=http://localhost:5000/api
```

## How to Create These Files

### For Backend (.env in backend/ folder):
1. Navigate to the `backend` folder
2. Create a new file named `.env`
3. Copy and paste the backend environment variables above

### For Frontend (.env in root folder):
1. In the root directory (where your main package.json is)
2. Create a new file named `.env`
3. Copy and paste the frontend environment variable above

## Environment Variables Explained

### Backend Variables:
- **MONGODB_URI**: Your MongoDB connection string
- **JWT_SECRET**: Secret key for JWT token signing (change this for production!)
- **PORT**: Port where backend server runs (default: 5000)
- **NODE_ENV**: Environment mode (development/production)

### Frontend Variables:
- **VITE_API_URL**: URL where your backend API is running

## Quick Setup Commands

You can also run the backend setup script which will create the backend .env file automatically:

```bash
cd backend
npm run setup
```

This will create the backend .env file with default values.
