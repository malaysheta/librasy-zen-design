const mongoose = require('mongoose');
const Book = require('./models/Book');
require('dotenv').config();

const cleanupInactiveBooks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jenil:jenil@cluster0.tk9mqsc.mongodb.net/lib', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find and delete inactive books
    const result = await Book.deleteMany({ isActive: false });
    console.log(`Deleted ${result.deletedCount} inactive books`);

    // Show remaining active books
    const activeBooks = await Book.find({ isActive: true });
    console.log(`Remaining active books: ${activeBooks.length}`);
    activeBooks.forEach(book => {
      console.log(`- ${book.title} by ${book.author} (${book.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up books:', error);
    process.exit(1);
  }
};

// Run the cleanup
cleanupInactiveBooks();
