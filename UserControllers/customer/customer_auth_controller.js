const User = require("../../Models/User");
const asyncHandler = require("../../middlewares/errorHandler");
const {customerFirebase} = require('../../config/firebase-config');
const jwt = require('jsonwebtoken');
const SubscribeOrder = require("../../Models/SubscribeOrder");
const NormalOrder = require("../../Models/NormalOrder");
const Address = require("../../Models/Address");
const Favorite = require("../../Models/Favorite");
const Cart = require("../../Models/Cart");
const uploadToS3 = require("../../config/fileUpload.aws");


const VerifyCustomerMobile = asyncHandler(async (req, res) => {
    let { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ message: "Mobile number is required!" });
    }

    // Ensure mobile number follows E.164 format
    if (!mobile.startsWith("+")) {
        mobile = `+${mobile}`;
    }

    try {
        console.log("Checking mobile number in Firebase:", mobile);
        const userRecord = await customerFirebase.auth().getUserByPhoneNumber(mobile);
        
        if (!userRecord) {
            return res.status(404).json({ message: "Mobile number not found in Firebase." });
        }

        let user = await User.findOne({ where: { mobile } });

        if (!user) {
            user = await User.create({
                mobile,
                email: userRecord.email || null,
                name: userRecord.displayName || null,
                status: 1,
                registartion_date: new Date(),
            });
        }

        const token = jwt.sign(
            { userId: user.id, mobile: user.mobile },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Mobile number verified successfully!",
            user,
            token,
        });

    } catch (error) {
        if (error.code === "auth/user-not-found") {
            return res.status(404).json({ message: "Mobile number not registered in Firebase." });
        }
        console.error("Error verifying mobile:", error.message);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
});

const FetchCustomerDetails = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);

  const uid = req.user.userId;
  if (!uid) {
      return res.status(400).json({
          ResponseCode: "401",
          Result: "false",
          ResponseMsg: "User ID not provided",
      });
  }

  try {
      console.log("Fetching customer details for user ID:", uid);

      const customer = await User.findOne({ where: { id: uid } });

      if (!customer) {
          return res.status(404).json({
              ResponseCode: "404",
              Result: "false",
              ResponseMsg: "Customer not found",
          });
      }

      return res.status(200).json({
          ResponseCode: "200",
          Result: "true",
          ResponseMsg: "Customer details fetched successfully",
          customer,
      });

  } catch (error) {
      console.error("Error fetching customer details:", error.message);
      return res.status(500).json({
          ResponseCode: "500",
          Result: "false",
          ResponseMsg: "Internal server error: " + error.message,
      });
  }
});

const UpdateCustomerDetails = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);

  const uid = req.user.userId;
  if (!uid) {
      return res.status(400).json({
          ResponseCode: "401",
          Result: "false",
          ResponseMsg: "User ID not provided",
      });
  }

  const { name, email } = req.body;
  const file = req.file;

  if (!name && !email) {
      return res.status(400).json({
          ResponseCode: "402",
          Result: "false",
          ResponseMsg: "At least one field (name or email) must be provided for update",
      });
  }

  try {
      console.log(
        `Updating customer (ID: ${uid}) details - Name: ${name}, Email: ${email}, Image: ${
          file ? file.originalname : "None"
        }`
      );

      const customer = await User.findOne({ where: { id: uid } });

      if (!customer) {
          return res.status(404).json({
              ResponseCode: "404",
              Result: "false",
              ResponseMsg: "Customer not found",
          });
      }

      let imageUrl = customer.img;
      if(file){
        imageUrl = await uploadToS3(file, "profile-images")
      }

      await customer.update({
        name: name || customer.name,
        email: email || customer.email,
        img:imageUrl
      });

      return res.status(200).json({
          ResponseCode: "200",
          Result: "true",
          ResponseMsg: "Customer details updated successfully",
          customer,
      });

  } catch (error) {
      console.error("Error updating customer details:", error.message);
      return res.status(500).json({
          ResponseCode: "500",
          Result: "false",
          ResponseMsg: "Internal server error: " + error.message,
      });
  }
});

const deleteCustomer = async (req, res) => {
  const uid = req.user.userId;
  if (!uid) {
    return res.status(400).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "User ID not provided",
    });
  }

  try {
    const customer = await User.findOne({ where: { id: uid } });

    if (!customer) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Customer not found",
      });
    }

    if (customer.img) {
      const urlParts = customer.img.split("/");
      const key = urlParts.slice(3).join("/");

      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: AWS_ACCESS_KEY_ID,
      };
      try {
        const command = new DeleteObjectCommand(deleteParams);
        await s3.send(command);
        console.log(`Deleted image from S3: ${key}`);
      } catch (s3Error) {
        console.error("Error deleting image from S3:", s3Error.message);
      }
    }

    const suborder = await SubscribeOrder.destroy({ where: { uid } });
    const normalOrder = await NormalOrder.destroy({ where: { uid } });
    const address = await Address.destroy({ where: { uid } });
    const fav = await Favorite.destroy({ where: { uid } });
    const cart = await Cart.destroy({ where: { uid } });

    const deletedRows = await User.destroy({ where: { id: uid } });

    if (deletedRows === 0) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Customer not found",
      });
    }

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error.message);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal server error: " + error.message,
    });
  }
};


const updateOneSignalSubscription = async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { one_subscription } = req.body;
  
      // Validate required fields
      if (!one_subscription) {
        return res.status(400).json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "OneSignal subscription is required",
        });
      }
  
      // Fetch user by ID
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).json({
            ResponseCode: "404",
            Result: "false",
            ResponseMsg: "User not found",
          
        });
      }
  
      await user.update({ one_subscription });
  
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "OneSignal subscription updated successfully",
        
       
      });
    } catch (error) {
      console.error("Error updating OneSignal subscription:", error);
      return res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Internal server error: " + error.message,
    
        
      });
    }
  };

  const removeOneSignalId = async (req, res) => {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "Unauthorized",
        });
    }
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
            ResponseCode: "404",
            Result: "false",
            ResponseMsg: "User not found",
        })

        
      }
      if (!user.one_subscription) {
        return res.status(200).json({
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "OneSignal subscription is already removed",
            })
        
      }
      await user.update({ one_subscription: null });
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "OneSignal subscription removed successfully",
      })
     
    } catch (error) {
      console.error("Error removing OneSignal ID:", error);
      return res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Internal server error: " + error.message,
        }); 
    }
  };

module.exports = { 
    VerifyCustomerMobile,FetchCustomerDetails,UpdateCustomerDetails,deleteCustomer,updateOneSignalSubscription,removeOneSignalId
};
