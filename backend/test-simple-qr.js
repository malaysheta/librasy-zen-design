const QRCode = require('qrcode');

// Test with very simple data
const simpleData = "Hello World";

console.log('Generating simple test QR code...');

QRCode.toDataURL(simpleData, {
  width: 400,
  margin: 4,
  errorCorrectionLevel: 'L',
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
}, (err, url) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('✅ Simple QR code generated successfully!');
  console.log('📱 Try scanning this QR code with your phone:');
  console.log('Data: "Hello World"');
  console.log('URL:', url.substring(0, 100) + '...');
  console.log('\n🔍 If this simple QR code works, then the issue is with the book QR data.');
  console.log('📱 Use your phone camera or Google Lens to scan it.');
});
