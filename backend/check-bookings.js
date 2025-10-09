require('dotenv').config();
const mongoose = require('mongoose');

// Load all required models
require('./models/User');
require('./models/Outfit');
const Booking = require('./models/Booking');

const checkBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      dbName: process.env.MONGODB_DBNAME,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get all bookings
    const allBookings = await Booking.find().populate('user').populate('outfit');
    console.log(`📋 Total bookings: ${allBookings.length}`);
    
    if (allBookings.length > 0) {
      console.log('\n📝 Recent bookings:');
      allBookings.slice(-5).forEach((booking, i) => {
        const returnDate = new Date(booking.returnDate);
        const today = new Date();
        const daysUntilReturn = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
        
        console.log(`${i+1}. ID: ${booking._id.toString().slice(-6)}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Return Date: ${returnDate.toLocaleDateString()}`);
        console.log(`   Days until return: ${daysUntilReturn}`);
        console.log(`   Email: ${booking.email}`);
        console.log('   ---');
      });
    }
    
    // Check tomorrow's bookings specifically
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(23, 59, 59, 999);
    
    const upcomingBookings = await Booking.find({
      returnDate: {
        $gte: today,
        $lte: tomorrow
      }
    });
    
    console.log(`\n🔍 Bookings with return date today or tomorrow: ${upcomingBookings.length}`);
    upcomingBookings.forEach((booking, i) => {
      const returnDate = new Date(booking.returnDate);
      const daysUntilReturn = Math.ceil((returnDate - new Date()) / (1000 * 60 * 60 * 24));
      
      console.log(`${i+1}. ID: ${booking._id.toString().slice(-6)}`);
      console.log(`   Status: ${booking.status} (needs to be 'confirmed')`);
      console.log(`   Return Date: ${returnDate.toLocaleDateString()}`);
      console.log(`   Days until return: ${daysUntilReturn}`);
      console.log(`   Email: ${booking.email}`);
      console.log('   ---');
    });
    
    // Check confirmed bookings specifically
    const confirmedUpcoming = await Booking.find({
      returnDate: {
        $gte: today,
        $lte: tomorrow
      },
      status: 'confirmed'
    });
    
    console.log(`\n✅ CONFIRMED bookings with return date today or tomorrow: ${confirmedUpcoming.length}`);
    console.log('(These are the ones that will get reminder emails)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

checkBookings();
