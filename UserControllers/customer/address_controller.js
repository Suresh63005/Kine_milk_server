const { where } = require("sequelize");
const Address = require("../../Models/Address");




const upSertAddress = async (req, res) => {
    try {
      const { id,  lats, longs, address, landmark, r_instruction, a_type } = req.body;
      const uid = req.user.userId;

      console.log(uid)
      
      
      if (!uid || !lats || !longs || !address || !a_type) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Missing required fields!",
        });
      }
  
      if (id) {
        
        const existingAddress = await Address.findByPk(id);
  
        if (!existingAddress) {
          return res.status(404).json({
            ResponseCode: "404",
            Result: "false",
            ResponseMsg: "Address not found!",
          });
        }
  
        
        await Address.update(
          {
            uid:uid,
            a_lat: lats,
            a_long: longs,
            address,
            landmark,
            r_instruction,
            a_type,
          },
          { where: { id } }
        );
  
        return res.status(200).json({
          ResponseCode: "200",
          Result: "true",
          ResponseMsg: "Address Updated Successfully!",
          data: existingAddress,
        });
      } else {
        // Create a new address
        const newAddress = await Address.create({
          uid:uid,
          a_lat: lats,
          a_long: longs,
          address,
          landmark,
          r_instruction,
          a_type,
        });
  
        return res.status(200).json({
          ResponseCode: "200",
          Result: "true",
          ResponseMsg: "Address Saved Successfully!",
          data: newAddress,
        });
      }
    } catch (error) {
      console.error("Error processing address:", error);
      res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Server Error",
        error: error.message,
      });
    }
  };
  
  

 const getAddress = async (req, res) => {

    const uid = req.user.userId;

    
    try {
      const addresses = await Address.findAll({where:{uid:uid}});
      res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Address Retrieved Successfully!",
        data: addresses,
      });
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  module.exports = {
    upSertAddress,
    getAddress
  }