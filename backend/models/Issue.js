const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued'
  },
  fineAmount: {
    type: Number,
    default: 0,
    min: [0, 'Fine amount cannot be negative']
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Issued by is required']
  },
  returnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
issueSchema.index({ book: 1, student: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ dueDate: 1 });
issueSchema.index({ rollNumber: 1 });

// Virtual for checking if book is overdue
issueSchema.virtual('isOverdue').get(function() {
  if (this.status === 'returned') return false;
  return new Date() > this.dueDate;
});

// Method to calculate fine
issueSchema.methods.calculateFine = function() {
  if (this.status === 'returned') return 0;
  
  const today = new Date();
  const daysOverdue = Math.ceil((today - this.dueDate) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue > 0) {
    // Fine calculation: 50 rupees per day overdue
    return daysOverdue * 50;
  }
  
  return 0;
};

// Method to return book
issueSchema.methods.returnBook = function(returnedBy) {
  this.status = 'returned';
  this.returnDate = new Date();
  this.returnedBy = returnedBy;
  this.fineAmount = this.calculateFine();
  return this.save();
};

// Pre-save middleware to update status based on due date
issueSchema.pre('save', function(next) {
  if (this.status === 'issued' && this.isOverdue) {
    this.status = 'overdue';
  }
  next();
});

// Static method to get overdue books
issueSchema.statics.getOverdueBooks = function() {
  return this.find({
    status: { $in: ['issued', 'overdue'] },
    dueDate: { $lt: new Date() }
  }).populate('book student issuedBy');
};

// Static method to get books by student
issueSchema.statics.getBooksByStudent = function(studentId) {
  return this.find({
    student: studentId,
    isActive: true
  }).populate('book issuedBy returnedBy');
};

// Static method to get books by roll number
issueSchema.statics.getBooksByRollNumber = function(rollNumber) {
  return this.find({
    rollNumber: rollNumber,
    isActive: true
  }).populate('book student issuedBy returnedBy');
};

// Remove sensitive fields from JSON output
issueSchema.methods.toJSON = function() {
  const issue = this.toObject();
  return issue;
};

module.exports = mongoose.model('Issue', issueSchema);
