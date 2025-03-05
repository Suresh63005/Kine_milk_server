const User = require("../../Models/User");
const WalletReport = require("../../Models/WalletReport");



const getWallet = async (req,res) =>{

    const userId = req.user.userId;

    try {

        if(!userId){
            return res.status(400).json({
                ResponseCode: "400",
                Result: "false",
                ResponseMsg: "User ID not provided",
            });
        }

        const wallet = await User.findOne({where:{id:userId},attributes:["id","wallet"]});

        if(!wallet){
            return res.status(404).json({
                ResponseCode: "404",
                Result: "false",
                ResponseMsg: "User not found",
                });
            
        }

        return res.status(200).json({
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "Wallet details fetched successfully",
            wallet:wallet,
            });
        
    } catch (error) {
        return res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Internal Server Error",
            });
        
    }

}

const updateWallet = async (req,res) =>{
    const userId = req.user.userId;
    const {amount,message,transaction_no,} = req.body;

    try {
        
    if(!userId || !transaction_no || !amount){
        return res.status(400).json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "User ID not provided",
            });
            
    }


    const user = await User.findByPk(userId);

    if(!user){
        return res.status(404).json({
            ResponseCode: "404",
            Result: "false",
            ResponseMsg: "User not found",
            });
    }
  user.wallet = user.wallet + amount;
  user.save();

  const wallet = await WalletReport.create({
    tdate:new Date(),
    uid:userId,
    amt:amount,
    message:message,
    transaction_no:transaction_no,

  });

  return res.status(200).json({
    ResponseCode: "200",
    Result: "true",
    ResponseMsg: "Wallet updated successfully",
    wallet
    });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Internal Server Error",
            });
        
    }



}




module.exports = {
    getWallet,
    updateWallet
}