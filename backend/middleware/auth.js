const jwt = require('jsonwebtoken');
const user = require('../models/User');

const protect = async (req, res, next) => {
    try{
        let token;

        //check token exists or not
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }
        if(!token){
            return res.status(401).json({status: "error", message: "Not authorized to access this resource"});

        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await user.findById(decoded.id);

        if(!currentUser){
            return res.status(401).json({status: "error", message: "User not found"});
        }
        res.user = currentUser;
        next();

    }catch(err){
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token or token expired.'
        });
    }
}

module.exports = { protect };
