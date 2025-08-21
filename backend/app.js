const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/UserRoutes")

const app = express();

const cors = require("cors");

//middleware
app.use(express.json());
app.use(cors()); //to parse JSON data
app.use("/users", router);


mongoose.connect("mongodb+srv://chearoavitharipasi:bluhbluhbluh123@itp-project-db.7afiybi.mongodb.net/")
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