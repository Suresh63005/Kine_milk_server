const Rider = require('../../Models/Rider');
const asyncHandler = require('../../middlewares/errorHandler');
const uploadToS3 = require("../../config/fileUpload.aws");
const logger = require("../../utils/logger");
const { Op } = require('sequelize');

const AddRider = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);
  
    const uid = req.user.userId;
    if (!uid) {
      return res.status(400).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "User ID not provided",
      });
    }
  
    console.log("Fetching products for user ID:", uid);
    console.log(req.body, "************************** BODY CHECK");

    const { store_id, title, email, mobile, password, ccode, status,rdate } = req.body;

    if (!store_id || !title || !email || !mobile || !password || !ccode || !status || !rdate) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        let imageUrl = null;
        if (req.file) {
            console.log("File detected:", req.file);
            imageUrl = await uploadToS3(req.file, "rider-images");
        }

        const newRider = await Rider.create({
            store_id,
            title,
            email,
            mobile,
            password,
            ccode,
            status,
            img: imageUrl,
            rdate: new Date(),
        });

        res.status(201).json({ success: true, message: "Rider added successfully", rider: newRider });
    } catch (error) {
        console.error("Error adding rider:", error);
        res.status(500).json({ success: false, message: "Error adding rider", error: error.message });
    }
});


const EditRider = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);
  
    const uid = req.user.userId;
    if (!uid) {
      return res.status(400).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "User ID not provided",
      });
    }
  
    console.log("Fetching products for user ID:", uid);
    const { riderId } = req.params;
    let { store_id, title, email, mobile, password, ccode, status, rdate } = req.body;

    console.log(req.body, "************ BODY CHECK ************");

    try {
        const rider = await Rider.findByPk(riderId);
        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider not found" });
        }

        let imageUrl = rider.img;
        if (req.file) {
            imageUrl = await uploadToS3(req.file, "rider-images");
        }

        // Ensure store_id is updated correctly
        store_id = store_id || rider.store_id;

        await rider.update({
            store_id,
            title,
            email,
            mobile,
            password,
            ccode,
            status,
            img: imageUrl,
            rdate
        });

        res.status(200).json({ success: true, message: "Rider updated successfully", rider });
    } catch (error) {
        console.error("Error updating rider:", error);
        res.status(500).json({ success: false, message: "Error updating rider", error: error.message });
    }
});

const GetStoreRiders = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);
  
    const uid = req.user.userId;
    if (!uid) {
      return res.status(400).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "User ID not provided",
      });
    }
  
    console.log("Fetching products for user ID:", uid);
    try {
        const { storeId } = req.params;
        if (!storeId) {
            return res.status(400).json({ success: false, message: "Store ID is required" });
        }
        const riders = await Rider.findAll({
            where: { store_id: storeId },
        });
        res.status(200).json({ success: true, riders });
    } catch (error) {
        console.error("Error fetching store riders:", error);
        res.status(500).json({ success: false, message: "Error fetching store riders", error: error.message });
    }
});

const SearchRiderByTitle = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);
  
    const uid = req.user.userId;
    if (!uid) {
      return res.status(400).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "User ID not provided",
      });
    }
  
    console.log("Fetching products for user ID:", uid);
    const { title } = req.body;
  
    if (!title) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "rider name is required",
      });
    }
  
    try {
      const riders = await Rider.findAll({
        where: {
          title: {
            [Op.like]: `%${title}%`,
          },
        },
      });
  
      if (riders.length === 0) {
        return res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "No matching rider found",
        });
      }
  
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Rider fetched successfully",
        Data: riders,
      });
  
    } catch (error) {
      console.error("Error searching for rider:", error);
      return res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Internal Server Error",
        Error: error.message,
      });
    }
  });



module.exports = { AddRider, EditRider,GetStoreRiders,SearchRiderByTitle };
