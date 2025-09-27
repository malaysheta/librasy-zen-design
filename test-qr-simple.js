const QRCode = require('qrcode');

// Generate a simple test QR code
const testData = "Hello World - QR Code Test";

QRCode.toDataURL(testData, (err, url) => {
  if (err) {
    console.error('Error generating test QR:', err);
    return;
  }
  
  console.log('Test QR Code generated successfully!');
  console.log('Data URL:', url);
  console.log('Try scanning this QR code to test your scanner app.');
});
