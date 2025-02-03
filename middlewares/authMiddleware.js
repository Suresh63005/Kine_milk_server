const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('./errorHandler');

exports.isAuthenticated = asyncHandler(async(req,res,next)=>{
    const token = req.headers.authorization?.split("")[1];
    if(token){
        try {
            const decoded = jwt.verify(token,process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.userId);
            if(!user){
                return res.status(401).json({error:"Unauthorized: User not found!"})
            }
            req.user = user;
            next();
        } catch (error) {
            console.error("Authentication error:", err.message);
            return res.status(401).json({ error: "Unauthorized: Authentication failed" });
        }
    }
})