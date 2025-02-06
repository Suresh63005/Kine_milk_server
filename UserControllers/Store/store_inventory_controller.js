const Product = require("../../Models/Product");
const { Op } = require("sequelize");
const asyncHandler = require("../../middlewares/errorHandler");
const logger = require("../../utils/logger");
const uploadToS3 = require("../../config/fileUpload.aws");
const Store = require("../../Models/Store");

const ListInventory = asyncHandler(async(req,res)=>{
    console.log("Decoded User:", req.user);

    const uid = req.user.userId;
    if (!uid) {
        return res.status(400).json({
            ResponseCode: "401",
            Result: "false",
            ResponseMsg: "User  ID not provided",
        });
    }

    console.log("Fetching orders for user ID:", uid);
    const {storeId}=req.params;
    if(!storeId){
        res.status(401).json({message:"Store ID is required."})
    }
    try {
        const products = await Product.findAll({where:{store_id:storeId}});
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found for this store!" });
        }
        return res.status(200).json({message:"Store Products Fetched Successfully.",products})
    } catch (error) {
        console.error("Error Fetching store products", error);
        return res.status(500).json({ message: "Internal server error", error })
    }
});

const ViewProductInventoryById = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);

    const uid = req.user.userId;
    if (!uid) {
        return res.status(400).json({
            ResponseCode: "401",
            Result: "false",
            ResponseMsg: "User ID not provided",
        });
    }

    console.log("Fetching orders for user ID:", uid);

    const { productId } = req.params;
    if (!productId) {
        return res.status(401).json({ message: "Store ID is required" });
    }

    try {
        const product = await Product.findOne({
            where: { id: productId },
            attributes: ["id", "title", "date", "quantity", "normal_price", "mrp_price"],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        return res.status(200).json({
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "Product retrieved successfully.",
            product,
        });

    } catch (error) {
        console.error("Error fetching product inventory:", error);
        return res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Internal Server Error",
        });
    }
});


const AddInventory = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);

    const uid = req.user.userId;
    if (!uid) {
        return res.status(400).json({
            ResponseCode: "401",
            Result: "false",
            ResponseMsg: "User ID not provided",
        });
    }

    console.log("Fetching orders for user ID:", uid);

    const { storeId } = req.params;
    const { productId, date, quantity, normal_price, mrp_price } = req.body;

    // Check if all fields are provided
    if (!productId || !date || !quantity || !normal_price || !mrp_price) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Find the product in the store
        const product = await Product.findOne({
            where: {
                id: productId,
                store_id: storeId,
            },
            attributes: ["id", "title", "date", "quantity", "normal_price", "mrp_price"],
        });

        if (!product) {
            return res.status(404).json({
                ResponseCode: "402",
                Result: "false",
                message: "Product not found in the store.",
            });
        }

        // Update only the specified fields (excluding title)
        await product.update({ date, quantity, normal_price, mrp_price });

        console.log("Inventory updated successfully:", product);

        return res.status(201).json({
            ResponseCode: "201",
            Result: "true",
            message: "Product updated successfully.",
            product: {
                productId: product.id,
                title: product.title, // Fetching title in the response
                date: product.date,
                quantity: product.quantity,
                unit_price: product.normal_price,
                total_price: product.mrp_price,
            },
        });

    } catch (error) {
        console.error("Error updating store products:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
});


module.exports = {ListInventory,AddInventory,ViewProductInventoryById}