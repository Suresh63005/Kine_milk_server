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
        

        const banners = await Banner.findAll({ where: { status: 1 } });
        const categories = await Category.findAll({ where: { status: 1 } });

        
        let categoryProducts = {};
        for (const category of categories) {
            const products = await Product.findAll({
                where: { status: 1, category_id: category?.id },
                order: [["createdAt", "DESC"]], 
                limit: 5
            });

            categoryProducts[category?.name] = products; 
        }

        return res.json({
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "Home Data Get Successfully!",
            HomeData: {
                Banlist: banners,
                Catlist: categories,
                CategoryProducts: categoryProducts,
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
};


module.exports = {homeAPI};
