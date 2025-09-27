const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    match: [/^[\d-]+$/, 'ISBN must contain only numbers and hyphens']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  genre: {
    type: String,
    trim: true,
    maxlength: [50, 'Genre cannot be more than 50 characters']
  },
  publicationYear: {
    type: Number,
    min: [1000, 'Publication year must be valid'],
    max: [new Date().getFullYear(), 'Publication year cannot be in the future']
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot be more than 100 characters']
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: [1, 'Total copies must be at least 1'],
    default: 1
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies is required'],
    min: [0, 'Available copies cannot be negative'],
    default: function() {
      return this.totalCopies;
    }
  },
  status: {
    type: String,
    enum: ['Available', 'Borrowed', 'Maintenance', 'Lost'],
    default: 'Available'
  },
  coverImage: {
    type: String,
    trim: true
  },
  cloudinaryPublicId: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String,
    trim: true
  },
  qrCodePublicId: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });
bookSchema.index({ status: 1 });
bookSchema.index({ genre: 1 });

// Virtual for checking if book is available
bookSchema.virtual('isAvailable').get(function() {
  return this.availableCopies > 0 && this.status === 'Available';
});

// Method to update available copies when book is borrowed/returned
bookSchema.methods.updateAvailableCopies = function(change) {
  this.availableCopies = Math.max(0, this.availableCopies + change);
  if (this.availableCopies === 0) {
    this.status = 'Borrowed';
  } else if (this.availableCopies > 0 && this.status === 'Borrowed') {
    this.status = 'Available';
  }
  return this.save();
};

// Pre-save middleware to ensure available copies don't exceed total copies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

// Remove sensitive fields from JSON output
bookSchema.methods.toJSON = function() {
  const book = this.toObject();
  return book;
};

module.exports = mongoose.model('Book', bookSchema);
