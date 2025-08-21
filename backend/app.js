const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/UserRoutes")
const Design = require("./models/DesignModel");

const app = express();

const cors = require("cors");

//middleware
app.use(express.json());
app.use(cors()); //to parse JSON data
app.use("/users", router);


mongoose.connect("mongodb+srv://chearoavitharipasi:5qtqR9uSTsl8dPcS@itp-project-db.7afiybi.mongodb.net/")
.then(() => console.log("Connected to mongodb"))
.then(() => {
    app.listen(5000);   
})
.catch((err) => console.log(err));

//call register model
require("./models/Register");
const User = mongoose.model("Register");
app.post("/register", async (req, res) => {
    const { username, address, email, password } = req.body;
    try {
        await User.create({
            username,
            address,
            email,
            password
        });
        res.send({status: "ok", message: "User registered successfully"});
    } catch (error) {
        res.status(500).send({status: "error", message: "Error registering user"});
    }
});

//login

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try{
        const user = await User.findOne({username});
        if(!user){
            return res.json({status: "error", message: "User not found"});
        }
        if(user.password === password){
            return res.json({status: "ok", message: "Login successful"});
        }else{
            return res.json({status: "error", message: "Invalid password"});
        }
    }catch (error) {
        return res.status(500).json({status: "error", message: "Internal server error"});
    }
});

app.post('/', async (req, res) => {
  try {
    const {
      clothingType,
      color,
      presetDesign,
      customDesign,
      tshirtSize,
      sizePrice,
      designSize,
      designPosition,
      quantity,
      totalPrice,
      placedDesigns
    } = req.body;

    const newDesign = new Design({
      userId: req.user.id,
      clothingType,
      color,
      presetDesign,
      customDesign,
      tshirtSize,
      sizePrice,
      designSize,
      designPosition,
      quantity,
      totalPrice,
      placedDesigns
    });

    const design = await newDesign.save();
    res.json(design);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all designs for a user
app.get('/', async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(designs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a single design
app.get('/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    
    if (!design) {
      return res.status(404).json({ msg: 'Design not found' });
    }
    
    // Check if user owns the design
    if (design.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(design);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Design not found' });
    }
    res.status(500).send('Server Error');
  }
});