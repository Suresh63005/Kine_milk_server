const User = require("../../Models/User");
const WalletReport = require("../../Models/WalletReport");

const getWallet = async (req, res) => {
  const userId = req.user.userId;

  try {
    if (!userId) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "User ID not provided",
      });
    }

    const wallet = await User.findOne({
      where: { id: userId },
      attributes: ["id", "wallet"],
    });

    if (!wallet) {
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
      wallet: wallet,
    });
  } catch (error) {
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
    });
  }
};

const updateWallet = async (req, res) => {
  const userId = req.user.userId;
  const { amount, message, transaction_no } = req.body;

  try {
    // Validation
    if (!userId || !transaction_no || !amount) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "User ID, transaction number, and amount are required",
      });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "User not found",
      });
    }

    user.wallet = (user.wallet || 0) + amount;
    await user.save();

    const walletReport = await WalletReport.create({
      tdate: new Date(),
      uid: userId,
      amt: amount,
      message: message || "Wallet credited",
      transaction_no,
      transaction_type: "Credited",
    });

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Wallet updated successfully",
      walletReport,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
    });
  }
};

const WalletReportHistory = async (req, res) => {
  const uid = req.user.userId;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized: User not found!" });
  }
  try {
    const walletHistory = await WalletReport.findAll({
      where: { uid: uid },
      order: [["createdAt", "DESC"]],
    });
    if (!walletHistory || walletHistory.length === 0) {
      return res.status(404).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "No wallet history found!",
      });
    }

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Wallet history fetched successfully!",
      walletHistory,
    });
  } catch (error) {
    console.log("Error fetching wallet history: ", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal server error",
    });
  }
};

module.exports = {
  getWallet,
  updateWallet,
  WalletReportHistory,
};
