const jwt = require("jsonwebtoken");
const Store = require("../Models/Store");
const User = require("../Models/User");

// const isAuthenticated = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//         return res.status(401).json({ message: "Unauthorized: No token provided" });
//     }
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log(decoded,"decodeddddddddddddddddddddddd")
//         req.user = decoded;
//         next();

//     } catch (error) {
//         return res.status(401).json({ message: "Unauthorized: Invalid token" });
//     }
// };

const isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        if (!decoded.userId && !decoded.storeId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
        }

        let user = null;

        // First check in Store table if storeId exists
        if (decoded.storeId) {
            user = await Store.findByPk(decoded.storeId);
        }

        // If storeId is not found, check in User table
        if (!user && decoded.userId) {
            console.log("Store not found in Store table. Checking User table...");
            user = await User.findByPk(decoded.userId);
        }

        if (!user) {
            console.error("User not found in both tables. ID:", decoded.userId || decoded.storeId);
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        // Add userId to req.user for consistency
        req.user = {
            ...user.toJSON(),
            userId: decoded.userId || user.id, // Use decoded.userId or fall back to user.id
        };

        console.log("User Authenticated:", req.user);
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
  
module.exports = { isAuthenticated };
