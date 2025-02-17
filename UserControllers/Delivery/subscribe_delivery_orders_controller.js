const asyncHandler = require("../../middlewares/errorHandler");
const Product = require("../../Models/Product");
const Rider = require("../../Models/Rider");
const SubscribeOrder = require("../../Models/SubscribeOrder");
const SubscribeOrderProduct = require("../../Models/SubscribeOrderProduct");

const FetchAllSubscribeOrders = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);
  const riderId = req.user?.riderId;
  const { status } = req.query;
  if (!riderId) {
    return res.status(401).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "Rider ID not provided",
    });
  }
  if (!status) {
    return res.status(400).json({ message: "Order status is required!" });
  }
  try {
    console.log("Fetching rider details for ID:", riderId);
    const rider = await Rider.findOne({ where: { id: riderId }, attributes:["store_id","id","title"] });
    if (!rider || !rider.store_id) {
        return res.status(404).json({ message: "Rider not assigned to any store!" });
    }
    const store_id=rider.store_id
    console.log(`Fetching orders for Store ID: ${store_id} with Status: ${status}`)
    const subscribeOrders=await SubscribeOrder.findAll({
        where:{store_id,rid:riderId,status},
        include:[
            {
                model:SubscribeOrderProduct,
                as:"orderProducts",
                include:[
                    {
                        model:Product,
                        as:"productDetails",
                        attributes:["id","title","description","subscribe_price","normal_price","mrp_price"]
                    }
                ]
            }
        ]
    })
    if(!subscribeOrders.length){
        return res.status(404).json({message:"No Orders found with the given status!"})
    }
    return res.status(200).json({
        message:"Subscribe Orders Fetched Successfully!",
        orders:subscribeOrders
    })
  } catch (error) {
    console.error("Error Occurs While Fetching Subscribe Orders: ",error)
    return res.status(500).json({message:"Interal Server Error",error})
  }
});

const ViewSubscribeOrderDetails = asyncHandler(async(req,res)=>{
    console.log("Decoded User:", req.user);
    const riderId = req.user?.riderId;
    const { orderId } = req.query;

    if (!riderId) {
        return res.status(401).json({
            ResponseCode: "401",
            Result: "false",
            ResponseMsg: "Rider ID not provided",
        });
    }

    if (!orderId) {
        return res.status(400).json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "Order Id is required!",
        });
    }
    try {
        console.log("Fetching order details for Order ID:", orderId, " and Rider ID:", riderId);
        const subscribeOrders = await SubscribeOrder.findOne({
            where:{id:orderId,rid:riderId},
            include:[
                {
                    model:SubscribeOrderProduct,
                    as:"orderProducts",
                    include:[
                        {
                            model:Product,
                            as:"productsDetails",
                            attributes: ["id", "title", "description", "normal_price", "mrp_price", "img"],
                        }
                    ]
                }
            ]
        })
        if(!subscribeOrders){
            return res.status(404).json({
                success: false,
                ResponseCode: "404",
                Result: "false",
                ResponseMsg: "Order not found or not assigned to this rider!",
            });
        }
        return res.status(200).json({
            success:true,
            ResponseCode:"Subscribe Order details fetched successfully",
            Data:subscribeOrders
        })
    } catch (error) {
        console.error("Error Occurs While Fetching Order Details: ",error)
        return res.status(500).json({
            ResponseCode:"500",
            Result:"false",
            ResponseMsg:"Internal Server Error",
            Error:error.message
        })
    }
})

module.exports = {FetchAllSubscribeOrders,ViewSubscribeOrderDetails}
