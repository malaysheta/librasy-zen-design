# Book Management Setup

This document explains how to set up and use the book management functionality in LibraSys.

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Make sure you have the following environment variables set in your `.env` file:
```
MONGODB_URI=mongodb+srv://jenil:jenil@cluster0.tk9mqsc.mongodb.net/lib
NODE_ENV=development
PORT=5000
```

### 3. Start the Server
```bash
npm start
```

### 4. Seed Sample Books (Optional)
To populate the database with sample books for testing:
```bash
node seed-books.js
```

## API Endpoints

### Books
- `GET /api/books` - Get all books (with pagination, search, filtering)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)
- `GET /api/books/stats/overview` - Get book statistics

### Query Parameters for GET /api/books
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in title, author, or ISBN
- `status` - Filter by status (Available, Borrowed, Maintenance, Lost)
- `genre` - Filter by genre
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc, default: desc)

## Frontend Features

### Add Book Dialog
- Click the floating action button (+) to add a new book
- Fill in the required fields (Title, Author, ISBN, Total Copies)
- Optional fields include description, genre, publication year, publisher, location, and cover image
- Form validation ensures data integrity

### Book Management
- View all books in a table format
- Search books by title, author, or ISBN
- Delete books (with confirmation)
- Real-time statistics display
- Responsive design for all screen sizes

### Statistics
- Total Books count
- Books on Loan count
- Books Overdue count
- Real-time updates when books are added/deleted

## Database Schema

### Book Model
```javascript
{
  title: String (required)
  author: String (required)
  isbn: String (required, unique)
  description: String (optional)
  genre: String (optional)
  publicationYear: Number (optional)
  publisher: String (optional)
  totalCopies: Number (required, default: 1)
  availableCopies: Number (required, auto-calculated)
  status: Enum ['Available', 'Borrowed', 'Maintenance', 'Lost']
  coverImage: String (optional)
  location: String (optional)
  isActive: Boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

## Security Features

- Admin-only access for book creation, update, and deletion
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers

## Error Handling

- Comprehensive error handling for all API endpoints
- User-friendly error messages
- Validation error details
- Graceful fallbacks for network issues
