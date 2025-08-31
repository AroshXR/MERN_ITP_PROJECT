const User = require("../models/User");

//Data display
const getAllUsers = async (request, response, next) => {
    let users;  

    try{
        users = await User.find();
    }catch(err){
        console.log(err);
    }
    //not found
    if(!users){
        return response.status(404).json({message:"User not found"});
    }
    //display all users
    return response.status(200).json({users});
};  

//Data insert
const addUsers = async(request, response, next) => {
    const {name, age, address} = request.body;

    let users;

    try{
        users = new User({name, age, address});
        await users.save();
    }catch(err){
        console.log(err);
    }
    if(!users){
        return response.status(404).send({message:"Unable to add user"});
    }
    return response.status(200).send({users});
};

//get by id
const  getById = async (request, response, next) => {
    const id = request.params.id;

    // Validate that id is a valid ObjectId
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
        return response.status(400).json({
            status: "error",
            message: "Invalid user ID format"
        });
    }

    let user;

    try{
        user = await User.findById(id);
    }catch(err){
        console.log(err);
        return response.status(500).json({
            status: "error",
            message: "Error finding user",
            error: err.message
        });
    }
    if(!user){
        return response.status(404).json({
            status: "error",
            message:"User not found"
        });
    }
    return response.status(200).json({
        status: "ok",
        user
    });
}

//update user details
const updateUser = async (request, response, next) => {
    const id = request.params.id;
    const {name, age, address} = request.body;

    // Validate that id is a valid ObjectId
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
        return response.status(400).json({
            status: "error",
            message: "Invalid user ID format"
        });
    }

    let user;

    try{
        user = await User.findByIdAndUpdate(id, {name : name , age : age , address : address});
        user = await user.save();
    }catch(err){
        console.log(err);
        return response.status(500).json({
            status: "error",
            message: "Error updating user",
            error: err.message
        });
    }
    if(!user){
        return response.status(404).json({
            status: "error",
            message:"Unable to update user"
        });
    }
    return response.status(200).json({
        status: "ok",
        user
    });
};

//delete users
const deleteUser = async (request, response, next) => {
    const id = request.params.id;

    // Validate that id is a valid ObjectId
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
        return response.status(400).json({
            status: "error",
            message: "Invalid user ID format"
        });
    }

    let user;

    try{
        user = await User.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
        return response.status(500).json({
            status: "error",
            message: "Error deleting user",
            error: err.message
        });
    }
    if(!user){
        return response.status(404).json({
            status: "error",
            message:"User not found"
        });
    }
    return response.status(200).json({
        status: "ok",
        message:"User deleted successfully"
    });
}

exports.getAllUsers = getAllUsers; 
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;