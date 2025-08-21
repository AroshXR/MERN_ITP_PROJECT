const jwt = require("jsonwebtoken");

const createToken = (userId) => {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET || 'wjfubaukfhgaehoeaughealgaee564a64ga4g43tgea4dgg68424t6agd6ag46a55', 
        { expiresIn: '1d' }
    );
};

module.exports = createToken;