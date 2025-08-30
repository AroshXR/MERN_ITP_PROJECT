const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type : String,//datatype
        required : true,//validate
    },
    address:{
        type : String,
        required : true,
    },
    email:{
        type : String,
        required : true,
    },
    password:{
        type : String,
        required : true,
    },
    type:{
        type: String,
        required: true,
    }
});

module.exports = mongoose.model(
    "User", //file name
    userSchema //function name
)