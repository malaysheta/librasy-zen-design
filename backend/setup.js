const fs = require('fs');
const path = require('path');

// Create .env file with default values
const envContent = `MONGODB_URI=mongodb+srv://jenil:jenil@cluster0.tk9mqsc.mongodb.net/lib
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}
PORT=5000
NODE_ENV=development`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please review and update the JWT_SECRET in the .env file for production use.');
} else {
  console.log('⚠️  .env file already exists. Skipping creation.');
}

console.log('\n🚀 Backend setup complete!');
console.log('📋 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('3. Your API will be available at http://localhost:5000');
