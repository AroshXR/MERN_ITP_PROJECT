const User = require("../models/UserModel");


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

    let user;

    try{
        user = await User.findById(id);
    }catch(err){
        console.log(err);
    }
    if(!user){
        return response.status(404).json({message:"User not found"});
    }
    return response.status(200).json({user});
}

//update user details
const updateUser = async (request, response, next) => {
    const id = request.params.id;
    const {name, age, address} = request.body;

    let user;

    try{
        user = await User.findByIdAndUpdate(id, {name : name , age : age , address : address});
        user = await user.save();
    }catch(err){
        console.log(err);
    }
    if(!user){
        return response.status(404).json({message:"Unable to update user"});
    }
    return response.status(200).json({user});
};

//delete users
const deleteUser = async (request, response, next) => {
    const id = request.params.id;

    let user;

    try{
        user = await User.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
    }
    if(!user){
        return response.status(404).json({message:"Unable to delete user"});
    }
    return response.status(200).json({message:"User deleted successfully"});

}

exports.getAllUsers = getAllUsers; 
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;