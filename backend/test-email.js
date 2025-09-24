const nodemailer = require('nodemailer');
require('dotenv').config();

// Simple email test
async function testEmail() {
  console.log('🧪 Testing Email Configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS.includes('REPLACE')) {
    console.log('❌ Email not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Test connection
    console.log('🔗 Testing connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');

    // Send test email
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'kadavishkakanakasekara@gmail.com',
      subject: '🧪 Test Email - Klassy T Shirts Inventory System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2563eb;">✅ Email System Working!</h1>
            <p>This is a test email from your Klassy T Shirts Inventory Management System.</p>
            <p><strong>Email Configuration:</strong> Successfully configured</p>
            <p><strong>Recipient:</strong> kadavishkakanakasekara@gmail.com</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p>Your low stock alerts are now ready to work!</p>
            <p style="color: #666; font-size: 14px;">© 2025 Klassy T Shirts - Inventory Management System</p>
          </div>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('📬 Check your inbox: kadavishkakanakasekara@gmail.com');

  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Solution: Generate a Gmail App Password');
      console.log('   1. Go to https://myaccount.google.com/');
      console.log('   2. Security → 2-Step Verification → App passwords');
      console.log('   3. Generate password for "Mail"');
      console.log('   4. Update EMAIL_PASS in .env file');
    }
  }
}

testEmail();
