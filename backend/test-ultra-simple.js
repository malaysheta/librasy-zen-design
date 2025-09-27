const QRCode = require('qrcode');

// Test with the SIMPLEST possible data
const ultraSimpleData = "TEST";

console.log('🔧 Generating ULTRA SIMPLE QR code...');
console.log('📱 Data: "TEST"');
console.log('📱 This should scan with ANY QR scanner!');

QRCode.toDataURL(ultraSimpleData, {
  width: 500,
  margin: 6,
  errorCorrectionLevel: 'L',
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  maskPattern: 0
}, (err, url) => {
  if (err) {
    console.error('❌ Error:', err);
    return;
  }
  
  console.log('✅ ULTRA SIMPLE QR code generated!');
  console.log('📱 SCAN THIS QR CODE NOW:');
  console.log('📱 Use your phone camera or Google Lens');
  console.log('📱 You should see: "TEST"');
  console.log('\n🔍 If this simple QR code works, then the book QR will work too!');
});
