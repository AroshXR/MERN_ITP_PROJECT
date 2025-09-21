require("dotenv").config();


const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

// Import routes
const userRouter = require("./routes/UserRoutes");
const applicantRouter = require("./routes/ApplicantRoutes");
const jobRouter = require("./routes/JobRoutes");
const supplierRouter = require("./routes/SupplierRoutes");
const clothCustomizerRouter = require("./routes/ClothCustomizerRoutes");
const uploadRouter = require("./routes/UploadRoutes");
const paymentRouter = require("./routes/PaymentRoutes");

// Import utilities
const createToken = require('./utils/jwt');

// Create Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://chearoavitharipasi:8HTrHAF28N1VTvAK@klassydb.vfbvnvq.mongodb.net/";
//implemented .env code ready t use
//const PORT = process.env.PORT || 5001;
//const MONGODB_URI = process.env.MONGODB_URI;

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

// Test endpoint to verify server is running
app.get("/test", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "Backend server is running", 
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
    const User = mongoose.model("User");
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
    
    const newUser = await User.create({
      username,
      address,
      email,
      password: hashedPassword,
      type
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
    const User = mongoose.model("User");
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
          type: user.type
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

// Database connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    
    // Load models after connection
    require("./models/User");
    require("./models/ApplicantModel");
    require("./models/JobModel");
    require("./models/SupplierModel");
    require("./models/SupplierOrderModel");
    require("./models/ClothCustomizerModel");
<<<<<<< HEAD
    require("./models/PaymentDetailsModel");
=======
    require("./models/OrderModel");
>>>>>>> a846196cb5856b28beb94055f09295f8e61d08ff
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

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