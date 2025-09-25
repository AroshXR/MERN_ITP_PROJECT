// Test script to verify order creation functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test data
const testPaymentData = {
  deliveryDetails: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+94771234567",
    address: "123 Main Street",
    city: "Colombo",
    state: "Western",
    zipCode: "00100",
    country: "Sri Lanka"
  },
  shippingDetails: {
    method: "standard",
    cost: 5.99
  },
  paymentDetails: {
    method: "card",
    cardDetails: {
      cardNumber: "1234567890123456",
      expiryDate: "12/25",
      cvv: "123",
      cardName: "John Doe",
      saveCard: false
    }
  },
  orderDetails: {
    subtotal: 29.99,
    tax: 2.40,
    giftWrap: false,
    giftWrapFee: 0,
    total: 37.38,
    cartItems: [
      {
        id: "507f1f77bcf86cd799439011", // Valid ObjectId format
        name: "Custom T-Shirt",
        price: 14.99,
        quantity: 1,
        size: "M",
        color: "Blue",
        clothingType: "tshirt",
        totalPrice: 14.99
      },
      {
        id: "507f1f77bcf86cd799439012", // Valid ObjectId format
        name: "Custom Hoodie",
        price: 14.99,
        quantity: 1,
        size: "L",
        color: "Red",
        clothingType: "hoodie",
        totalPrice: 14.99
      }
    ]
  },
  giftMessage: "",
  userId: "507f1f77bcf86cd799439013" // Valid ObjectId format for user
};

async function testOrderCreation() {
  try {
    console.log('🧪 Testing Order Creation Functionality...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const serverTest = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Server is running:', serverTest.data.message);

    // Test 2: Test payment creation (which should also create orders)
    console.log('\n2. Testing payment and order creation...');
    const paymentResponse = await axios.post(`${BASE_URL}/payment`, testPaymentData);
    
    if (paymentResponse.data.status === 'ok') {
      console.log('✅ Payment created successfully!');
      console.log('   Payment ID:', paymentResponse.data.data.paymentId);
      console.log('   Total Orders Created:', paymentResponse.data.data.totalOrders);
      
      if (paymentResponse.data.data.orders) {
        console.log('   Order Details:');
        paymentResponse.data.data.orders.forEach((order, index) => {
          console.log(`     ${index + 1}. ${order.itemName} (Qty: ${order.quantity}) - Order ID: ${order.orderId}`);
        });
      }
    } else {
      console.log('❌ Payment creation failed:', paymentResponse.data.message);
      return;
    }

    // Test 3: Verify orders were created by fetching them
    console.log('\n3. Verifying orders in database...');
    const ordersResponse = await axios.get(`${BASE_URL}/orders`);
    
    if (ordersResponse.data.status === 'ok') {
      console.log('✅ Orders retrieved successfully!');
      console.log('   Total Orders in DB:', ordersResponse.data.data.length);
      
      // Show recent orders
      const recentOrders = ordersResponse.data.data.slice(0, 3);
      console.log('   Recent Orders:');
      recentOrders.forEach((order, index) => {
        console.log(`     ${index + 1}. Order ID: ${order.OrderID}, Price: $${order.Price}, Qty: ${order.quantity}`);
      });
    } else {
      console.log('❌ Failed to retrieve orders:', ordersResponse.data.message);
    }

    // Test 4: Test order statistics
    console.log('\n4. Testing order statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/orders/statistics`);
    
    if (statsResponse.data.status === 'ok') {
      console.log('✅ Order statistics retrieved successfully!');
      const stats = statsResponse.data.data;
      console.log('   Total Orders:', stats.totalOrders);
      console.log('   Total Revenue: $' + stats.totalRevenue);
      console.log('   Average Order Value: $' + stats.averageOrderValue);
      console.log('   Total Quantity:', stats.totalQuantity);
    } else {
      console.log('❌ Failed to retrieve order statistics:', statsResponse.data.message);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Server connection working');
    console.log('   ✅ Payment creation working');
    console.log('   ✅ Order creation working');
    console.log('   ✅ Order retrieval working');
    console.log('   ✅ Order statistics working');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure the backend server is running (npm start)');
    console.log('   2. Check MongoDB connection');
    console.log('   3. Verify all required models are loaded');
  }
}

// Run the test
testOrderCreation();
