// Simple payment test with mock data
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testPaymentWithOrders() {
  try {
    console.log('🧪 Testing Payment with Order Creation...\n');

    // Test server connection
    const serverTest = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Server is running:', serverTest.data.message);

    // Create payment with mock cart items (using valid ObjectId format)
    const testPaymentData = {
      deliveryDetails: {
        firstName: "John",
        lastName: "Doe", 
        email: "john@example.com",
        phone: "+94771234567",
        address: "123 Test Street",
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
            id: "507f1f77bcf86cd799439011", // Valid ObjectId
            name: "Custom T-Shirt",
            price: 14.99,
            quantity: 1,
            size: "M",
            color: "Blue",
            clothingType: "tshirt",
            totalPrice: 14.99
          },
          {
            id: "507f1f77bcf86cd799439012", // Valid ObjectId
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
      userId: "507f1f77bcf86cd799439013" // Valid ObjectId for user
    };

    console.log('📤 Sending payment request...');
    console.log('Cart items:', testPaymentData.orderDetails.cartItems.length);

    const paymentResponse = await axios.post(`${BASE_URL}/payment`, testPaymentData);
    
    console.log('\n📥 Payment Response:');
    console.log('Status:', paymentResponse.data.status);
    console.log('Message:', paymentResponse.data.message);
    
    if (paymentResponse.data.status === 'ok') {
      console.log('✅ Payment created successfully!');
      console.log('Payment ID:', paymentResponse.data.data.paymentId);
      console.log('Total Orders Created:', paymentResponse.data.data.totalOrders);
      
      if (paymentResponse.data.data.orders && paymentResponse.data.data.orders.length > 0) {
        console.log('\n📋 Created Orders:');
        paymentResponse.data.data.orders.forEach((order, index) => {
          console.log(`${index + 1}. Order ID: ${order.orderId}`);
          console.log(`   Item: ${order.itemName}`);
          console.log(`   Quantity: ${order.quantity}`);
          console.log(`   Price: $${order.price}`);
        });
      } else {
        console.log('❌ No orders were created');
      }
    } else {
      console.log('❌ Payment failed:', paymentResponse.data.message);
    }

    // Check orders in database
    console.log('\n🔍 Checking orders in database...');
    const ordersCheck = await axios.get(`${BASE_URL}/debug/orders`);
    console.log('Orders in database:', ordersCheck.data.count);
    
    if (ordersCheck.data.data && ordersCheck.data.data.length > 0) {
      console.log('Recent orders:');
      ordersCheck.data.data.slice(0, 5).forEach((order, index) => {
        console.log(`${index + 1}. ${order.OrderID} - $${order.Price} (${order.CreatedAt})`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testPaymentWithOrders();
