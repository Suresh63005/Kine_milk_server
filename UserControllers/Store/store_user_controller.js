const Category = require("../../Models/Category");
const asyncHandler = require("../../middlewares/errorHandler");
const { Op } = require("sequelize");
const Store = require("../../Models/Store");
const uploadToS3 = require("../../config/fileUpload.aws");
const admin = require('../../config/firebase-config');

const StoreProfile = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);

  const uid = req.user.userId;
  if (!uid) {
    return res.status(400).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "User ID not provided",
    });
  }

  console.log("Fetching store details for user ID:", uid);
  try {
    const userDetails = await Store.findOne({
      attributes: ["rimg","mobile", "title", "email"],
   });

    if (!userDetails) {
      return res.status(404).json({
        message: "Store not found.",
      });
    }

    return res.status(200).json({
      message: "Store owner details fetched successfully.",
      userDetails,
    });
  } catch (error) {
    console.error("Error while fetching store owner details:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

const EditStoreProfile = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);

  const uid = req.user?.userId;
  if (!uid) {
      return res.status(400).json({
          ResponseCode: "401",
          Result: "false",
          ResponseMsg: "User ID not provided",
      });
  }

  const { storeId } = req.params;
  const { email, title } = req.body; 

  try {
      const store = await Store.findByPk(storeId);
      if (!store) {
          return res.status(404).json({ success: false, message: "Store not found" });
      }

      console.log("Existing Store Data:", store);

      let imageUrl = store.rimg;
      if (req.file) {
          imageUrl = await uploadToS3(req.file, "store-logos");
      }

      console.log("Incoming Data:", { email, title, rimg: imageUrl });

      store.email = email || store.email;
      store.title = title || store.title;
      store.rimg = imageUrl;

      await store.save();
      console.log("Updated Store Data:", store);

      return res.status(200).json({
          success: true,
          message: "Store user details updated successfully",
          store,
      });

  } catch (error) {
      console.error("Error updating store user:", error);
      return res.status(500).json({
          success: false,
          message: "Error updating store user",
          error: error.message,
      });
  }
});

const verifyMobile = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required!" });
  }

  try {
      const userRecord = await admin.auth().getUserByPhoneNumber(mobile);
      if (!userRecord) {
          return res.status(404).json({ message: "Mobile number not found!" });
      }

      const token = jwt.sign(
          { userId: userRecord.uid, mobile: userRecord.phoneNumber },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
      );

      return res.status(200).json({
          message: "Mobile number verified successfully!",
          mobile: userRecord.phoneNumber,
          token,
      });
  } catch (error) {
      console.error("Error verifying mobile number:", error.message);

      if (error.code === "auth/user-not-found") {
          return res.status(404).json({ message: "Mobile number not found!" });
      }

      return res.status(500).json({ message: "Error verifying mobile number: " + error.message });
  }
});

module.exports = { StoreProfile, EditStoreProfile,verifyMobile };
