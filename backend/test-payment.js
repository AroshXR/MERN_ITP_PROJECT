const mongoose = require("mongoose");
require("./models/PaymentDetailsModel");

// Connect to MongoDB
mongoose.connect("mongodb+srv://chearoavitharipasi:8HTrHAF28N1VTvAK@klassydb.vfbvnvq.mongodb.net/")
.then(async () => {
    console.log("Connected to MongoDB");
    
    try {
        // Get the model
        const PaymentDetails = mongoose.model("PaymentDetails");
        
        // Create a test payment document
        const testPayment = new PaymentDetails({
            deliveryDetails: {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phone: "+94771234567",
                address: "123 Main Street",
                city: "Kandy",
                state: "Central",
                zipCode: "20000",
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
                subtotal: 139.97,
                tax: 11.20,
                giftWrap: false,
                giftWrapFee: 0,
                total: 157.16
            },
            giftMessage: "Happy Birthday!",
            status: "pending"
        });
        
        // Save the document
        const savedPayment = await testPayment.save();
        console.log("Test payment document created successfully:", savedPayment._id);
        
        // Find the document
        const foundPayment = await PaymentDetails.findById(savedPayment._id);
        console.log("Document found:", {
            id: foundPayment._id,
            fullName: foundPayment.deliveryDetails.fullName,
            total: foundPayment.orderDetails.total,
            status: foundPayment.status
        });
        
        // Test statistics
        const stats = await PaymentDetails.aggregate([
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalRevenue: { $sum: "$orderDetails.total" },
                    averageOrderValue: { $avg: "$orderDetails.total" }
                }
            }
        ]);
        
        console.log("Payment statistics:", stats[0] || { totalPayments: 0, totalRevenue: 0, averageOrderValue: 0 });
        
        // Clean up - delete the test document
        await PaymentDetails.findByIdAndDelete(savedPayment._id);
        console.log("Test payment document deleted successfully");
        
        console.log("PaymentDetails model is working correctly!");
        
    } catch (error) {
        console.error("Error testing payment model:", error);
    } finally {
        mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
})
.catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
});
