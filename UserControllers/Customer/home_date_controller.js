const express = require("express");
const router = express.Router();
const User = require("../../Models/User");
const Banner = require("../../Models/Banner");
const Category = require("../../Models/Category");
const Product = require("../../Models/Product");


// Function to calculate distance
// function calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371; // Radius of Earth in km
//     const dLat = (lat2 - lat1) * (Math.PI / 180);
//     const dLon = (lon2 - lon1) * (Math.PI / 180);
//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
//         Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
// }

// Home API
const homeAPI = async (req, res) => {
    try {
        const uid = req.user?.id || 0;

        if (!uid ) {
            return res.status(400).json({
                ResponseCode: "401",
                Result: "false",
                ResponseMsg: "Something Went Wrong!"
            });
        }

        const userlist = await User.findOne({
            attributes: ["name"],
            where: {
                id: uid, 
                status: 1,
              },
        });


if (!userlist ) {
            return res.status(400).json({
                ResponseCode: "402",
                Result: "false",
                ResponseMsg: "User Not found!"
            });
        }


        
        const banners = await Banner.findAll({ where: { status: 1 } });
        const categories = await Category.findAll({ where: { status: 1 } });

        const products = await Product.findAll({where: { status: 1 } });
       

       

        return res.json({
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "Home Data Get Successfully!",
            HomeData: {
                User:userlist,
                Banlist: banners,
                Catlist: categories,
                Product: products,
                currency: "INR",
                
            }
        });
    } catch (error) {
        console.error("Error fetching home data:", error);
        return res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Internal Server Error"
        });
    }
}

module.exports = {homeAPI};
