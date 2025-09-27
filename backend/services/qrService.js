const QRCode = require('qrcode');
const { uploadToCloudinary } = require('../config/cloudinary');

// Generate QR code for a book with ISBN only
const generateBookQRCode = async (book) => {
  try {
    console.log('Generating QR code for book:', book.title);
    
    // Validate ISBN exists
    if (!book.isbn || book.isbn.trim() === '') {
      throw new Error('Book must have a valid ISBN to generate QR code');
    }

    // Use only ISBN number for QR code (simple text format)
    const isbnString = book.isbn.trim();
    
    console.log('Book ISBN for QR code:', isbnString);

    // Generate QR code with MAXIMUM scannability settings
    const qrCodeBuffer = await QRCode.toBuffer(isbnString, {
      type: 'png',
      width: 500, // Even larger for better scanning
      margin: 6, // Maximum margin for scanning area
      color: {
        dark: '#000000', // Pure black
        light: '#FFFFFF' // Pure white
      },
      errorCorrectionLevel: 'L', // Lowest error correction
      quality: 1.0, // Maximum quality
      maskPattern: 0 // Use simplest mask pattern
    });

    console.log('QR code generated, buffer size:', qrCodeBuffer.length);

    // Upload QR code to Cloudinary
    const uploadResult = await uploadToCloudinary(qrCodeBuffer, 'librasy-zen/qr-codes');
    
    console.log('QR code uploaded to Cloudinary:', uploadResult.secure_url);

    return {
      qrCodeUrl: uploadResult.secure_url,
      qrCodePublicId: uploadResult.public_id,
      isbn: isbnString
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code for book');
  }
};

// Generate QR code for multiple books
const generateMultipleBookQRCodes = async (books) => {
  try {
    console.log(`Generating QR codes for ${books.length} books`);
    
    const results = [];
    
    for (const book of books) {
      try {
        const qrResult = await generateBookQRCode(book);
        results.push({
          bookId: book._id,
          bookTitle: book.title,
          ...qrResult
        });
      } catch (error) {
        console.error(`Failed to generate QR code for book ${book.title}:`, error);
        results.push({
          bookId: book._id,
          bookTitle: book.title,
          error: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error generating multiple QR codes:', error);
    throw new Error('Failed to generate QR codes for books');
  }
};

// Generate QR code with custom data
const generateCustomQRCode = async (data, options = {}) => {
  try {
    const qrOptions = {
      type: 'png',
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#FFFFFF'
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M'
    };

    const qrCodeBuffer = await QRCode.toBuffer(data, qrOptions);
    const uploadResult = await uploadToCloudinary(qrCodeBuffer, 'librasy-zen/qr-codes');
    
    return {
      qrCodeUrl: uploadResult.secure_url,
      qrCodePublicId: uploadResult.public_id
    };
  } catch (error) {
    console.error('Error generating custom QR code:', error);
    throw new Error('Failed to generate custom QR code');
  }
};

module.exports = {
  generateBookQRCode,
  generateMultipleBookQRCodes,
  generateCustomQRCode
};
