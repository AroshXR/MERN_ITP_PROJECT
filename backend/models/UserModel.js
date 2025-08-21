const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type : String,//datatype
        required : true,//validate
    },
    age:{
        type : Number,
        required : true,
    },
    address:{
        type : String,
        required : true,
    }
});

module.exports = mongoose.model(
    "UserModel", //file name
    userSchema //function name    
)