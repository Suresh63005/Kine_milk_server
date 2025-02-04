const Product = require("../../Models/Product");
const NormalOrder = require("../../Models/NormalOrder");
const SubscribeOrder = require("../../Models/SubscribeOrder");
const Rider = require("../../Models/Rider");
const User = require("../../Models/User");
const Store = require('../../Models/Store');
const asyncHandler = require("../../middlewares/errorHandler");

const StoreAPI = asyncHandler(async (req, res) => {
  try {
    const uid = req.user.id;
    if (!uid) {
      res.status(401).json({
        ResponseCode: "401",
        success: false,
        message: "User Not Found!",
      });
    }
    const user = await User.findOne({
      where: { id: uid, status: 1 },
      attributes: ["name","store_id"],
      include:[{model:Store,as:"store",attributes:["id","name"]}]
    });
    if (!user || !user.store) {
      res.status(401).json({
        ResponseCode: "401",
        success: false,
        message: "Store Not Found for User!",
      });
    }

    const storeId = user.store.id
    // Todays Summery
    const totalOrders = await NormalOrder.findAll({where:{store_id:storeId}});
    const openOrders = await NormalOrder.findAll({ where: { store_id: storeId, status: "Processing" } });
    const closedOrders = await NormalOrder.findAll({ where: { store_id: storeId, status: "Completed" } });

    // Inventory
    const products = await Product.findAll({ where: { status: 1, store_id: storeId } });
    const subscriptionOrders = await SubscribeOrder.findAll({
        where: { store_id: storeId },
        attributes: ["id", "uid", "o_type", "lattitude", "longtitude"],
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["name", "address"],
          },
        ],
      });    
      const instantOrders = await NormalOrder.findAll({
        where: { store_id: storeId },
        attributes: ["id", "uid", "o_type", "lattitude", "longtitude"],
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["name", "address"],
          },
        ],
      });
      const deliveryBoys = await Rider.findAll({
        where: { store_id: storeId },
        attributes: ["id", "name", "phone"],
      })
      return res.status(200).json({
        ResponseCode: "200",
        success: true,
        message: "Store Data Fetched Successfully.",
        user_details: {
          name: user.name,
          store_name: user.store.name,
        },
        todays_summary: {
          total_orders: totalOrders.length,
          open_orders: openOrders.length,
          closed_orders: closedOrders.length,
        },
        inventory: {
          products: products.length,
          delivery_boys: deliveryBoys.length,
          instant_orders: instantOrders.length,
          subscription_orders: subscriptionOrders.length,
        },
      });

  } catch (error) {
    console.error("Error fetching Store Data:", error);
    return res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Internal Server Error"
    });
  }
});

module.exports = {StoreAPI}
