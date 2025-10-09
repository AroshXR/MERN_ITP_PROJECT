const mongoose = require('mongoose');
require('dotenv').config();

// Load all required models first
require('./models/User');
require('./models/Outfit');

// Import models and services
const Booking = require('./models/Booking');
const { sendReturnReminderEmail } = require('./services/emailService');
const { checkReturnReminders } = require('./services/reminderScheduler');

// Test the return reminder functionality
const testReturnReminder = async () => {
  try {
    console.log('🧪 Testing Return Reminder Email System...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      dbName: process.env.MONGODB_DBNAME,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Find bookings with upcoming return dates
    console.log('📋 Test 1: Finding bookings with upcoming return dates...');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(23, 59, 59, 999);
    
    const upcomingReturns = await Booking.find({
      returnDate: {
        $gte: today,
        $lte: tomorrow
      },
      status: 'confirmed'
    }).populate('user').populate('outfit');
    
    console.log(`   Found ${upcomingReturns.length} bookings with upcoming returns`);
    
    if (upcomingReturns.length > 0) {
      upcomingReturns.forEach((booking, index) => {
        const daysUntilReturn = Math.ceil((new Date(booking.returnDate) - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`   ${index + 1}. Booking #${booking._id.toString().slice(-6)} - ${booking.email} - ${daysUntilReturn} days until return`);
      });
    } else {
      console.log('   No bookings found with upcoming return dates');
    }
    
    console.log('');
    
    // Test 2: Test email sending with a sample booking
    console.log('📧 Test 2: Testing email reminder functionality...');
    
    if (upcomingReturns.length > 0) {
      const testBooking = upcomingReturns[0];
      console.log(`   Sending test reminder for booking #${testBooking._id.toString().slice(-6)}`);
      
      const result = await sendReturnReminderEmail(testBooking, testBooking.email);
      
      if (result.success) {
        console.log(`   ✅ Test email sent successfully to ${testBooking.email}`);
        console.log(`   📧 Message ID: ${result.messageId}`);
      } else {
        console.log(`   ❌ Failed to send test email: ${result.error}`);
      }
    } else {
      console.log('   ⏭️ Skipping email test - no upcoming bookings found');
    }
    
    console.log('');
    
    // Test 3: Test the scheduled reminder check
    console.log('🔄 Test 3: Testing scheduled reminder check...');
    await checkReturnReminders();
    console.log('   ✅ Scheduled reminder check completed');
    
    console.log('\n🎉 Return reminder testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the test
testReturnReminder();
