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
