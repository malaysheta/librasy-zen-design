#!/usr/bin/env node

/**
 * Simple script to regenerate all QR codes in the database
 * Run this from the backend directory: node regenerate-qr-simple.js
 */

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
    log('🔄 Starting QR Code Regeneration Process...', 'cyan');
    
    // Connect to MongoDB
    log('🔌 Connecting to MongoDB...', 'blue');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/librasy-zen', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log('✅ Connected to MongoDB', 'green');
    
    // Get all active books
    log('📚 Fetching all books from database...', 'blue');
    const books = await Book.find({ isActive: true });
    
    if (books.length === 0) {
      log('❌ No books found in database', 'red');
      return;
    }
    
    log(`📖 Found ${books.length} books to process`, 'yellow');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each book
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      log(`\n📝 Processing ${i + 1}/${books.length}: ${book.title}`, 'blue');
      
      try {
        // Generate new QR code with JSON format
        const qrResult = await generateBookQRCode(book);
        
        // Update book with new QR code
        book.qrCode = qrResult.qrCodeUrl;
        book.qrCodePublicId = qrResult.qrCodePublicId;
        await book.save();
        
        log(`   ✅ QR code regenerated successfully`, 'green');
        log(`   🔗 URL: ${qrResult.qrCodeUrl}`, 'cyan');
        successCount++;
        
      } catch (error) {
        log(`   ❌ Failed: ${error.message}`, 'red');
        errors.push({
          bookTitle: book.title,
          bookId: book._id,
          error: error.message
        });
        errorCount++;
      }
    }
    
    // Summary
    log('\n📊 Regeneration Summary:', 'bright');
    log(`   • Total Books: ${books.length}`, 'blue');
    log(`   • Successfully Regenerated: ${successCount}`, 'green');
    log(`   • Failed: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    
    if (errorCount > 0) {
      log('\n❌ Failed Books:', 'red');
      errors.forEach(error => {
        log(`   • ${error.bookTitle}: ${error.error}`, 'red');
      });
    }
    
    log('\n🎉 QR Code Regeneration Completed!', 'green');
    log('📱 All QR codes now use the new JSON format with structured data.', 'cyan');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    log('🔌 Database connection closed', 'blue');
  }
}

// Run the script
if (require.main === module) {
  log('🚀 Librasy Zen - QR Code Regeneration Tool', 'magenta');
  log('==========================================', 'magenta');
  
  regenerateAllQRCodes()
    .then(() => {
      log('\n✨ Process completed successfully!', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log(`\n💥 Process failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { regenerateAllQRCodes };
