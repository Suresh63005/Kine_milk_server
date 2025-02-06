const Category = require("../../Models/Category");
const asyncHandler = require("../../middlewares/errorHandler");
const { Op } = require("sequelize");
const Store = require("../../Models/Store");
const firebaseAdmin = require("../../config/firebase-config");
const uploadToS3 = require("../../config/fileUpload.aws");

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
    const { mobile, email, title } = req.body;

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

        console.log("Incoming Data:", { mobile, email, title, rimg: imageUrl });

        // Update store details
        store.mobile = mobile || store.mobile;
        store.email = email || store.email;
        store.title = title || store.title;
        store.rimg = imageUrl;

        await store.save();
        console.log("Updated Store Data:", store);

        // **Fix: Always Update Firebase User Profile**
        if (mobile) {
            try {
                await firebaseAdmin.auth().updateUser(uid, { phoneNumber: `+${mobile}` });
                console.log("✅ Mobile number updated in Firebase Authentication");
            } catch (firebaseError) {
                console.error("❌ Error updating Firebase Authentication:", firebaseError.message);
                return res.status(500).json({
                    success: false,
                    message: "Error updating Firebase Authentication",
                    error: firebaseError.message,
                });
            }
        }

        // **Update Firestore with the latest mobile number**
        try {
            const storeRef = firebaseAdmin.firestore().collection("stores").doc(storeId);
            await storeRef.update({ mobile });
            console.log("✅ Mobile number updated in Firestore");
        } catch (firestoreError) {
            console.error("❌ Error updating Firestore:", firestoreError.message);
        }

        return res.status(200).json({
            success: true,
            message: "Store user details updated successfully",
            store,
        });

    } catch (error) {
        console.error("❌ Error updating store user:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating store user",
            error: error.message,
        });
    }
});


  

module.exports = { StoreProfile, EditStoreProfile };
