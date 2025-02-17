const User = require("../../Models/User");
const asyncHandler = require("../../middlewares/errorHandler");
const {customerFirebase} = require('../../config/firebase-config');
const jwt = require('jsonwebtoken');

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

  if (!name && !email) {
      return res.status(400).json({
          ResponseCode: "402",
          Result: "false",
          ResponseMsg: "At least one field (name or email) must be provided for update",
      });
  }

  try {
      console.log(`Updating customer (ID: ${uid}) details - Name: ${name}, Email: ${email}`);

      const customer = await User.findOne({ where: { id: uid } });

      if (!customer) {
          return res.status(404).json({
              ResponseCode: "404",
              Result: "false",
              ResponseMsg: "Customer not found",
          });
      }

      await customer.update({ name, email });

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

module.exports = { VerifyCustomerMobile,FetchCustomerDetails,UpdateCustomerDetails };
