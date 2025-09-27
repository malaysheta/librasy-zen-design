const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Book = require('../models/Book');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendIssueNotification } = require('../services/notificationService');

// @route   POST /api/issues/issue-book
// @desc    Issue a book to a student (manual or QR scan)
// @access  Private (Admin only)
router.post('/issue-book', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { bookId, rollNumber, issueMethod = 'manual', issueDate, dueDate } = req.body;

    // Validate required fields
    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    if (!rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required'
      });
    }

    // Find the book
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book is available
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for issue'
      });
    }

    // Find student by roll number
    const student = await User.findOne({ 
      rollNumber: rollNumber,
      role: 'student',
      isActive: true 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this roll number'
      });
    }

    // Check if student already has this book issued
    const existingIssue = await Issue.findOne({
      book: bookId,
      student: student._id,
      status: { $in: ['issued', 'overdue'] },
      isActive: true
    });

    if (existingIssue) {
      return res.status(400).json({
        success: false,
        message: 'Student already has this book issued'
      });
    }

    // Use provided dates or default to current date and 14 days from now
    const finalIssueDate = issueDate ? new Date(issueDate) : new Date();
    const finalDueDate = dueDate ? new Date(dueDate) : (() => {
      const date = new Date();
      date.setDate(date.getDate() + 14);
      return date;
    })();

    // Create issue record
    const issue = new Issue({
      book: bookId,
      student: student._id,
      rollNumber: rollNumber,
      issueDate: finalIssueDate,
      dueDate: finalDueDate,
      issuedBy: req.user._id,
      status: 'issued'
    });

    await issue.save();

    // Update book available copies
    await book.updateAvailableCopies(-1);

    // Populate the issue with related data
    await issue.populate([
      { path: 'book', select: 'title author isbn coverImage' },
      { path: 'student', select: 'name rollNumber collegeName email' },
      { path: 'issuedBy', select: 'name' }
    ]);

    // Send notification email
    try {
      await sendIssueNotification(issue._id);
    } catch (error) {
      console.error('Error sending issue notification:', error);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: {
        issue,
        book: {
          title: book.title,
          author: book.author,
          availableCopies: book.availableCopies
        },
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          collegeName: student.collegeName
        }
      }
    });
  } catch (error) {
    console.error('Issue book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error issuing book'
    });
  }
});

// @route   POST /api/issues/issue-by-qr
// @desc    Issue a book by scanning QR code
// @access  Private (Admin only)
router.post('/issue-by-qr', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { qrData, rollNumber, issueDate, dueDate } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    if (!rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required'
      });
    }

    // Parse QR data to get book information
    let bookData;
    try {
      bookData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data'
      });
    }

    // Find book by ISBN or ID from QR data
    const book = await Book.findOne({
      $or: [
        { isbn: bookData.isbn },
        { _id: bookData.bookId }
      ],
      isActive: true
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found from QR code'
      });
    }

    // Check if book is available
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for issue'
      });
    }

    // Find student by roll number
    const student = await User.findOne({ 
      rollNumber: rollNumber,
      role: 'student',
      isActive: true 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this roll number'
      });
    }

    // Check if student already has this book issued
    const existingIssue = await Issue.findOne({
      book: book._id,
      student: student._id,
      status: { $in: ['issued', 'overdue'] },
      isActive: true
    });

    if (existingIssue) {
      return res.status(400).json({
        success: false,
        message: 'Student already has this book issued'
      });
    }

    // Use provided dates or default to current date and 14 days from now
    const finalIssueDate = issueDate ? new Date(issueDate) : new Date();
    const finalDueDate = dueDate ? new Date(dueDate) : (() => {
      const date = new Date();
      date.setDate(date.getDate() + 14);
      return date;
    })();

    // Create issue record
    const issue = new Issue({
      book: book._id,
      student: student._id,
      rollNumber: rollNumber,
      issueDate: finalIssueDate,
      dueDate: finalDueDate,
      issuedBy: req.user._id,
      status: 'issued'
    });

    await issue.save();

    // Update book available copies
    await book.updateAvailableCopies(-1);

    // Populate the issue with related data
    await issue.populate([
      { path: 'book', select: 'title author isbn coverImage' },
      { path: 'student', select: 'name rollNumber collegeName email' },
      { path: 'issuedBy', select: 'name' }
    ]);

    // Send notification email
    try {
      await sendIssueNotification(issue._id);
    } catch (error) {
      console.error('Error sending issue notification:', error);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Book issued successfully via QR scan',
      data: {
        issue,
        book: {
          title: book.title,
          author: book.author,
          availableCopies: book.availableCopies
        },
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          collegeName: student.collegeName
        }
      }
    });
  } catch (error) {
    console.error('Issue book by QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Error issuing book via QR scan'
    });
  }
});

// @route   GET /api/issues/student/:rollNumber
// @desc    Get all books issued to a student by roll number
// @access  Private (Admin only)
router.get('/student/:rollNumber', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { rollNumber } = req.params;

    const issues = await Issue.getBooksByRollNumber(rollNumber);

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error('Get student books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student books'
    });
  }
});

// @route   GET /api/issues/overdue
// @desc    Get all overdue books
// @access  Private (Admin only)
router.get('/overdue', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const overdueBooks = await Issue.getOverdueBooks();

    res.json({
      success: true,
      data: overdueBooks
    });
  } catch (error) {
    console.error('Get overdue books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue books'
    });
  }
});

// @route   PUT /api/issues/return/:issueId
// @desc    Return a book
// @access  Private (Admin only)
router.put('/return/:issueId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue || !issue.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Issue record not found'
      });
    }

    if (issue.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Book is already returned'
      });
    }

    // Return the book
    await issue.returnBook(req.user._id);

    // Update book available copies
    const book = await Book.findById(issue.book);
    if (book) {
      await book.updateAvailableCopies(1);
    }

    // Populate the issue with related data
    await issue.populate([
      { path: 'book', select: 'title author isbn' },
      { path: 'student', select: 'name rollNumber' },
      { path: 'issuedBy', select: 'name' },
      { path: 'returnedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: issue
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error returning book'
    });
  }
});

// @route   GET /api/issues/my-books
// @desc    Get current user's books (for students)
// @access  Private (Student only)
router.get('/my-books', auth, async (req, res) => {
  try {
    // Check if user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student privileges required.'
      });
    }

    // Get all books for the current student
    const issues = await Issue.find({
      student: req.user._id,
      isActive: true
    }).populate('book issuedBy returnedBy');

    // Separate current and returned books
    const currentBooks = issues.filter(issue => 
      issue.status === 'issued' || issue.status === 'overdue'
    );
    
    const returnedBooks = issues.filter(issue => 
      issue.status === 'returned'
    );

    // Format the data for frontend
    const formatBookData = (issue) => {
      const book = issue.book;
      const isOverdue = issue.status === 'overdue' || (issue.status === 'issued' && new Date() > issue.dueDate);
      const daysUntilDue = Math.ceil((issue.dueDate - new Date()) / (1000 * 60 * 60 * 24));
      const isNearDue = daysUntilDue <= 3 && daysUntilDue > 0;

      return {
        id: issue._id,
        bookId: book._id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        cover: book.coverImage || '/placeholder.svg',
        dateBorrowed: issue.issueDate,
        dueDate: issue.dueDate,
        returnDate: issue.returnDate,
        status: issue.status,
        isOverdue,
        isNearDue,
        fine: issue.fineAmount || 0,
        issuedBy: issue.issuedBy?.name || 'Unknown',
        returnedBy: issue.returnedBy?.name || null
      };
    };

    const formattedCurrentBooks = currentBooks.map(formatBookData);
    const formattedReturnedBooks = returnedBooks.map(formatBookData);

    res.json({
      success: true,
      data: {
        currentBooks: formattedCurrentBooks,
        returnedBooks: formattedReturnedBooks,
        totalCurrent: formattedCurrentBooks.length,
        totalReturned: formattedReturnedBooks.length
      }
    });
  } catch (error) {
    console.error('Get my books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your books'
    });
  }
});

// @route   GET /api/issues/stats
// @desc    Get issue statistics
// @access  Private (Admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const totalIssues = await Issue.countDocuments({ isActive: true });
    const activeIssues = await Issue.countDocuments({ 
      status: { $in: ['issued', 'overdue'] },
      isActive: true 
    });
    const returnedIssues = await Issue.countDocuments({ 
      status: 'returned',
      isActive: true 
    });
    const overdueIssues = await Issue.countDocuments({ 
      status: 'overdue',
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        totalIssues,
        activeIssues,
        returnedIssues,
        overdueIssues
      }
    });
  } catch (error) {
    console.error('Get issue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issue statistics'
    });
  }
});

// @route   GET /api/issues/notifications
// @desc    Get notifications for current user
// @access  Private (Student only)
router.get('/notifications', auth, async (req, res) => {
  try {
    // Check if user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student privileges required.'
      });
    }

    const { getStudentNotifications } = require('../services/notificationService');
    const notifications = await getStudentNotifications(req.user._id);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
});

// @route   POST /api/issues/trigger-overdue-check
// @desc    Manually trigger overdue check (Admin only)
// @access  Private (Admin only)
router.post('/trigger-overdue-check', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { triggerOverdueCheck } = require('../services/cronService');
    await triggerOverdueCheck();

    res.json({
      success: true,
      message: 'Overdue check triggered successfully'
    });
  } catch (error) {
    console.error('Trigger overdue check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering overdue check'
    });
  }
});

// @route   POST /api/issues/trigger-due-reminders
// @desc    Manually trigger due date reminders (Admin only)
// @access  Private (Admin only)
router.post('/trigger-due-reminders', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { triggerDueDateReminders } = require('../services/cronService');
    await triggerDueDateReminders();

    res.json({
      success: true,
      message: 'Due date reminders triggered successfully'
    });
  } catch (error) {
    console.error('Trigger due reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering due date reminders'
    });
  }
});

module.exports = router;
