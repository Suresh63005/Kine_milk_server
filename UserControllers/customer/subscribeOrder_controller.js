const { Sequelize, Op } = require("sequelize");
const SubscribeOrder = require("../../Models/SubscribeOrder");
const Product = require("../../Models/Product");
const SubscribeOrderProduct = require("../../Models/SubscribeOrderProduct");
const Notification = require("../../Models/Notification");
const NormalOrder = require("../../Models/NormalOrder");
const User = require("../../Models/User");
const Time = require("../../Models/Time");
const Address = require("../../Models/Address");
const Review = require("../../Models/review");
const ProductReview = require("../../Models/ProductReview");
const WalletReport = require("../../Models/WalletReport");
const db = require("../../config/db");
const Store = require("../../Models/Store");
const WeightOption = require("../../Models/WeightOption");
const Cart = require("../../Models/Cart");
const Coupon = require("../../Models/Coupon");
const axios = require("axios"); 


const generateOrderId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${randomNum}`;
};

const subscribeOrder = async (req, res) => {
  const {
    products,
    start_date,
    end_date,
    days,
    timeslot_id,
    o_type,
    coupon_id,
    // cou_amt,
    subtotal,
    d_charge,
    store_charge,
    tax,
    o_total,
    store_id,
    address_id,
    a_note,
  } = req.body;

  console.log(req.body);

  const uid = req.user.userId;

  if (
    !uid ||
    !products ||
    !products.length ||
    !start_date ||
    !days ||
    !timeslot_id ||
    !o_type ||
    !store_id ||
    !subtotal ||
    !o_total
  ) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Missing required fields!",
    });
  }
  const t = await db.transaction();
  try {
    // Start a transaction

    const user = await User.findByPk(uid, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "User not found",
      });
    }

    const store = await Store.findByPk(store_id,{transaction:t})
    if(!store){
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Store not found",
      });
    }

    let appliedCoupon = null;
    let couponAmount = 0;
    let finalTotal = parseFloat(o_total);
    
    if(coupon_id){
      const coupon = await Coupon.findByPk(coupon_id, { transaction: t });
      if (!coupon) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Coupon not found",
        });
      }
      // Check if coupon is active and not expired
      const currentDate = new Date();
      if (coupon.status !== 1 || new Date(coupon.expire_date) < currentDate) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Coupon is inactive or expired",
        });
      }
      // Check if subtotal meets the minimum amount requirement
      const subtotalNum = parseFloat(subtotal);
      if (subtotalNum < parseFloat(coupon.min_amt)) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: `Subtotal (${subtotalNum}) is less than the minimum amount required (${coupon.min_amt}) for this coupon`,
        });
      }
      couponAmount = parseFloat(coupon.coupon_val);
      finalTotal = finalTotal - couponAmount;
      if (finalTotal < 0) finalTotal = 0;
      appliedCoupon = coupon;
    }
    const cartOrderType = "Subscription";

    const odate = new Date();

    // Create the order
    const order = await SubscribeOrder.create(
      {
        uid,
        store_id,
        address_id,
        odate,
        timeslot_id,
        o_type,
        start_date,
        end_date: end_date || null,
        days,
        cou_id: appliedCoupon ? appliedCoupon.id : null,
        cou_amt: couponAmount,
        subtotal,
        d_charge: d_charge || 0,
        store_charge: store_charge || 0,
        tax: tax || 0,
        o_total:finalTotal,
        a_note,
        order_id: generateOrderId(),
      },
      { transaction: t }
    );

    console.log(order, "from ordder");
    const orderItems = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findByPk(item.product_id);

        const weight = await WeightOption.findByPk(item.weight_id)

        if (!product)
          throw new Error(`Product with ID ${item.product_id} not found`);

        const itemPrice = weight.subscribe_price * item.quantity;

        return SubscribeOrderProduct.create(
          {
            oid: order.id,
            product_id: item.product_id,
            pquantity: item.quantity,
            price: itemPrice,
            weight_id:item.weight_id
          },
          { transaction: t }
        );
      })
    );

    const cartItemsToRemove = products.map((item)=>({
      uid,
      product_id: item.product_id,
      orderType: cartOrderType,
      weight_id: item.weight_id,
    }))

    await Cart.destroy({
      where:{
        [Op.or]:cartItemsToRemove
      },
      transaction:t
    })
    console.log("Cart items removed for subscription order:", cartItemsToRemove.length);

    const updatedAmount = user.wallet - o_total;
    if (updatedAmount < 0) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Insufficient wallet balance!",
      });
    }
    
    // user.wallet = updatedAmount;
    // user.save();
    // await user.save({ transaction });
    await user.update({ wallet: updatedAmount }, { transaction: t });

    await WalletReport.create(
      {
        uid,
        amt: o_total,
        message: `Order placed. ₹${o_total} has been deducted from your wallet.`,
        transaction_no: "null",
        tdate: new Date(),
        transaction_type: "Debited",
        status: 1,
      },
      { transaction: t }
    );

    console.log("Wallet updated successfully!");

    try {
      const notificationContent = {
        app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
        include_player_ids: [user.one_subscription],
        data: { user_id: user.id, type: "Subscription order confirmed" },
        contents: {
          en: `${user.name}, Your order  has been confirmed!`,
        },
        headings: { en: "Order Confirmed!" },
      };

      const response = await axios.post(
        "https://onesignal.com/api/v1/notifications",
        notificationContent,
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
          },
        }
      );

      // console.log(response, "notification sent");
      console.log("User notification sent:", response.data);
    } catch (error) {
      console.log(error);
    }

    try {
      const storeNotificationContent = {
        app_id:process.env.ONESIGNAL_STORE_APP_ID,
        include_player_ids:[store.one_subscription],
        data:{store_id:store.id,type:"new subscription order received"},
        contents:{
          en:`New subscription order received! Order ID:${order.id}`
        },
        headings:{en:"New Subscription Order Alert"}
      }
      const storeResponse = await axios.post(
        "https://onesignal.com/api/v1/notifications",
        storeNotificationContent,
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Basic ${process.env.ONESIGNAL_STORE_API_KEY}`,
          },
        }
      )
      // console.log(storeResponse.data, "store notification sent");
      console.log("Store notification sent:", storeResponse.data);
    } catch (error) {
      console.log("Store notification error:", error);
    }

    await Promise.all([
      Notification.create(
        {
          uid,
          datetime: new Date(),
          title: "Subscription Order Confirmed",
          description: `Your subscription order created Order ID ${order.id}.`,
        },
        { transaction: t }
      ),
      Notification.create(
        {
          uid: store.id,
          datetime: new Date(),
          title: "New Subscription Order Received",
          description: `A new subscription order has been placed. Order ID: ${order.id}.`,
        },
        { transaction: t }
      ),
    ]);

    // await Notification.create(
    //   {
    //     uid,
    //     datetime: new Date(),
    //     title: "Order Confirmed",
    //     description: `Your order created  Order ID ${order.id} .`,
    //   },
    //   { transaction: t }
    // );
    await t.commit();

    res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Order created successfully!",
      order_id: order.order_id,
      o_total:finalTotal,
      coupon_applied:appliedCoupon ? {id:appliedCoupon.id,title:appliedCoupon.coupon_title,amount:couponAmount}:null,
      items: orderItems,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating order:", error);

    res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Server Error",
      error: error.message,
    });
  }
};


const getOrdersByStatus = async (req, res) => {
  try {
    const { uid, status } = req.body;

    const validStatuses = ["Pending", "Processing", "Active", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status" });
    }

    const orders = await SubscribeOrder.findAll({
      where: { uid, status },
      include: [
        {
          model: SubscribeOrderProduct,
          as: "orderProducts",
          include: [
            {
              model: WeightOption,
              as: "subscribeProductWeight",
              attributes: ["id", "normal_price", "subscribe_price", "mrp_price", "weight"],
            },
            {
              model: Product,
              as: "productDetails",
              attributes: ["id", "title", "img", "description"],
            },
          ],
          attributes: ["pquantity"],
        },
        {
          model: Address,
          as: "subOrdAddress",
        },
        {
          model: Time,
          as: "timeslots",
          attributes: ["id", "mintime", "maxtime"],
        },
        {
          model: Review,
          as: "suborderdeliveryreview",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Manually attach ProductReviews
    for (let order of orders) {
      for (let orderProduct of order.orderProducts) {
        const productReviews = await ProductReview.findAll({
          where: {
            user_id: uid,
            product_id: orderProduct.productDetails.id,
            order_id: order.id,
          },
        });
        orderProduct.productDetails.setDataValue("ProductReviews", productReviews);
      }
    }

    res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Subscribe Order fetched successfully!",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Server Error",
      error: error.message,
    });
  }
};

const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const orderDetails = await SubscribeOrder.findOne({
      where: { id },
      include: [
        {
          model: SubscribeOrderProduct,
          as: "orderProducts",
          include: [
            {
              model: Product,
              as: "productDetails",
            },
          ],
        },
        {
          model: Time,
          as: "timeslots",
          attributes: ["id", "mintime", "maxtime"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!orderDetails) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Order Not Found",
      });
    }

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Instant Order fetched successfully!",
      orderDetails,
    });
  } catch (error) {
    console.error("Error fetching order:", error.message);

    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.body;

    const uid = req.user.userId;

    if (!uid) {
      return res.status(401).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "Unauthorized",
      });
    }

    console.log(uid, "idddddddddddd");
    const user = await User.findByPk(uid);

    if (!user) {
      console.error("User not found");
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "User Not Found",
      });
    }

    // Find the order
    const order = await SubscribeOrder.findOne({ where: { id } });

    if (!order) {
      return res.status(400).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Order not found",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Order is already cancelled",
      });
    }
    order.status = "Cancelled";
    await order.save();

    try {
      const notificationContent = {
        app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
        include_player_ids: [user.one_subscription],
        data: { user_id: user.id, type: "Subscription order Cancelled" },
        contents: {
          en: `${user.name}, Your order  has been Cancelled!`,
        },
        headings: { en: "Order Cancelled!" },
      };

      const response = await axios.post(
        "https://onesignal.com/api/v1/notifications",
        notificationContent,
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
          },
        }
      );

      console.log(response, "notification sent");
    } catch (error) {
      console.log(error);
    }

    await Notification.create({
      uid,
      datetime: new Date(),
      title: "Order Subscription  Cancelled",
      description: `Your order Cancelled.`,
    });

    res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Order cancelled successfully!",
      order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
  }
};

module.exports = {
  subscribeOrder,
  getOrdersByStatus,
  getOrderDetails,
  cancelOrder,
};
