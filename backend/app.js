const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/UserRoutes")
const applicantRouter = require("./routes/ApplicantRoutes")
const clothCustomizerRouter = require("./routes/ClothCustomizerRoutes")
const uploadRouter = require("./routes/UploadRoutes")
const path = require("path");

const app = express();

const cors = require("cors");

const bcrypt = require("bcryptjs");

const createToken = require('./utils/jwt');


//middleware
app.use(express.json());
app.use(cors()); //to parse JSON
app.use("/users", userRouter);
app.use("/applicants", applicantRouter);
app.use("/cloth-customizer", clothCustomizerRouter);
app.use("/upload", uploadRouter);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test endpoint to verify server is running
app.get("/test", (req, res) => {
    res.json({ status: "ok", message: "Backend server is running", timestamp: new Date().toISOString() });
});

// Test endpoint to verify cart operations
app.get("/test-cart", async (req, res) => {
    try {
        const ClothCustomizer = mongoose.model("ClothCustomizer");
        const count = await ClothCustomizer.countDocuments();
        const sampleItem = await ClothCustomizer.findOne();
        
        res.json({ 
            status: "ok", 
            message: "Cart test endpoint", 
            totalItems: count,
            sampleItem: sampleItem ? {
                id: sampleItem._id,
                clothingType: sampleItem.clothingType,
                quantity: sampleItem.quantity,
                totalPrice: sampleItem.totalPrice
            } : null,
            timestamp: new Date().toISOString() 
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error", 
            message: "Error testing cart", 
            error: error.message 
        });
    }
});

mongoose.connect("mongodb+srv://chearoavitharipasi:8HTrHAF28N1VTvAK@klassydb.vfbvnvq.mongodb.net/")
.then(() => console.log("Connected to mongodb"))
.then(() => {
    app.listen(5001);
})
.catch((err) => console.log(err));

//call user model
require("./models/User");
require("./models/ClothCustomizerModel");
require("./models/ApplicantModel");
const User = mongoose.model("User");

// Global error handler for ObjectId casting errors and other validation issues
app.use((error, req, res, next) => {
    console.error('Global error handler caught:', error);
    
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({
            status: "error",
            message: "Invalid ID format provided",
            details: "The ID must be a valid MongoDB ObjectId"
        });
    }
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            status: "error",
            message: "Validation error",
            details: error.message
        });
    }
    
    // Default error response
    res.status(500).json({
        status: "error",
        message: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});


app.post("/register", async (req, res) => {
    const { username, address, email, password, type } = req.body;
    
    console.log('Registration request received:', { username, address, email, type, passwordLength: password?.length });
    
    try {
        // Validate required fields
        if (!username || !address || !email || !password || !type) {
            console.log('Missing required fields:', { username: !!username, address: !!address, email: !!email, password: !!password, type: !!type });
            return res.status(400).json({
                status: "error", 
                message: "All fields are required"
            });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            console.log('Username already exists:', username);
            return res.status(400).json({
                status: "error", 
                message: "Username already exists"
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            console.log('Email already exists:', email);
            return res.status(400).json({
                status: "error", 
                message: "Email already exists"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        // Create the user
        const newUser = await User.create({
            username,
            address,
            email,
            password: hashedPassword,
            type
        });
        console.log('User created successfully:', newUser._id);


        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            address: newUser.address,
            type: newUser.type
        };

        res.status(201).json({
            status: "ok", 
            message: "User registered successfully",
            data: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: "error", 
            message: "Error registering user. Please try again."
        });
    }
});


app.post("/login", async (req, res) => {
    const { username, password, type } = req.body;
    
    console.log('Login request received:', { username, type, passwordLength: password?.length });
    
    try {
        // Find user by username first
        const user = await User.findOne({username});
        if(!user){
            console.log('User not found:', username);
            return res.json({status: "error", message: "User not found"});
        }

        console.log('User found:', { username: user.username, type: user.type, storedType: type });

        // Check if user type matches (optional validation)
        if (type && user.type !== type) {
            console.log('Type mismatch:', { userType: user.type, requestedType: type });
            return res.json({status: "error", message: "Invalid user type"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);
        
        if(isMatch){
            const token = createToken(user._id);
            console.log('Login successful, token generated for user:', user.username);
            return res.json({
                status: "ok", 
                message: "Login successful", 
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    address: user.address,
                    type: user.type
                }
            });
        }else{
            console.log('Invalid password for user:', username);
            return res.json({status: "error", message: "Invalid password"});
        }

    }catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({status: "error", message: "Internal server error"});
    }
});