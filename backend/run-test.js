// Simple script to test order creation
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting Order Creation Test...\n');

// Run the test
const testPath = path.join(__dirname, 'test-order-creation.js');
exec(`node "${testPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Test execution failed:', error.message);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Test warnings:', stderr);
  }
  
  console.log(stdout);
});

console.log('📝 Instructions:');
console.log('1. Make sure your backend server is running: npm start');
console.log('2. Make sure MongoDB is connected');
console.log('3. The test will create sample orders in your existing "order" collection');
console.log('4. Check your MongoDB database to verify orders are saved\n');
