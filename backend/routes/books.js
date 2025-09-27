const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { auth } = require('../middleware/auth');
const { generateBookQRCode } = require('../services/qrService');

// @route   GET /api/books
// @desc    Get all books with optional filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      genre = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object - no need to filter by isActive since we do hard deletes
    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add genre filter
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalBooks = await Book.countDocuments(query);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBooks / parseInt(limit)),
          totalBooks,
          hasNext: skip + books.length < totalBooks,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books'
    });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book'
    });
  }
});

// @route   POST /api/books
// @desc    Create new book
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      title,
      author,
      isbn,
      description,
      genre,
      publicationYear,
      publisher,
      totalCopies,
      coverImage,
      cloudinaryPublicId
    } = req.body;

    // Check if book with same ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    const bookData = {
      title,
      author,
      isbn,
      description,
      genre,
      publicationYear,
      publisher,
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1,
      coverImage,
      cloudinaryPublicId
    };

    const book = new Book(bookData);
    await book.save();

    // Generate QR code for the new book
    try {
      console.log('Generating QR code for new book:', book.title);
      const qrResult = await generateBookQRCode(book);
      
      // Update book with QR code information
      book.qrCode = qrResult.qrCodeUrl;
      book.qrCodePublicId = qrResult.qrCodePublicId;
      await book.save();
      
      console.log('QR code generated successfully for book:', book.title);
    } catch (qrError) {
      console.error('Failed to generate QR code for book:', book.title, qrError);
      // Don't fail the book creation if QR generation fails
    }

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    console.error('Create book error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating book'
    });
  }
});

// @route   PUT /api/books/:id
// @desc    Update book
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      title,
      author,
      isbn,
      description,
      genre,
      publicationYear,
      publisher,
      totalCopies,
      coverImage,
      status
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if ISBN is being changed and if new ISBN already exists
    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ isbn, _id: { $ne: req.params.id } });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: 'Book with this ISBN already exists'
        });
      }
    }

    // Update book fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (isbn !== undefined) updateData.isbn = isbn;
    if (description !== undefined) updateData.description = description;
    if (genre !== undefined) updateData.genre = genre;
    if (publicationYear !== undefined) updateData.publicationYear = publicationYear;
    if (publisher !== undefined) updateData.publisher = publisher;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status !== undefined) updateData.status = status;

    // Handle total copies update
    if (totalCopies !== undefined) {
      const copiesDifference = totalCopies - book.totalCopies;
      updateData.totalCopies = totalCopies;
      updateData.availableCopies = Math.max(0, book.availableCopies + copiesDifference);
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating book'
    });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete book (HARD DELETE - permanent removal)
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // HARD DELETE - permanently remove from database
    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Book permanently deleted from database'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book'
    });
  }
});

// @route   GET /api/books/stats/overview
// @desc    Get book statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments({});
    const availableBooks = await Book.countDocuments({ 
      status: 'Available',
      availableCopies: { $gt: 0 }
    });
    const borrowedBooks = await Book.countDocuments({ 
      status: 'Borrowed' 
    });
    const overdueBooks = await Book.countDocuments({ 
      status: 'Overdue' 
    });

    res.json({
      success: true,
      data: {
        totalBooks,
        availableBooks,
        borrowedBooks,
        overdueBooks
      }
    });
  } catch (error) {
    console.error('Get book stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book statistics'
    });
  }
});

module.exports = router;
