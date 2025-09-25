// Debug script to check order creation
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function debugOrders() {
  try {
    console.log('🔍 Debugging Order Creation...\n');

    // Check server connection
    console.log('1. Testing server connection...');
    const serverTest = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Server is running:', serverTest.data.message);

    // Check current orders in database
    console.log('\n2. Checking existing orders in database...');
    const ordersCheck = await axios.get(`${BASE_URL}/debug/orders`);
    console.log('📊 Orders in database:', ordersCheck.data.count);
    
    if (ordersCheck.data.data && ordersCheck.data.data.length > 0) {
      console.log('Recent orders:');
      ordersCheck.data.data.forEach((order, index) => {
        console.log(`  ${index + 1}. OrderID: ${order.OrderID}, Price: $${order.Price}, Created: ${order.CreatedAt}`);
      });
    } else {
      console.log('❌ No orders found in database');
    }

    // Test payment creation with valid ObjectIds
    console.log('\n3. Testing payment creation with order generation...');
    
    // First, let's get some actual ClothCustomizer items to use as valid references
    try {
      const clothItems = await axios.get(`${BASE_URL}/cloth-customizer`);
      console.log('📦 Found cloth customizer items:', clothItems.data.data?.length || 0);
      
      if (clothItems.data.data && clothItems.data.data.length > 0) {
        const validItem = clothItems.data.data[0];
        console.log('Using valid item for test:', {
          id: validItem._id,
          clothingType: validItem.clothingType,
          totalPrice: validItem.totalPrice
        });

        const testPaymentData = {
          deliveryDetails: {
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
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
              cardName: "Test User",
              saveCard: false
            }
          },
          orderDetails: {
            subtotal: validItem.totalPrice,
            tax: validItem.totalPrice * 0.08,
            giftWrap: false,
            giftWrapFee: 0,
            total: validItem.totalPrice * 1.08,
            cartItems: [{
              id: validItem._id,
              name: `Custom ${validItem.clothingType}`,
              price: validItem.totalPrice,
              quantity: validItem.quantity || 1,
              size: validItem.size,
              color: validItem.color,
              clothingType: validItem.clothingType,
              totalPrice: validItem.totalPrice
            }]
          },
          giftMessage: "",
          userId: validItem.userId // Use the same user who created the item
        };

        console.log('\n4. Creating payment with valid cart item...');
        const paymentResponse = await axios.post(`${BASE_URL}/payment`, testPaymentData);
        
        if (paymentResponse.data.status === 'ok') {
          console.log('✅ Payment created successfully!');
          console.log('Payment ID:', paymentResponse.data.data.paymentId);
          console.log('Orders created:', paymentResponse.data.data.totalOrders);
          
          if (paymentResponse.data.data.orders) {
            paymentResponse.data.data.orders.forEach((order, index) => {
              console.log(`  Order ${index + 1}: ${order.orderId} - ${order.itemName}`);
            });
          }
        } else {
          console.log('❌ Payment creation failed:', paymentResponse.data.message);
        }

        // Check orders again
        console.log('\n5. Checking orders after payment...');
        const ordersAfter = await axios.get(`${BASE_URL}/debug/orders`);
        console.log('📊 Orders in database now:', ordersAfter.data.count);
        
      } else {
        console.log('❌ No cloth customizer items found. Please create some items first.');
      }
      
    } catch (clothError) {
      console.log('⚠️ Could not fetch cloth customizer items:', clothError.message);
      console.log('This might be why orders are not being created - no valid items to reference.');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the debug
debugOrders();
