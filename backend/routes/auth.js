const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production', {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('rollNumber').optional().trim().isLength({ min: 1 }).withMessage('Roll number is required'),
  body('collegeName').optional().trim().isLength({ min: 2 }).withMessage('College name must be at least 2 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, fullName, email, rollNumber, collegeName, password } = req.body;

    // Check if user already exists with email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if roll number already exists (only if provided)
    if (rollNumber) {
      const existingUserByRoll = await User.findOne({ rollNumber });
      if (existingUserByRoll) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this roll number'
        });
      }
    }

    // Create new user
    const user = new User({
      name,
      fullName: fullName || name,
      email,
      rollNumber: rollNumber || '',
      collegeName: collegeName || '',
      password,
      role: email.includes('admin') ? 'admin' : 'student'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          fullName: user.fullName,
          email: user.email,
          rollNumber: user.rollNumber,
          collegeName: user.collegeName,
          profileImage: user.profileImage,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          fullName: user.fullName || user.name,
          email: user.email,
          rollNumber: user.rollNumber || '',
          collegeName: user.collegeName || '',
          profileImage: user.profileImage || null,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   GET /api/auth/roll/:rollNumber
// @desc    Get user by roll number
// @access  Private (Admin only)
router.get('/roll/:rollNumber', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { rollNumber } = req.params;

    const user = await User.findOne({ 
      rollNumber: rollNumber,
      role: 'student',
      isActive: true 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this roll number'
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        collegeName: user.collegeName,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user by roll number error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('rollNumber').optional().trim().isLength({ min: 1 }).withMessage('Roll number is required'),
  body('collegeName').optional().trim().isLength({ min: 2 }).withMessage('College name must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, fullName, email, rollNumber, collegeName, profileImage, profileImagePublicId } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    const existingUserByEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken by another user'
      });
    }

    // Check if roll number is already taken by another user (only if provided)
    if (rollNumber) {
      const existingUserByRoll = await User.findOne({ rollNumber, _id: { $ne: userId } });
      if (existingUserByRoll) {
        return res.status(400).json({
          success: false,
          message: 'Roll number is already taken by another user'
        });
      }
    }

    // Update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.name = name;
    user.fullName = fullName || user.fullName || name;
    user.email = email;
    user.rollNumber = rollNumber || user.rollNumber || '';
    user.collegeName = collegeName || user.collegeName || '';
    
    // Update profile image if provided
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }
    if (profileImagePublicId !== undefined) {
      user.profileImagePublicId = profileImagePublicId;
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          fullName: user.fullName,
          email: user.email,
          rollNumber: user.rollNumber,
          collegeName: user.collegeName,
          profileImage: user.profileImage,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

module.exports = router;
