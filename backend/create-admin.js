const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const connectDB = require('./config/database');

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('📡 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@librasyzen.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@librasyzen.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: admin');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@librasyzen.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    // Save admin user
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@librasyzen.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('🆔 User ID:', adminUser._id);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
};

// Run the script
createAdminUser();
