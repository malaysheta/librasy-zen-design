const dotenv = require('dotenv');
dotenv.config();

console.log('Cloudinary Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET || 'NOT SET');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.log('\n❌ Cloudinary credentials are missing!');
  console.log('Please add them to your backend/.env file:');
  console.log('CLOUDINARY_CLOUD_NAME=your-cloud-name');
  console.log('CLOUDINARY_API_KEY=your-api-key');
  console.log('CLOUDINARY_API_SECRET=your-api-secret');
} else {
  console.log('\n✅ Cloudinary credentials are set!');
}
