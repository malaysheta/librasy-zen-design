const express = require('express');
const router = express.Router();
const { uploadImage } = require('../middleware/upload');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { auth } = require('../middleware/auth');

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private (All authenticated users)
router.post('/image', auth, uploadImage, async (req, res) => {
  try {

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary - use different folder for profile images
    const folder = req.user.role === 'admin' ? 'librasy-zen/book-covers' : 'librasy-zen/profile-images';
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
});

// @route   DELETE /api/upload/image/:publicId
// @desc    Delete image from Cloudinary
// @access  Private (All authenticated users)
router.delete('/image/:publicId', auth, async (req, res) => {
  try {

    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image'
    });
  }
});

module.exports = router;
