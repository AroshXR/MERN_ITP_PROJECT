const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/UserRoutes")

const app = express();

const cors = require("cors");

//middleware
app.use(express.json());
app.use(cors()); //to parse JSON data
app.use("/users", router);


mongoose.connect("mongodb+srv://admin:yNU4tDi4h09jUzol@studentmanagementsystem.ckxgh7y.mongodb.net/")
.then(() => console.log("Connected to mongodb"))
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log(err));

//call register model
require("./models/Register");
const User = mongoose.model("Register");
app.post("/register", async (req, res) => {
    const { name, address, email, password } = req.body;
    try {
        await User.create({
            name,
            address,
            email,
            password
        });
        res.send({status: "ok", message: "User registered successfully"});
    } catch (error) {
        res.status(500).send({status: "error", message: "Error registering user"});
    }
});