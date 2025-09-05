const mongoose = require('mongoose');
const InventoryItem = require('./models/InventoryItem');

// Sample inventory data
const sampleItems = [
    {
        name: "Classic Cotton T-Shirt",
        description: "A comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a modern fit.",
        price: 29.99,
        category: "T-Shirts",
        size: ["S", "M", "L", "XL", "XXL"],
        color: ["White", "Black", "Navy", "Gray"],
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        brand: "Klassy Shirts",
        material: "100% Organic Cotton",
        isActive: true
    },
    {
        name: "Premium Hoodie",
        description: "A warm and cozy hoodie made from premium materials. Perfect for cold weather with a comfortable fit and stylish design.",
        price: 59.99,
        category: "Hoodies",
        size: ["S", "M", "L", "XL", "XXL"],
        color: ["Black", "Gray", "Navy", "Red"],
        stock: 30,
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
        brand: "Klassy Shirts",
        material: "Cotton Blend",
        isActive: true
    },
    {
        name: "Slim Fit Jeans",
        description: "Modern slim fit jeans with stretch comfort. Perfect for both casual and semi-formal occasions.",
        price: 79.99,
        category: "Pants",
        size: ["30", "32", "34", "36", "38"],
        color: ["Blue", "Black", "Gray"],
        stock: 25,
        imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
        brand: "Klassy Shirts",
        material: "Denim with Stretch",
        isActive: true
    },
    {
        name: "Casual Sneakers",
        description: "Comfortable and stylish sneakers perfect for everyday wear. Lightweight design with excellent cushioning.",
        price: 89.99,
        category: "Shoes",
        size: ["7", "8", "9", "10", "11", "12"],
        color: ["White", "Black", "Gray"],
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
        brand: "Klassy Shirts",
        material: "Canvas and Rubber",
        isActive: true
    },
    {
        name: "Summer Dress",
        description: "A beautiful summer dress perfect for warm weather. Light and flowy design with a flattering fit.",
        price: 69.99,
        category: "Dresses",
        size: ["XS", "S", "M", "L", "XL"],
        color: ["Blue", "Pink", "White", "Yellow"],
        stock: 20,
        imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500",
        brand: "Klassy Shirts",
        material: "Cotton Blend",
        isActive: true
    },
    {
        name: "Leather Jacket",
        description: "A classic leather jacket with modern styling. Durable and stylish, perfect for adding edge to any outfit.",
        price: 199.99,
        category: "Jackets",
        size: ["S", "M", "L", "XL"],
        color: ["Black", "Brown"],
        stock: 15,
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
        brand: "Klassy Shirts",
        material: "Genuine Leather",
        isActive: true
    },
    {
        name: "Designer Watch",
        description: "An elegant designer watch with premium craftsmanship. Perfect for both casual and formal occasions.",
        price: 149.99,
        category: "Accessories",
        size: ["One Size"],
        color: ["Silver", "Gold", "Black"],
        stock: 35,
        imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500",
        brand: "Klassy Shirts",
        material: "Stainless Steel",
        isActive: true
    },
    {
        name: "Polo Shirt",
        description: "A classic polo shirt with a modern twist. Perfect for business casual or smart casual occasions.",
        price: 39.99,
        category: "T-Shirts",
        size: ["S", "M", "L", "XL", "XXL"],
        color: ["White", "Blue", "Red", "Green"],
        stock: 45,
        imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500",
        brand: "Klassy Shirts",
        material: "Pique Cotton",
        isActive: true
    }
];

// Connect to MongoDB
mongoose.connect("mongodb+srv://chearoavitharipasi:8HTrHAF28N1VTvAK@klassydb.vfbvnvq.mongodb.net/")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("MongoDB connection error:", err));

// Seed the database
async function seedDatabase() {
    try {
        // Clear existing inventory items
        await InventoryItem.deleteMany({});
        console.log("Cleared existing inventory items");

        // Insert sample items
        const insertedItems = await InventoryItem.insertMany(sampleItems);
        console.log(`Successfully inserted ${insertedItems.length} inventory items`);

        // Display inserted items
        insertedItems.forEach(item => {
            console.log(`- ${item.name} (${item.category}) - $${item.price}`);
        });

        console.log("Database seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

// Run the seeding function
seedDatabase();
