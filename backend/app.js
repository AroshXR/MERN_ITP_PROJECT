const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/UserRoutes")

const app = express();

const cors = require("cors");

const bcrypt = require("bcryptjs");

const createToken = require('./utils/jwt');


//middleware
app.use(express.json());
app.use(cors()); //to parse JSON data
app.use("/users", router);


mongoose.connect("mongodb+srv://chearoavitharipasi:8HTrHAF28N1VTvAK@klassydb.vfbvnvq.mongodb.net/")
.then(() => console.log("Connected to mongodb"))
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log(err));

//call user model
require("./models/User");
const User = mongoose.model("User");

app.post("/register", async (req, res) => {
    const { username, address, email, password, type } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            address,
            email,
            password : hashedPassword,
            type
        });
        res.send({status: "ok", message: "User registered successfully"});
    } catch (error) {
        res.status(500).send({status: "error", message: "Error registering user"});
    }
});

//login

app.post("/login", async (req, res) => {
    const { username, password, type } = req.body;
    try{
        const userType = await User.findOne({type});
        if(!userType){
            return res.json({status: "error", message: "User not found"});
        }    

        const user = await User.findOne({username});
        if(!user){
            return res.json({status: "error", message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if(isMatch){
            const token = createToken(user._id);
            return res.json({status: "ok", message: "Login successful", token});
        }else{
            return res.json({status: "error", message: "Invalid password"});
        }

            

    }catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Internal server error"});
    }
});