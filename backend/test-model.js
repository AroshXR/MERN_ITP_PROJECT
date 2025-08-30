const mongoose = require("mongoose");
require("./models/ClothCustomizerModel");

// Connect to MongoDB
mongoose.connect("mongodb+srv://chearoavitharipasi:8HTrHAF28N1VTvAK@klassydb.vfbvnvq.mongodb.net/")
.then(async () => {
    console.log("Connected to MongoDB");
    
    try {
        // Get the model
        const ClothCustomizer = mongoose.model("ClothCustomizer");
        
        // Create a test document
        const testCustomizer = new ClothCustomizer({
            color: "Blue",
            size: "M",
            quantity: 1,
            totalPrice: 29.99
        });
        
        // Save the document
        const savedCustomizer = await testCustomizer.save();
        console.log("Test document created successfully:", savedCustomizer);
        
        // Find the document
        const foundCustomizer = await ClothCustomizer.findById(savedCustomizer._id);
        console.log("Document found:", foundCustomizer);
        
        // Clean up - delete the test document
        await ClothCustomizer.findByIdAndDelete(savedCustomizer._id);
        console.log("Test document deleted successfully");
        
        console.log("✅ ClothCustomizer model is working correctly!");
        
    } catch (error) {
        console.error("❌ Error testing model:", error);
    } finally {
        mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
})
.catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
}); 