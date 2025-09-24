// Simple test to create an order directly
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function testOrderCreation() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
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

    // Load the Order model
    const Order = require('./models/OrderModel');
    
    // Check existing orders
    const existingOrders = await Order.find();
    console.log('📊 Existing orders in database:', existingOrders.length);

    // Create a test order
    console.log('\n🧪 Creating test order...');
    
    const testOrder = new Order({
      OrderID: `TEST-${Date.now()}`,
      quantity: 1,
      PaymentID: 'test-payment-123',
      DesignID: new mongoose.Types.ObjectId(), // Generate a valid ObjectId
      Price: 25.99,
      AdminID: new mongoose.Types.ObjectId(), // Generate a valid ObjectId
      ItemID: 'test-item-123',
      CreatedAt: new Date()
    });

    const savedOrder = await testOrder.save();
    console.log('✅ Test order created successfully!');
    console.log('Order details:', {
      _id: savedOrder._id,
      OrderID: savedOrder.OrderID,
      Price: savedOrder.Price,
      CreatedAt: savedOrder.CreatedAt
    });

    // Check orders again
    const ordersAfter = await Order.find();
    console.log('\n📊 Orders in database after test:', ordersAfter.length);

    // List all orders
    if (ordersAfter.length > 0) {
      console.log('\nAll orders:');
      ordersAfter.forEach((order, index) => {
        console.log(`${index + 1}. OrderID: ${order.OrderID}, Price: $${order.Price}`);
      });
    }

    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testOrderCreation();
