const Rider = require('../../Models/Rider');
const { deliveryFirebase } = require('../../config/firebase-config');
const asyncHandler = require('../../middlewares/errorHandler');
const jwt = require('jsonwebtoken');

const VerifyRiderMobile = asyncHandler(async (req, res) => {
    let { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ message: "Mobile Number is Required!" });
    }

    // Ensure the mobile number starts with '+'
    if (!mobile.startsWith("+")) {
        mobile = `+${mobile}`;
    }

    try {
        // Get the rider from Firebase Auth
        const riderRecord = await deliveryFirebase.auth().getUserByPhoneNumber(mobile);

        if (!riderRecord) {
            return res.status(404).json({ message: "Mobile number not found in Firebase." });
        }

        // Remove the country code for database lookup
        const formattedMobile = mobile.startsWith("+91") ? mobile.slice(3) : mobile;

        // Check if rider exists in the database
        let rider = await Rider.findOne({ where: { mobile: formattedMobile } });

        if (!rider) {
            return res.status(404).json({ message: "Rider not found in database. Please register first." });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { riderId: rider.id, mobile: rider.mobile },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Mobile number verified successfully!",
            rider,
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

const EditRiderProfile = asyncHandler(async (req, res) => {
    console.log("Decoded User: ", req.user);
    const riderId = req.user?.riderId;
    
    if (!riderId) {
      return res.status(401).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "Rider ID not provided",
      });
    }
  
    const { rider_id } = req.params;
    const { title, email } = req.body;
  
    try {
      console.log("Fetching rider details for ID:", rider_id);
      const rider = await Rider.findByPk(rider_id);
  
      if (!rider) {
        return res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Rider not found",
        });
      }
  
      rider.title = title || rider.title;
      rider.email = email || rider.email;
  
      await rider.save();
  
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Rider updated successfully",
        rider,
      });
  
    } catch (error) {
      console.error("Error updating rider:", error.message);
      return res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Internal Server Error: " + error.message,
      });
    }
  });

module.exports = { VerifyRiderMobile,EditRiderProfile };
