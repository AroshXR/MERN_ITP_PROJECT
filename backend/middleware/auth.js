const jwt = require('jsonwebtoken');
const user = require('../models/User');

const protect = async (req, res, next) => {
    try{
        let token;
        console.log('Auth middleware - checking request headers');

        //check token exists or not
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
            console.log('Token found in headers');
        } else {
            console.log('No authorization header or invalid format');
        }
        
        if(!token){
            console.log('No token provided');
            return res.status(401).json({status: "error", message: "Not authorized to access this resource"});
        }

        console.log('Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wjfubaukfhgaehoeaughealgaee564a64ga4g43tgea4dgg68424t6agd6ag46a5e5');
        console.log('Token decoded successfully, user ID:', decoded.id);

        const currentUser = await user.findById(decoded.id);
        console.log('User found:', currentUser ? currentUser.username : 'not found');

        if(!currentUser){
            console.log('User not found in database');
            return res.status(401).json({status: "error", message: "User not found"});
        }
        
        req.user = currentUser;
        console.log('User attached to request:', req.user.username);
        next();

    }catch(err){
        console.error('Auth middleware error:', err);
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token or token expired.'
        });
    }
}

module.exports = { protect };
