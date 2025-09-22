import User from "../models/User.js";

//API to change Role of the User
export const changeRoleToOwner = async (req, res)=>{
    try {
        const {_id} = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner"})
        res.json({success:true, message: "Now You can List Outfits"})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message: error.message})
        
    }
}

//API to List Outfit
