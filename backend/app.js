const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const dns = require("dns");
const path = require("path");

// Universal DNS resolver for MongoDB Atlas - works on any OS/network
const setupUniversalDNS = () => {
  // Set reliable public DNS servers
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
    if (typeof dns.setDefaultResultOrder === 'function') {
      dns.setDefaultResultOrder('ipv4first');
    }
  } catch (e) {
    console.warn('Could not set DNS servers:', e.message);
  }

  // Fallback DNS resolution for MongoDB Atlas hosts
  const originalLookup = dns.lookup;
  dns.lookup = function(hostname, options, callback) {
    // Handle callback-style calls
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    // MongoDB Atlas hostname mappings (auto-resolved via Google DNS)
    const atlasHosts = {
      'klassydb.vfbvnvq.mongodb.net': '159.41.181.5',
      'ac-xyhezak-shard-00-00.vfbvnvq.mongodb.net': '159.41.181.5',
      'ac-xyhezak-shard-00-01.vfbvnvq.mongodb.net': '159.41.181.36',
      'ac-xyhezak-shard-00-02.vfbvnvq.mongodb.net': '159.41.181.26'
    };
    
    // Use fallback if hostname is in our Atlas mapping
    if (atlasHosts[hostname]) {
      return callback(null, atlasHosts[hostname], 4);
    }
    
    // Try original DNS lookup first
    return originalLookup.call(this, hostname, options, (err, address, family) => {
      if (err && atlasHosts[hostname]) {
        // Fallback to our mapping if DNS fails
        return callback(null, atlasHosts[hostname], 4);
      }
      callback(err, address, family);
    });
  };
};

// Initialize universal DNS
setupUniversalDNS();

const User = require("./models/User");

// Import routes
const userRouter = require("./routes/UserRoutes");
const applicantRouter = require("./routes/ApplicantRoutes");
const jobRouter = require("./routes/JobRoutes");
const supplierRouter = require("./routes/SupplierRoutes");
const clothCustomizerRouter = require("./routes/ClothCustomizerRoutes");
const uploadRouter = require("./routes/UploadRoutes");
const paymentRouter = require("./routes/PaymentRoutes");
const inventoryRouter = require("./routes/InventoryRoutes");

const clothingRouter = require("./routes/ClothingRoutes");
const analyticsRouter = require("./routes/AnalyticsRoutes");

const orderRouter = require("./routes/OrderRoutes");
const tailorRouter = require("./routes/TailorRoutes");
const customOrderRouter = require("./routes/CustomOrderRoutes");



     //pasindu
     //import oenerRouter from "./routes/ownerRoutes.js"
     const ownerRouter = require("./routes/ownerRoutes");
     const bookingRouter = require("./routes/bookingRoutes");


// Import utilities
const createToken = require('./utils/jwt');

//const { default: ownerRouter } = require("./routes/ownerRoutes");

// Create Express app
const app = express();
const http = require('http');
const { initSocket } = require('./utils/socket');
const server = http.createServer(app);

// Environment variables
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env file");
  console.error("Please create backend/.env with: MONGODB_URI=your_mongodb_connection_string");
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/users", userRouter);
app.use("/applicant", applicantRouter);
app.use("/jobs", jobRouter);
app.use("/supplier", supplierRouter);
app.use("/cloth-customizer", clothCustomizerRouter);
app.use("/upload", uploadRouter);
app.use("/payment", paymentRouter);
app.use("/inventory", inventoryRouter);
app.use("/clothing", clothingRouter);
app.use("/analytics", analyticsRouter);
app.use("/orders", orderRouter);

// Tailor management & Custom Orders (namespaced under /api)
app.use("/api/tailors", tailorRouter);
app.use("/api/custom-orders", customOrderRouter);


    //pasindu                                                         sdsdsdssdsdsdsdsd
    app.use("/api/owner", ownerRouter);
    app.use("/api/booking", bookingRouter);



// Test endpoint to verify server is running
app.get("/test", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "Backend server is running", 
        timestamp: new Date().toISOString() 
    });
});

// Debug endpoint to check orders collection
app.get("/debug/orders", async (req, res) => {
    try {
        const Order = require("./models/OrderModel");
        const orders = await Order.find().limit(10).sort({ CreatedAt: -1 });
        res.json({
            status: "ok",
            message: "Orders from database",
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.json({
            status: "error",
            message: "Error fetching orders: " + error.message
        });
    }
});

// Test email configuration endpoint
app.get("/test-email", async (req, res) => {
    const { testEmailConfiguration } = require('./utils/email');
    const result = await testEmailConfiguration();
    res.json({
        status: result.success ? "ok" : "error",
        message: result.message,
        timestamp: new Date().toISOString()
    });
});

// User registration endpoint
app.post("/register", async (req, res) => {
  try {
    const { username, address, email, password, type } = req.body;
    
    // Basic validation
    if (!username || !email || !password || !type) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required"
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User with this username or email already exists"
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Set role based on type
    let role = 'customer';
    if (type === 'Admin') {
      role = 'admin';
    } else if (type === 'owner') {
      role = 'owner';
    }

    const newUser = await User.create({
      username,
      address,
      email,
      password: hashedPassword,
      type,
      role
    });
    
    res.status(201).json({
      status: "ok",
      message: "User registered successfully",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        type: newUser.type
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Error registering user"
    });
  }
});

// User login endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password, type } = req.body;
    
    // Basic validation
    if (!username || !password || !type) {
      return res.status(400).json({
        status: "error",
        message: "Username, password, and type are required"
      });
    }
    
    // Find user by username and type
    const user = await User.findOne({ username, type });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }
    
    // Generate token
    const token = createToken(user._id);
    
    res.json({
      status: "ok",
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          type: user.type,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});

// Universal MongoDB connection with cross-platform DNS resolution
const connectToMongoDB = async () => {
  console.log("Starting backend server...");
  console.log(`Platform: ${process.platform} | Node: ${process.version}`);
  
  try {
    // Connect with universal settings that work on any OS/network
    await mongoose.connect(MONGODB_URI, {
      // Cross-platform compatibility settings
      family: 4, // Force IPv4 for better compatibility
      serverSelectionTimeoutMS: 30000, // 30s timeout for slow networks
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      // MongoDB best practices
      retryWrites: true,
      w: 'majority',
      // Optional database name override
      dbName: MONGODB_DBNAME,
    });

    console.log("Connected to MongoDB");
    
    // Load all models after successful connection
    require("./models/User");
    require("./models/ApplicantModel");
    require("./models/JobModel");
    require("./models/SupplierModel");
    require("./models/SupplierOrderModel");
    require("./models/ClothCustomizerModel");
    require("./models/PaymentDetailsModel");
    require("./models/OrderModel");
    
    require("./models/Booking");
    require("./models/Outfit");

        //pasindu
    require("./models/MaterialInventoryModel");
    
    console.log("All models loaded successfully");

    // Initialize Socket.IO and start the server
    initSocket(server);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("Ready to accept connections with Socket.IO!");
    });

  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(`   Error: ${error.message}`);
    
    // Provide helpful troubleshooting info
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error("💡 DNS Resolution Issue - Try:");
      console.error("   1. Check your internet connection");
      console.error("   2. Verify MongoDB Atlas IP whitelist includes your IP");
      console.error("   3. Try a different network (mobile hotspot)");
    } else if (error.message.includes('authentication')) {
      console.error("💡 Authentication Issue - Check:");
      console.error("   1. Username and password in MONGODB_URI");
      console.error("   2. Database user permissions in Atlas");
    }
    
    process.exit(1);
  }
};

// Start the connection
connectToMongoDB();

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found"
  });
});

module.exports = app;

