const mongoose = require('mongoose');
const Book = require('./models/Book');
require('dotenv').config();

const sampleBooks = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    description: "A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice, it views a world of great beauty and savage inequities through the eyes of a young girl.",
    genre: "Fiction",
    publicationYear: 1960,
    publisher: "J.B. Lippincott & Co.",
    totalCopies: 3,
    availableCopies: 2,
    status: "Available"
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-452-28423-4",
    description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.",
    genre: "Science Fiction",
    publicationYear: 1949,
    publisher: "Secker & Warburg",
    totalCopies: 2,
    availableCopies: 0,
    status: "Borrowed"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0-14-143951-8",
    description: "A romantic novel of manners written by Jane Austen in 1813.",
    genre: "Romance",
    publicationYear: 1813,
    publisher: "T. Egerton, Whitehall",
    totalCopies: 4,
    availableCopies: 4,
    status: "Available"
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    description: "A 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City.",
    genre: "Fiction",
    publicationYear: 1925,
    publisher: "Charles Scribner's Sons",
    totalCopies: 2,
    availableCopies: 1,
    status: "Available"
  },
  {
    title: "Moby Dick",
    author: "Herman Melville",
    isbn: "978-0-14-243724-7",
    description: "An 1851 novel by American writer Herman Melville. The book is the sailor Ishmael's narrative of the obsessive quest of Ahab, captain of the whaling ship Pequod.",
    genre: "Adventure",
    publicationYear: 1851,
    publisher: "Richard Bentley",
    totalCopies: 1,
    availableCopies: 1,
    status: "Available"
  }
];

const seedBooks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jenil:jenil@cluster0.tk9mqsc.mongodb.net/lib', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Insert sample books
    const books = await Book.insertMany(sampleBooks);
    console.log(`Seeded ${books.length} books successfully`);

    // Display the seeded books
    console.log('\nSeeded books:');
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} by ${book.author} (ISBN: ${book.isbn})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
};

// Run the seeder
seedBooks();
