const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { generateBookQRCode, generateMultipleBookQRCodes, generateCustomQRCode } = require('../services/qrService');
const Book = require('../models/Book');

// @route   POST /api/qr/generate/:bookId
// @desc    Generate QR code for a specific book
// @access  Private (Admin only)
router.post('/generate/:bookId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { bookId } = req.params;

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Generate QR code
    const qrResult = await generateBookQRCode(book);

    // Update book with QR code information
    book.qrCode = qrResult.qrCodeUrl;
    book.qrCodePublicId = qrResult.qrCodePublicId;
    await book.save();

    res.json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        bookId: book._id,
        bookTitle: book.title,
        qrCodeUrl: qrResult.qrCodeUrl,
        qrCodePublicId: qrResult.qrCodePublicId,
        isbn: qrResult.isbn
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate QR code'
    });
  }
});

// @route   POST /api/qr/generate-all
// @desc    Generate QR codes for all books
// @access  Private (Admin only)
router.post('/generate-all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get all books
    const books = await Book.find({ isActive: true });
    
    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No books found'
      });
    }

    // Generate QR codes for all books
    const results = await generateMultipleBookQRCodes(books);

    // Update books with QR code information
    for (const result of results) {
      if (result.qrCodeUrl) {
        await Book.findByIdAndUpdate(result.bookId, {
          qrCode: result.qrCodeUrl,
          qrCodePublicId: result.qrCodePublicId
        });
      }
    }

    const successCount = results.filter(r => r.qrCodeUrl).length;
    const errorCount = results.filter(r => r.error).length;

    res.json({
      success: true,
      message: `QR codes generated for ${successCount} books. ${errorCount} failed.`,
      data: {
        totalBooks: books.length,
        successCount,
        errorCount,
        results
      }
    });
  } catch (error) {
    console.error('Bulk QR generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate QR codes'
    });
  }
});

// @route   POST /api/qr/custom
// @desc    Generate custom QR code
// @access  Private (Admin only)
router.post('/custom', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { data, options } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required for QR code generation'
      });
    }

    // Generate custom QR code
    const qrResult = await generateCustomQRCode(data, options);

    res.json({
      success: true,
      message: 'Custom QR code generated successfully',
      data: qrResult
    });
  } catch (error) {
    console.error('Custom QR generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate custom QR code'
    });
  }
});

// @route   GET /api/qr/book/:bookId
// @desc    Get QR code for a specific book
// @access  Private (Admin only)
router.get('/book/:bookId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { bookId } = req.params;

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (!book.qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not generated for this book'
      });
    }

    res.json({
      success: true,
      message: 'QR code retrieved successfully',
      data: {
        bookId: book._id,
        bookTitle: book.title,
        qrCodeUrl: book.qrCode,
        qrCodePublicId: book.qrCodePublicId
      }
    });
  } catch (error) {
    console.error('QR retrieval error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve QR code'
    });
  }
});

module.exports = router;
