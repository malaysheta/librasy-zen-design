const mongoose = require('mongoose');
const { generateBookQRCode } = require('./services/qrService');
const Book = require('./models/Book');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function regenerateAllQRCodes() {
  try {
    log('🚀 Starting QR Code Regeneration (ISBN-Only Format)', 'cyan');
    log('================================================', 'cyan');
    
    // Connect to MongoDB
    log('📡 Connecting to MongoDB...', 'blue');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/librasy-zen');
    log('✅ Connected to MongoDB', 'green');
    
    // Get all books
    log('📚 Fetching all books...', 'blue');
    const books = await Book.find({});
    log(`📖 Found ${books.length} books`, 'green');
    
    if (books.length === 0) {
      log('❌ No books found in database', 'red');
      return;
    }
    
    // Filter books with valid ISBNs
    const booksWithISBN = books.filter(book => book.isbn && book.isbn.trim() !== '');
    const booksWithoutISBN = books.filter(book => !book.isbn || book.isbn.trim() === '');
    
    log(`📊 Books with ISBN: ${booksWithISBN.length}`, 'green');
    log(`⚠️  Books without ISBN: ${booksWithoutISBN.length}`, 'yellow');
    
    if (booksWithoutISBN.length > 0) {
      log('📋 Books without ISBN (will be skipped):', 'yellow');
      booksWithoutISBN.forEach(book => {
        log(`   - ${book.title} (ID: ${book._id})`, 'yellow');
      });
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each book with ISBN
    for (let i = 0; i < booksWithISBN.length; i++) {
      const book = booksWithISBN[i];
      const progress = `[${i + 1}/${booksWithISBN.length}]`;
      
      try {
        log(`\n${progress} 🔄 Processing: ${book.title}`, 'blue');
        log(`   📖 ISBN: ${book.isbn}`, 'cyan');
        
        // Generate new QR code with ISBN only
        const qrResult = await generateBookQRCode(book);
        
        // Update book with new QR code
        book.qrCode = qrResult.qrCodeUrl;
        book.qrCodePublicId = qrResult.qrCodePublicId;
        await book.save();
        
        log(`   ✅ QR Code regenerated successfully`, 'green');
        log(`   🔗 URL: ${qrResult.qrCodeUrl}`, 'cyan');
        successCount++;
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        log(`   ❌ Error: ${error.message}`, 'red');
        errors.push({
          bookId: book._id,
          bookTitle: book.title,
          isbn: book.isbn,
          error: error.message
        });
        errorCount++;
      }
    }
    
    // Summary
    log('\n🎉 QR Code Regeneration Complete!', 'green');
    log('================================', 'green');
    log(`✅ Successfully processed: ${successCount} books`, 'green');
    log(`❌ Errors: ${errorCount} books`, errorCount > 0 ? 'red' : 'green');
    
    if (errors.length > 0) {
      log('\n📋 Error Details:', 'red');
      errors.forEach(error => {
        log(`   - ${error.bookTitle} (ISBN: ${error.isbn}): ${error.error}`, 'red');
      });
    }
    
    // Show books without ISBN
    if (booksWithoutISBN.length > 0) {
      log('\n⚠️  Books Skipped (No ISBN):', 'yellow');
      booksWithoutISBN.forEach(book => {
        log(`   - ${book.title} (ID: ${book._id})`, 'yellow');
      });
      log('\n💡 Tip: Add ISBN numbers to these books to generate QR codes', 'yellow');
    }
    
    log('\n🔍 Next Steps:', 'cyan');
    log('1. Test QR code scanning with the new ISBN-only format', 'cyan');
    log('2. Verify that books can be found by ISBN when QR codes are scanned', 'cyan');
    log('3. Update any documentation about QR code format', 'cyan');
    
  } catch (error) {
    log(`💥 Fatal error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    log('\n📡 Database connection closed', 'blue');
    process.exit(0);
  }
}

// Run the regeneration
if (require.main === module) {
  regenerateAllQRCodes();
}

module.exports = { regenerateAllQRCodes };
