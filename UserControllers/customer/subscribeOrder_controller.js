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
const Setting = require("../../Models/Setting");
const sequelize = require("../../config/db");
const cron = require("node-cron");

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
    subtotal,
    o_total,
    store_id,
    address_id,
    a_note,
  } = req.body;

  console.log("Request body:", JSON.stringify(req.body, null, 2));

  const uid = req.user.userId;

  // Input validation
  if (
    !uid ||
    !products ||
    !products.length ||
    !start_date ||
    !days ||
    !days.length ||
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

  // Validate address_id for Delivery orders
  if (o_type === "Delivery" && !address_id) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Address ID is required for Delivery orders!",
    });
  }

  // Validate days array
  const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  if (!days.every((day) => validDays.includes(day))) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Invalid days in subscription schedule!",
    });
  }

  // Validate products array
  for (const item of products) {
    if (!item.product_id || !item.weight_id || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Each product must have a valid product_id, weight_id, and quantity greater than 0!",
      });
    }
  }

  // Fetch settings
  const setting = await Setting.findOne();
  if (!setting) {
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Settings not found!",
    });
  }

  const minimumSubscriptionDays = parseInt(setting.minimum_subscription_days, 10) || 30;
  const deliveryCharge = parseFloat(setting.delivery_charges) || 0;
  const storeCharge = parseFloat(setting.store_charges) || 0;
  const tax = parseFloat(setting.tax) || 0;

  // Validate subscription duration
  const startDate = new Date(start_date);
  if (isNaN(startDate)) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Invalid start_date format!",
    });
  }

  const endDate = end_date ? new Date(end_date) : null;
  if (endDate && isNaN(endDate)) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Invalid end_date format!",
    });
  }

  const minEndDate = new Date(startDate);
  minEndDate.setDate(startDate.getDate() + minimumSubscriptionDays - 1);

  if (endDate && endDate < minEndDate) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: `Subscription must be for at least ${minimumSubscriptionDays} days!`,
    });
  }

  const t = await sequelize.transaction();
  try {
    // Verify user
    const user = await User.findByPk(uid, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "User not found",
      });
    }

    // Verify store
    const store = await Store.findByPk(store_id, { transaction: t });
    if (!store) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Store not found",
      });
    }

    // Validate products and calculate subtotal
    const calculatedSubtotalDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findByPk(item.product_id, { transaction: t });
        const weight = await WeightOption.findByPk(item.weight_id, { transaction: t });

        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        if (!weight) {
          throw new Error(`Weight option with ID ${item.weight_id} not found`);
        }
        if (product.out_of_stock === 1) {
          throw new Error(`Product with ID ${item.product_id} is out of stock`);
        }
        if (product.subscription_required !== 1) {
          throw new Error(`Product with ID ${item.product_id} does not support subscriptions`);
        }

        const itemPrice = weight.subscribe_price * item.quantity;
        return { item, price: itemPrice, subscribe_price: weight.subscribe_price };
      })
    );

    const calculatedSubtotal = calculatedSubtotalDetails.reduce((sum, detail) => sum + detail.price, 0);

    if (Math.abs(calculatedSubtotal - parseFloat(subtotal)) > 0.01) {
      console.log("Subtotal mismatch:", {
        providedSubtotal: parseFloat(subtotal),
        calculatedSubtotal,
        products: calculatedSubtotalDetails.map((d) => ({
          product_id: d.item.product_id,
          weight_id: d.item.weight_id,
          quantity: d.item.quantity,
          subscribe_price: d.subscribe_price,
          itemTotal: d.price,
        })),
      });
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Subtotal does not match calculated product prices!",
      });
    }

    // Coupon validation
    let appliedCoupon = null;
    let couponAmount = 0;
    let finalTotal = parseFloat(o_total);

    if (coupon_id) {
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
      if (coupon.status !== 1 || new Date(coupon.end_date) < currentDate) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Coupon is inactive or expired",
        });
      }

      // Check minimum amount for coupon
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
      console.log(`Coupon applied: ID=${coupon.id}, Title=${coupon.coupon_title}, Amount=${couponAmount}`);
    } else {
      console.log("No coupon applied");
    }

    // Validate o_total
    const calculatedTotal = calculatedSubtotal + (o_type === "Delivery" ? deliveryCharge : 0) + storeCharge + tax - couponAmount;
    if (Math.abs(calculatedTotal - parseFloat(o_total)) > 0.01) {
      console.log("Total mismatch:", {
        providedTotal: parseFloat(o_total),
        calculatedTotal,
        calculatedSubtotal,
        deliveryCharge: o_type === "Delivery" ? deliveryCharge : 0,
        storeCharge,
        tax,
        couponAmount,
      });
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Order total does not match calculated total!",
      });
    }

    // Wallet balance check
    const updatedAmount = user.wallet - finalTotal;
    if (updatedAmount < 0) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Insufficient wallet balance! Please add funds to your wallet.",
      });
    }

    // Create the order
    const order = await SubscribeOrder.create(
      {
        uid,
        store_id,
        address_id: o_type === "Delivery" ? address_id : null,
        odate: new Date(),
        timeslot_id,
        o_type,
        start_date,
        end_date: end_date || null,
        days,
        cou_id: appliedCoupon ? appliedCoupon.id : null,
        cou_amt: couponAmount,
        subtotal: parseFloat(subtotal),
        d_charge: o_type === "Delivery" ? deliveryCharge : 0,
        store_charge: storeCharge,
        tax,
        o_total: finalTotal,
        a_note,
        order_id: await generateOrderId(t),
      },
      { transaction: t }
    );

    // Create order items
    const orderItems = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findByPk(item.product_id, { transaction: t });
        const weight = await WeightOption.findByPk(item.weight_id, { transaction: t });

        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        if (!weight) {
          throw new Error(`Weight option with ID ${item.weight_id} not found`);
        }

        const itemPrice = weight.subscribe_price * item.quantity;

        return SubscribeOrderProduct.create(
          {
            oid: order.id,
            product_id: item.product_id,
            pquantity: item.quantity,
            price: itemPrice,
            weight_id: item.weight_id,
          },
          { transaction: t }
        );
      })
    );

    // Remove cart items
    const cartItemsToRemove = products.map((item) => ({
      uid,
      product_id: item.product_id,
      orderType: "Subscription",
      weight_id: item.weight_id,
    }));

    await Cart.destroy({
      where: { [Op.or]: cartItemsToRemove },
      transaction: t,
    });

    // Update wallet
    await user.update({ wallet: updatedAmount }, { transaction: t });

    // Create wallet report
    await WalletReport.create(
      {
        uid,
        amt: finalTotal,
        message: `Subscription order placed. ₹${finalTotal} has been deducted from your wallet.`,
        transaction_no: order.order_id,
        tdate: new Date(),
        transaction_type: "Debited",
        status: 1,
      },
      { transaction: t }
    );

    // Send user notification
    try {
      const notificationContent = {
        app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
        include_player_ids: [user.one_subscription],
        data: { user_id: user.id, type: "Subscription order confirmed" },
        contents: {
          en: `${user.name}, Your subscription order has been confirmed! Order ID: ${order.order_id}`,
        },
        headings: { en: "Subscription Order Confirmed!" },
      };

      await axios.post("https://onesignal.com/api/v1/notifications", notificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("User notification error:", error.message);
    }

    // Send store notification
    try {
      const storeNotificationContent = {
        app_id: process.env.ONESIGNAL_STORE_APP_ID,
        include_player_ids: [store.one_subscription],
        data: { store_id: store.id, type: "new subscription order received" },
        contents: {
          en: `New subscription order received! Order ID: ${order.order_id}`,
        },
        headings: { en: "New Subscription Order Alert" },
      };

      await axios.post("https://onesignal.com/api/v1/notifications", storeNotificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_STORE_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("Store notification error:", error.message);
    }

    // Create notifications
    await Promise.all([
      Notification.create(
        {
          uid,
          datetime: new Date(),
          title: "Subscription Order Confirmed",
          description: `Your subscription order created. Order ID: ${order.order_id}.`,
        },
        { transaction: t }
      ),
      Notification.create(
        {
          uid: store.id,
          datetime: new Date(),
          title: "New Subscription Order Received",
          description: `A new subscription order has been placed. Order ID: ${order.order_id}.`,
        },
        { transaction: t }
      ),
    ]);

    await t.commit();

    res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Subscription order created successfully!",
      order_id: order.order_id,
      o_total: finalTotal,
      is_coupon_applied: !!appliedCoupon,
      coupon_applied: appliedCoupon
        ? { id: appliedCoupon.id, title: appliedCoupon.coupon_title, amount: couponAmount }
        : null,
      items: orderItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.pquantity,
        price: item.price,
        weight_id: item.weight_id,
      })),
      order
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating subscription order:", error.message);
    res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Server Error",
      error: error.message,
    });
  }
};

const EditSubscriptionOrder = async (req, res) => {
  const uid = req.user.userId;
  const { orderId, products, days, timeslot_id, end_date } = req.body;

  if (!uid || !orderId) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "User ID and Order ID are required!",
    });
  }

  if (!products && !days && !timeslot_id && !end_date) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "At least one field (products, days, timeslot_id, or end_date) must be provided to update!",
    });
  }

  const t = await sequelize.transaction();
  try {
    // Fetch the order
    const order = await SubscribeOrder.findOne({
      where: { id: orderId, uid, status: { [Op.in]: ["Pending", "Active", "Processing"] } },
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Order not found, not owned by user, or not in editable status!",
      });
    }

    // Validate start_date and end_date
    if (!order.start_date || !order.end_date) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Order start_date or end_date is invalid or missing!",
      });
    }

    // Fetch user and store
    const user = await User.findByPk(uid, { transaction: t });
    const store = await Store.findByPk(order.store_id, { transaction: t });
    if (!user || !store) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "User or store not found!",
      });
    }

    console.log("User wallet balance:", { userId: uid, wallet: user.wallet });

    // Fetch settings
    const setting = await Setting.findOne({ transaction: t });
    if (!setting) {
      await t.rollback();
      return res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Settings not found!",
      });
    }

    const deliveryCharge = parseFloat(setting.delivery_charges) || 0;
    const storeCharge = parseFloat(setting.store_charges) || 0;
    const tax = parseFloat(setting.tax) || 0;

    // Initialize order updates
    let updatedSubtotal = parseFloat(order.subtotal) || 0;
    let updatedTotal = parseFloat(order.o_total) || 0;
    let updatedDays = order.days || [];
    let updatedTimeslotId = order.timeslot_id;
    let updatedEndDate = new Date(order.end_date);
    let walletAdjustment = 0;
    let walletTransactionMessage = [];

    console.log("Initial state:", {
      updatedSubtotal,
      updatedTotal,
      updatedDays,
      updatedEndDate: updatedEndDate.toISOString(),
      start_date: order.start_date,
    });

    // Validate and process products
    if (products) {
      if (!Array.isArray(products) || products.length === 0) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Products must be a non-empty array!",
        });
      }

      for (const item of products) {
        if (!item.product_id || !item.weight_id || !item.quantity || item.quantity < 0) {
          await t.rollback();
          return res.status(400).json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "Each product must have a valid product_id, weight_id, and non-negative quantity!",
          });
        }
      }

      // Fetch existing order products
      const existingOrderProducts = await SubscribeOrderProduct.findAll({
        where: { oid: orderId },
        transaction: t,
      });
      const existingProductMap = existingOrderProducts.reduce((map, prod) => {
        map[`${prod.product_id}-${prod.weight_id}`] = prod.pquantity;
        return map;
      }, {});

      // Calculate new subtotal and wallet adjustment for products
      const calculatedSubtotalDetails = await Promise.all(
        products.map(async (item) => {
          const product = await Product.findByPk(item.product_id, { transaction: t });
          const weight = await WeightOption.findByPk(item.weight_id, { transaction: t });

          if (!product) {
            throw new Error(`Product with ID ${item.product_id} not found`);
          }
          if (!weight) {
            throw new Error(`Weight option with ID ${item.weight_id} not found`);
          }
          if (product.out_of_stock === 1) {
            throw new Error(`Product with ID ${item.product_id} is out of stock`);
          }
          if (product.subscription_required !== 1) {
            throw new Error(`Product with ID ${item.product_id} does not support subscriptions`);
          }

          const itemPrice = weight.subscribe_price * item.quantity;
          const existingQuantity = existingProductMap[`${item.product_id}-${item.weight_id}`] || 0;
          const quantityChange = item.quantity - existingQuantity;
          const priceAdjustment = weight.subscribe_price * quantityChange;

          console.log("Product change:", {
            product_id: item.product_id,
            weight_id: item.weight_id,
            oldQuantity: existingQuantity,
            newQuantity: item.quantity,
            quantityChange,
            price: weight.subscribe_price,
            priceAdjustment,
            itemPrice,
          });

          return { item, price: itemPrice, subscribe_price: weight.subscribe_price, priceAdjustment };
        })
      );

      const newSubtotal = calculatedSubtotalDetails.reduce((sum, detail) => sum + detail.price, 0);
      const productAdjustment = calculatedSubtotalDetails.reduce((sum, detail) => sum + detail.priceAdjustment, 0);

      walletAdjustment += productAdjustment;
      walletTransactionMessage.push(
        `Subtotal changed from ₹${updatedSubtotal.toFixed(2)} to ₹${newSubtotal.toFixed(2)} (${productAdjustment >= 0 ? "+" : "-"}₹${Math.abs(productAdjustment).toFixed(2)})`
      );

      updatedSubtotal = newSubtotal;
      updatedTotal = parseFloat(
        (updatedSubtotal + (order.o_type === "Delivery" ? deliveryCharge : 0) + storeCharge + tax - (order.cou_amt || 0)).toFixed(2)
      );

      console.log("After products:", { newSubtotal, updatedSubtotal, updatedTotal, productAdjustment, walletAdjustment });
    }

    // Validate and process days and end_date
    if (days || end_date) {
      const startDate = new Date(order.start_date);
      const originalEndDate = new Date(order.end_date);
      const effectiveEndDate = end_date ? new Date(end_date) : updatedEndDate;

      if (!effectiveEndDate || isNaN(effectiveEndDate)) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "End date is required and must be valid when changing days or updating end_date!",
        });
      }

      if (end_date) {
        const newEndDate = new Date(end_date);
        if (isNaN(newEndDate)) {
          await t.rollback();
          return res.status(400).json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "Invalid end_date format!",
          });
        }

        if (newEndDate > originalEndDate) {
          await t.rollback();
          return res.status(400).json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "Cannot extend subscription end date beyond original end date!",
          });
        }
        updatedEndDate = newEndDate;
      }

      // Validate date range
      if (startDate > effectiveEndDate) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: `Invalid date range: start_date (${startDate.toISOString()}) is after end_date (${effectiveEndDate.toISOString()})!`,
        });
      }

      const effectiveDays = days || updatedDays;
      if (!Array.isArray(effectiveDays) || !effectiveDays.every((day) => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(day))) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Invalid days in subscription schedule!",
        });
      }

      // Calculate delivery days
      const pausedPeriods = order.paused_periods || [];
      const originalDeliveryDays = calculateDeliveryDays(startDate, originalEndDate, order.days, pausedPeriods);
      const newDeliveryDays = calculateDeliveryDays(startDate, effectiveEndDate, effectiveDays, pausedPeriods);

      if (newDeliveryDays === 0) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: `No delivery days available for the selected schedule! Days: ${effectiveDays.join(", ")}.`,
        });
      }

      // Calculate wallet adjustment for delivery days
      if (originalDeliveryDays > 0 && days) {
        const perDayCost = updatedSubtotal / originalDeliveryDays;
        const deliveryDaysAdjustment = perDayCost * (newDeliveryDays - originalDeliveryDays);
        walletAdjustment += deliveryDaysAdjustment;
        walletTransactionMessage.push(
          `Delivery days changed from ${originalDeliveryDays} to ${newDeliveryDays} (${deliveryDaysAdjustment >= 0 ? "+" : "-"}₹${Math.abs(deliveryDaysAdjustment).toFixed(2)})`
        );

        updatedSubtotal = parseFloat(updatedSubtotal.toFixed(2)); // Subtotal remains unchanged
        updatedTotal = parseFloat(
          (updatedSubtotal + (order.o_type === "Delivery" ? deliveryCharge : 0) + storeCharge + tax - (order.cou_amt || 0)).toFixed(2)
        );

        console.log("After days/end_date:", {
          originalDeliveryDays,
          newDeliveryDays,
          perDayCost,
          deliveryDaysAdjustment,
          updatedSubtotal,
          updatedTotal,
          walletAdjustment,
        });
      }

      if (days) updatedDays = days;
    }

    // Validate and process timeslot_id
    if (timeslot_id) {
      const timeslot = await Time.findByPk(timeslot_id, { transaction: t });
      if (!timeslot) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Timeslot not found!",
        });
      }
      updatedTimeslotId = timeslot_id;
      walletTransactionMessage.push(`Timeslot changed to ID ${timeslot_id}`);
    }

    // Ensure non-negative totals
    if (updatedSubtotal < 0 || updatedTotal < 0) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Calculated subtotal or total cannot be negative!",
      });
    }

    // Determine wallet transaction type
    const walletTransactionType = walletAdjustment > 0 ? "Debited" : walletAdjustment < 0 ? "Credited" : "No Change";

    // Check wallet balance for debits
    if (walletAdjustment > 0) {
      const updatedWallet = user.wallet - walletAdjustment;
      if (updatedWallet < 0) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: `Insufficient wallet balance! Current balance: ₹${user.wallet.toFixed(2)}, Required: ₹${walletAdjustment.toFixed(2)}.`,
        });
      }
      await user.update({ wallet: updatedWallet }, { transaction: t });

      await WalletReport.create(
        {
          uid,
          amt: walletAdjustment,
          message: `Subscription order edited: ${walletTransactionMessage.join("; ")}.`,
          transaction_no: order.order_id,
          tdate: new Date(),
          transaction_type: "Debited",
          status: 1,
        },
        { transaction: t }
      );
    } else if (walletAdjustment < 0) {
      await user.update({ wallet: user.wallet + Math.abs(walletAdjustment) }, { transaction: t });

      await WalletReport.create(
        {
          uid,
          amt: Math.abs(walletAdjustment),
          message: `Refund for subscription order edit: ${walletTransactionMessage.join("; ")}.`,
          transaction_no: order.order_id,
          tdate: new Date(),
          transaction_type: "Credited",
          status: 1,
        },
        { transaction: t }
      );
    }

    // Update order
    await order.update(
      {
        subtotal: updatedSubtotal,
        o_total: updatedTotal,
        days: updatedDays,
        timeslot_id: updatedTimeslotId,
        end_date: updatedEndDate,
      },
      { transaction: t }
    );

    // Update order products if provided
    if (products) {
      await SubscribeOrderProduct.destroy({ where: { oid: orderId }, transaction: t });

      await Promise.all(
        products.map(async (item) => {
          const weight = await WeightOption.findByPk(item.weight_id, { transaction: t });
          const itemPrice = weight.subscribe_price * item.quantity;

          return SubscribeOrderProduct.create(
            {
              oid: orderId,
              product_id: item.product_id,
              pquantity: item.quantity,
              price: itemPrice,
              weight_id: item.weight_id,
            },
            { transaction: t }
          );
        })
      );
    }

    // Send notifications
    try {
      const userNotificationContent = {
        app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
        include_player_ids: [user.one_subscription],
        data: { user_id: user.id, type: "Subscription order edited" },
        contents: {
          en: `${user.name}, Your subscription order (ID: ${order.order_id}) has been updated!`,
        },
        headings: { en: "Subscription Order Updated!" },
      };
      await axios.post("https://onesignal.com/api/v1/notifications", userNotificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("User notification error:", error.message);
    }

    try {
      const storeNotificationContent = {
        app_id: process.env.ONESIGNAL_STORE_APP_ID,
        include_player_ids: [store.one_subscription],
        data: { store_id: store.id, type: "subscription order edited" },
        contents: {
          en: `Subscription order updated! Order ID: ${order.order_id}`,
        },
        headings: { en: "Subscription Order Updated" },
      };
      await axios.post("https://onesignal.com/api/v1/notifications", storeNotificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_STORE_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("Store notification error:", error.message);
    }

    await Promise.all([
      Notification.create(
        {
          uid,
          datetime: new Date(),
          title: "Subscription Order Updated",
          description: `Your subscription order (ID: ${order.order_id}) has been updated: ${walletTransactionMessage.join("; ")}.`,
        },
        { transaction: t }
      ),
      Notification.create(
        {
          uid: store.id,
          datetime: new Date(),
          title: "Subscription Order Updated",
          description: `Subscription order (ID: ${order.order_id}) has been updated.`,
        },
        { transaction: t }
      ),
    ]);

    await t.commit();

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Subscription order updated successfully!",
      order_id: order.order_id,
      o_total: updatedTotal,
      wallet_adjustment: walletAdjustment,
      wallet_transaction_type: walletTransactionType,
      updated_fields: {
        products: products || undefined,
        days: updatedDays,
        timeslot_id: updatedTimeslotId,
        end_date: updatedEndDate ? updatedEndDate.toISOString().split("T")[0] : undefined,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error editing subscription order:", error.message);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Server Error",
      error: error.message,
    });
  }
};

const PauseSubscriptionOrder = async (req, res) => {
  const uid = req.user.userId;
  const { orderId, start_date, end_date } = req.body;

  if (!uid) {
    return res.status(401).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "Unauthorized",
    });
  }

  if (!orderId || !start_date || !end_date) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Missing required fields!",
    });
  }

  const t = await sequelize.transaction();
  try {
    // Find active order
    const activeOrder = await SubscribeOrder.findOne({
      where: { id: orderId, uid, status: "Active" },
      transaction: t,
    });

    if (!activeOrder) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Active order not found or not owned by user",
      });
    }

    // Fetch store for notifications
    const store = await Store.findByPk(activeOrder.store_id, { transaction: t });
    if (!store) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Store not found",
      });
    }

    // Validate pause dates
    const pauseStart = new Date(start_date);
    const pauseEnd = new Date(end_date);
    const orderStart = new Date(activeOrder.start_date);
    const orderEnd = new Date(activeOrder.end_date);

    if (isNaN(pauseStart) || isNaN(pauseEnd)) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Invalid date format",
      });
    }

    if (pauseStart < orderStart || pauseEnd > orderEnd || pauseStart > pauseEnd) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Pause period must be within the order period and start date must be before end date!",
      });
    }

    // Check for overlapping pause periods
    const pausedPeriods = activeOrder.paused_periods || [];
    const overlap = pausedPeriods.some(
      (period) =>
        new Date(period.start_date) <= pauseEnd && new Date(period.end_date) >= pauseStart
    );

    if (overlap) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Pause period overlaps with existing paused periods",
      });
    }

    // Calculate paused days and refund amount
    const pausedDays = Math.ceil((pauseEnd - pauseStart) / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    const totalSubscriptionDays = Math.ceil((orderEnd - orderStart) / (1000 * 60 * 60 * 24)) + 1;
    const perDayCost = activeOrder.o_total / totalSubscriptionDays;
    const refundAmount = parseFloat((perDayCost * pausedDays).toFixed(2));

    // Update order with new pause period
    pausedPeriods.push({ start_date, end_date });
    await activeOrder.update(
      {
        status: "Paused",
        paused_periods: pausedPeriods,
      },
      { transaction: t }
    );

    // Process refund if refundDate is past (for testing or immediate pauses)
    const refundDate = new Date(pauseEnd);
    refundDate.setDate(refundDate.getDate() + 1);
    const currentDate = new Date();

    if (currentDate >= refundDate) {
      const user = await User.findByPk(uid, { transaction: t });
      await user.update(
        { wallet: user.wallet + refundAmount },
        { transaction: t }
      );

      await WalletReport.create(
        {
          uid,
          amt: refundAmount,
          message: `Refund for paused subscription order ${activeOrder.order_id} for ${pausedDays} days.`,
          transaction_no: activeOrder.order_id,
          tdate: new Date(),
          transaction_type: "Credited",
          status: 1,
        },
        { transaction: t }
      );

      // Send refund notification to user
      try {
        const notificationContent = {
          app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
          include_player_ids: [user.one_subscription],
          data: { user_id: user.id, type: "Subscription refund credited" },
          contents: {
            en: `${user.name}, ₹${refundAmount} has been credited to your wallet for paused order ${activeOrder.order_id}!`,
          },
          headings: { en: "Refund Credited!" },
        };
        await axios.post("https://onesignal.com/api/v1/notifications", notificationContent, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
          },
        });
      } catch (error) {
        console.error("User refund notification error:", error.message);
      }

      await Notification.create(
        {
          uid,
          datetime: new Date(),
          title: "Refund Credited",
          description: `₹${refundAmount} credited for paused order ${activeOrder.order_id}.`,
        },
        { transaction: t }
      );
    }

    // Fetch user for notifications
    const user = await User.findByPk(uid, { transaction: t });

    // Send pause notification to user
    try {
      const notificationContent = {
        app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
        include_player_ids: [user.one_subscription],
        data: { user_id: user.id, type: "Subscription order paused" },
        contents: {
          en: `${user.name}, Your subscription order has been paused from ${start_date} to ${end_date}!`,
        },
        headings: { en: "Subscription Order Paused!" },
      };
      await axios.post("https://onesignal.com/api/v1/notifications", notificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("User pause notification error:", error.message);
    }

    // Send pause notification to store
    try {
      const storeNotificationContent = {
        app_id: process.env.ONESIGNAL_STORE_APP_ID,
        include_player_ids: [store.one_subscription],
        data: { store_id: store.id, type: "subscription order paused" },
        contents: {
          en: `Subscription order paused! Order ID: ${activeOrder.order_id}`,
        },
        headings: { en: "Subscription Order Paused" },
      };
      await axios.post("https://onesignal.com/api/v1/notifications", storeNotificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_STORE_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("Store pause notification error:", error.message);
    }

    // Create pause notifications
    await Promise.all([
      Notification.create(
        {
          uid,
          datetime: new Date(),
          title: "Subscription Order Paused",
          description: `Your subscription order has been paused from ${start_date} to ${end_date}.`,
        },
        { transaction: t }
      ),
      Notification.create(
        {
          uid: store.id,
          datetime: new Date(),
          title: "Subscription Order Paused",
          description: `Subscription order paused! Order ID: ${activeOrder.order_id}`,
        },
        { transaction: t }
      ),
    ]);

    await t.commit();

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: `Subscription order paused successfully from ${start_date} to ${end_date}!`,
      refundAmount,
      refundDate: refundDate.toISOString().split("T")[0],
    });
  } catch (error) {
    await t.rollback();
    console.error("Error pausing subscription order:", error.message);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Server Error",
      error: error.message,
    });
  }
};

const ResumeSubscriptionOrder = async (req, res) => {
  const uid = req.user.userId;
  const { orderId } = req.body;

  if (!uid) {
    return res.status(401).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "Unauthorized",
    });
  }

  if (!orderId) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Order ID is required",
    });
  }

  const t = await sequelize.transaction();
  try {
    // Find paused order
    const pausedOrder = await SubscribeOrder.findOne({
      where: { id: orderId, uid, status: "Paused" },
      transaction: t,
    });

    if (!pausedOrder) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Paused order not found, not owned by user, or not paused",
      });
    }

    // Fetch store for notifications
    const store = await Store.findByPk(pausedOrder.store_id, { transaction: t });
    if (!store) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Store not found",
      });
    }

    // Fetch user for notifications and wallet updates
    const user = await User.findByPk(uid, { transaction: t });

    // Check if refund is due
    const latestPause = pausedOrder.paused_periods[pausedOrder.paused_periods.length - 1];
    const pauseEnd = new Date(latestPause.end_date);
    const refundDate = new Date(pauseEnd);
    refundDate.setDate(refundDate.getDate() + 1);
    const currentDate = new Date();

    if (currentDate >= refundDate) {
      const pauseStart = new Date(latestPause.start_date);
      const pausedDays = Math.ceil((pauseEnd - pauseStart) / (1000 * 60 * 60 * 24)) + 1;
      const orderStart = new Date(pausedOrder.start_date);
      const orderEnd = new Date(pausedOrder.end_date);
      const totalSubscriptionDays = Math.ceil((orderEnd - orderStart) / (1000 * 60 * 60 * 24)) + 1;
      const perDayCost = pausedOrder.o_total / totalSubscriptionDays;
      const refundAmount = parseFloat((perDayCost * pausedDays).toFixed(2));

      // Check if refund was already credited
      const existingRefund = await WalletReport.findOne({
        where: {
          uid,
          transaction_no: pausedOrder.order_id,
          transaction_type: "Credited",
          message: {
            [Op.like]: `%Refund for paused subscription order ${pausedOrder.order_id}%`,
          },
        },
        transaction: t,
      });

      if (!existingRefund) {
        await user.update(
          { wallet: user.wallet + refundAmount },
          { transaction: t }
        );

        await WalletReport.create(
          {
            uid,
            amt: refundAmount,
            message: `Refund for paused subscription order ${pausedOrder.order_id} for ${pausedDays} days.`,
            transaction_no: pausedOrder.order_id,
            tdate: new Date(),
            transaction_type: "Credited",
            status: 1,
          },
          { transaction: t }
        );

        // Send refund notification to user
        try {
          const notificationContent = {
            app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
            include_player_ids: [user.one_subscription],
            data: { user_id: user.id, type: "Subscription refund credited" },
            contents: {
              en: `${user.name}, ₹${refundAmount} has been credited to your wallet for paused order ${pausedOrder.order_id}!`,
            },
            headings: { en: "Refund Credited!" },
          };
          await axios.post("https://onesignal.com/api/v1/notifications", notificationContent, {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
            },
          });
        } catch (error) {
          console.error("User refund notification error:", error.message);
        }

        await Notification.create(
          {
            uid,
            datetime: new Date(),
            title: "Refund Credited",
            description: `₹${refundAmount} credited for paused order ${pausedOrder.order_id}.`,
          },
          { transaction: t }
        );
      }
    }

    // Resume order
    await pausedOrder.update(
      { status: "Active" },
      { transaction: t }
    );

    // Send resume notification to user
    try {
      const notificationContent = {
        app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
        include_player_ids: [user.one_subscription],
        data: { user_id: user.id, type: "Subscription order resumed" },
        contents: {
          en: `${user.name}, Your subscription order ${pausedOrder.order_id} has been resumed!`,
        },
        headings: { en: "Subscription Order Resumed!" },
      };
      await axios.post("https://onesignal.com/api/v1/notifications", notificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("User resume notification error:", error.message);
    }

    // Send resume notification to store
    try {
      const storeNotificationContent = {
        app_id: process.env.ONESIGNAL_STORE_APP_ID,
        include_player_ids: [store.one_subscription],
        data: { store_id: store.id, type: "subscription order resumed" },
        contents: {
          en: `Subscription order resumed! Order ID: ${pausedOrder.order_id}`,
        },
        headings: { en: "Subscription Order Resumed" },
      };
      await axios.post("https://onesignal.com/api/v1/notifications", storeNotificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_STORE_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("Store resume notification error:", error.message);
    }

    // Create resume notifications
    await Promise.all([
      Notification.create(
        {
          uid,
          datetime: new Date(),
          title: "Subscription Order Resumed",
          description: `Your subscription order ${pausedOrder.order_id} has been resumed.`,
        },
        { transaction: t }
      ),
      Notification.create(
        {
          uid: store.id,
          datetime: new Date(),
          title: "Subscription Order Resumed",
          description: `Subscription order resumed! Order ID: ${pausedOrder.order_id}`,
        },
        { transaction: t }
      ),
    ]);

    await t.commit();

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Subscription order resumed successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error resuming subscription order:", error.message);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
      error: error.message,
    });
  }
};

const AutoResumeSubscriptionOrder = async () => {
  console.log("Running auto-resume job for paused subscription orders...");
  const currentDate = new Date();
  const t = await sequelize.transaction();
  try {
    const pausedOrders = await SubscribeOrder.findAll({
      where: { status: "Paused" },
      transaction: t,
    });

    for (const order of pausedOrders) {
      const latestPause = order.paused_periods[order.paused_periods.length - 1];
      if (!latestPause) continue;

      const pauseEnd = new Date(latestPause.end_date);
      const refundDate = new Date(pauseEnd);
      refundDate.setDate(refundDate.getDate() + 1);

      if (currentDate < refundDate) continue;

      const pauseStart = new Date(latestPause.start_date);
      const pausedDays = Math.ceil((pauseEnd - pauseStart) / (1000 * 60 * 60 * 24)) + 1;
      const orderStart = new Date(order.start_date);
      const orderEnd = new Date(order.end_date);
      const totalSubscriptionDays = Math.ceil((orderEnd - orderStart) / (1000 * 60 * 60 * 24)) + 1;
      const perDayCost = order.o_total / totalSubscriptionDays;
      const refundAmount = parseFloat((perDayCost * pausedDays).toFixed(2));

      // Fetch user and store for notifications
      const user = await User.findByPk(order.uid, { transaction: t });
      const store = await Store.findByPk(order.store_id, { transaction: t });

      // Process refund if not already credited
      const existingRefund = await WalletReport.findOne({
        where: {
          uid: order.uid,
          transaction_no: order.order_id,
          transaction_type: "Credited",
          message: {
            [Op.like]: `%Refund for paused subscription order ${order.order_id}%`,
          },
        },
        transaction: t,
      });

      if (!existingRefund && user) {
        await user.update(
          { wallet: user.wallet + refundAmount },
          { transaction: t }
        );

        await WalletReport.create(
          {
            uid: order.uid,
            amt: refundAmount,
            message: `Refund for paused subscription order ${order.order_id} for ${pausedDays} days.`,
            transaction_no: order.order_id,
            tdate: new Date(),
            transaction_type: "Credited",
            status: 1,
          },
          { transaction: t }
        );

        // Send refund notification to user
        try {
          const notificationContent = {
            app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
            include_player_ids: [user.one_subscription],
            data: { user_id: user.id, type: "Subscription refund credited" },
            contents: {
              en: `${user.name}, ₹${refundAmount} has been credited to your wallet for paused order ${order.order_id}!`,
            },
            headings: { en: "Refund Credited!" },
          };
          await axios.post("https://onesignal.com/api/v1/notifications", notificationContent, {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
            },
          });
        } catch (error) {
          console.error("User refund notification error:", error.message);
        }

        await Notification.create(
          {
            uid: order.uid,
            datetime: new Date(),
            title: "Refund Credited",
            description: `₹${refundAmount} credited for paused order ${order.order_id}.`,
          },
          { transaction: t }
        );
      }

      // Resume order
      await order.update(
        { status: "Active" },
        { transaction: t }
      );

      // Send resume notification to user
      if (user) {
        try {
          const notificationContent = {
            app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
            include_player_ids: [user.one_subscription],
            data: { user_id: user.id, type: "Subscription order resumed" },
            contents: {
              en: `${user.name}, Your subscription order ${order.order_id} has been resumed!`,
            },
            headings: { en: "Subscription Order Resumed!" },
          };
          await axios.post("https://onesignal.com/api/v1/notifications", notificationContent, {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
            },
          });
        } catch (error) {
          console.error("User resume notification error:", error.message);
        }
      }

      // Send resume notification to store
      if (store) {
        try {
          const storeNotificationContent = {
            app_id: process.env.ONESIGNAL_STORE_APP_ID,
            include_player_ids: [store.one_subscription],
            data: { store_id: store.id, type: "subscription order resumed" },
            contents: {
              en: `Subscription order resumed! Order ID: ${order.order_id}`,
            },
            headings: { en: "Subscription Order Resumed" },
          };
          await axios.post("https://onesignal.com/api/v1/notifications", storeNotificationContent, {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Basic ${process.env.ONESIGNAL_STORE_API_KEY}`,
            },
          });
        } catch (error) {
          console.error("Store resume notification error:", error.message);
        }
      }

      // Create resume notifications
      await Promise.all([
        user &&
          Notification.create(
            {
              uid: order.uid,
              datetime: new Date(),
              title: "Subscription Order Resumed",
              description: `Your subscription order ${order.order_id} has been resumed.`,
            },
            { transaction: t }
          ),
        store &&
          Notification.create(
            {
              uid: store.id,
              datetime: new Date(),
              title: "Subscription Order Resumed",
              description: `Subscription order resumed! Order ID: ${order.order_id}`,
            },
            { transaction: t }
          ),
      ]);
    }

    await t.commit();
    console.log("Auto-resume job completed successfully.");
  } catch (error) {
    await t.rollback();
    console.error("Error in auto-resume job:", error.message);
  }
};

// Schedule daily at midnight
cron.schedule("0 0 * * *", AutoResumeSubscriptionOrder);



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
    const { orderId, product_id, weight_id } = req.body;
    const uid = req.user.userId;

    if (!uid) {
      return res.status(401).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "Unauthorized",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Order ID is required!",
      });
    }

    const t = await sequelize.transaction();
    const order = await SubscribeOrder.findOne({
      where: {
        id: orderId,
        uid: uid,
        status: { [Op.in]: ["Pending", "Processing", "Active"] },
      },
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Order not found, not owned by user, or not in cancellable status!",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Order is already cancelled",
      });
    }

    if (!order.start_date || !order.end_date) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Order start_date or end_date is invalid or missing!",
      });
    }

    const user = await User.findByPk(uid, { transaction: t });
    const store = await Store.findByPk(order.store_id, { transaction: t });
    if (!user || !store) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "User or Store not found!",
      });
    }

    console.log("User wallet balance:", { userId: uid, wallet: user.wallet });

    const setting = await Setting.findOne({ transaction: t });
    if (!setting) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Setting not found!",
      });
    }

    const deliveryCharge = parseFloat(setting.delivery_charges) || 0;
    const storeCharge = parseFloat(setting.store_charges) || 0;
    const tax = parseFloat(setting.tax) || 0;

    let refundAmount = 0;
    let refundMessage = [];
    let updatedSubtotal = parseFloat(order.subtotal) || 0;
    let updatedTotal = parseFloat(order.o_total) || 0;
    let isSingleProductCancellation = product_id && weight_id;

    const startDate = new Date(order.start_date);
    const endDate = new Date(order.end_date);
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);
    const pausedPeriods = order.paused_periods || [];

    const totalDeliveryDays = calculateDeliveryDays(startDate, endDate, order.days, pausedPeriods);
    const completedDeliveryDays = calculateDeliveryDays(
      startDate,
      currentDate < endDate ? currentDate : endDate,
      order.days,
      pausedPeriods
    );
    const remainingDeliveryDays = totalDeliveryDays - completedDeliveryDays;

    console.log("Delivery days calculation: ", {
      totalDeliveryDays,
      completedDeliveryDays,
      remainingDeliveryDays,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currentDate: currentDate.toISOString(),
    });

    if (totalDeliveryDays === 0) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "No delivery days in subscription schedule!",
      });
    }

    if (isSingleProductCancellation) {
      if (!product_id || !weight_id) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Both product_id and weight_id are required for single product cancellation!",
        });
      }

      const orderProduct = await SubscribeOrderProduct.findOne({
        where: { oid: orderId, product_id, weight_id },
        transaction: t,
      });

      if (!orderProduct) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Product not found in order!",
        });
      }

      const weight = await WeightOption.findByPk(weight_id, { transaction: t });
      if (!weight) {
        await t.rollback();
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Weight option not found!",
        });
      }

      const productPrice = orderProduct.price;
      const perDayCost = productPrice / totalDeliveryDays;
      refundAmount = perDayCost * remainingDeliveryDays;

      refundMessage.push(
        `Cancelled product ${product_id} (weight ${weight_id}): Refunded ₹${refundAmount.toFixed(2)} for ${remainingDeliveryDays} remaining days`
      );

      updatedSubtotal -= productPrice;
      updatedTotal = parseFloat(
        (
          updatedSubtotal +
          (order.o_type === "Delivery" ? deliveryCharge : 0) +
          storeCharge +
          tax -
          (order.cou_amt || 0)
        ).toFixed(2)
      );

      await orderProduct.destroy({ transaction: t });

      const remainingProducts = await SubscribeOrderProduct.findAll({
        where: { oid: orderId },
        transaction: t,
      });

      if (remainingProducts.length === 0) {
        await order.update({ status: "Cancelled", subtotal: 0, o_total: 0 }, { transaction: t });
      } else {
        await order.update({ subtotal: updatedSubtotal, o_total: updatedTotal }, { transaction: t });
      }

      console.log("Single product cancellation:", {
        product_id,
        weight_id,
        productPrice,
        perDayCost,
        refundAmount,
        updatedSubtotal,
        updatedTotal,
      });
    } else {
      const perDayCost = order.subtotal / totalDeliveryDays;
      refundAmount = perDayCost * remainingDeliveryDays;
      refundMessage.push(
        `Cancelled entire order ${orderId}: Refunded ₹${refundAmount.toFixed(2)} for ${remainingDeliveryDays} remaining days`
      );

      await order.update({ status: "Cancelled", subtotal: 0, o_total: 0 }, { transaction: t });

      await SubscribeOrderProduct.destroy({ where: { oid: orderId }, transaction: t });
      console.log("Entire order cancellation:", {
        order_subtotal: order.subtotal,
        perDayCost,
        refundAmount,
      });
    }

    if (refundAmount < 0) {
      await t.rollback();
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Calculated refund amount cannot be negative!",
      });
    }

    if (refundAmount > 0) {
      const updatedWallet = user.wallet + refundAmount;
      await user.update({ wallet: updatedWallet }, { transaction: t });

      await WalletReport.create(
        {
          uid,
          amt: refundAmount,
          message: `Refund for subscription order cancellation: ${refundMessage.join("; ")}.`,
          transaction_no: order.order_id,
          tdate: new Date(),
          transaction_type: "Credited",
          status: 1,
        },
        { transaction: t }
      );
    }

    try {
      const userNotificationContent = {
        app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
        include_player_ids: [user.one_subscription],
        data: { user_id: user.id, type: "Subscription order cancelled" },
        contents: { en: `${user.name}, Your subscription order (ID: ${order.order_id}) has been cancelled!` },
        headings: { en: "Subscription Order Cancelled!" },
      };
      await axios.post("https://onesignal.com/api/v1/notifications", userNotificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("User notification error:", error.message);
    }

    try {
      const storeNotificationContent = {
        app_id: process.env.ONESIGNAL_STORE_APP_ID,
        include_player_ids: [store.one_subscription],
        data: { store_id: store.id, type: "subscription order cancelled" },
        contents: { en: `Subscription order cancelled! Order ID: ${order.order_id}` },
        headings: { en: "Subscription Order Cancelled" },
      };
      await axios.post("https://onesignal.com/api/v1/notifications", storeNotificationContent, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_STORE_API_KEY}`,
        },
      });
    } catch (error) {
      console.error("Store notification error:", error.message);
    }

    await Promise.all([
      Notification.create(
        {
          uid,
          datetime: new Date(),
          title: "Subscription Order Cancelled",
          description: `Your subscription order (ID: ${order.order_id}) has been cancelled: ${refundMessage.join("; ")}.`,
        },
        { transaction: t }
      ),
      Notification.create(
        {
          uid: store.id,
          datetime: new Date(),
          title: "Subscription Order Cancelled",
          description: `Subscription order (ID: ${order.order_id}) has been cancelled.`,
        },
        { transaction: t }
      ),
    ]);

    await t.commit();

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: isSingleProductCancellation ? "Product cancelled successfully!" : "Subscription order cancelled successfully!",
      order_id: order.order_id,
      refund_amount: refundAmount,
      wallet_transaction_type: refundAmount > 0 ? "Credited" : "No Change",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error cancelling subscription order:", error.message);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Server Error",
      error: error.message,
    });
  }
};



function calculateDeliveryDays(startDate, endDate, days, pausedPeriods = []) {
  if (!(startDate instanceof Date)) startDate = new Date(startDate);
  if (!(endDate instanceof Date)) endDate = new Date(endDate);
  if (isNaN(startDate) || isNaN(endDate)) {
    console.error("Invalid dates in calculateDeliveryDays:", { startDate, endDate });
    return 0;
  }
  let deliveryDays = 0;
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
  endDate = new Date(endDate);
  endDate.setHours(23, 59, 59, 999); // Normalize to end of day
  while (currentDate <= endDate) {
    const dayName = currentDate.toLocaleString("en-US", { weekday: "long" });
    const isPaused = pausedPeriods.some((period) => {
      const pauseStart = new Date(period.start_date);
      const pauseEnd = new Date(period.end_date);
      pauseStart.setHours(0, 0, 0, 0);
      pauseEnd.setHours(23, 59, 59, 999);
      return currentDate >= pauseStart && currentDate <= pauseEnd;
    });
    if (days.includes(dayName) && !isPaused) {
      deliveryDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  console.log("calculateDeliveryDays:", { startDate, endDate, days, pausedPeriods, deliveryDays });
  return deliveryDays;
}

module.exports = {
  subscribeOrder,
  EditSubscriptionOrder,
  getOrdersByStatus,
  getOrderDetails,
  cancelOrder,
  PauseSubscriptionOrder,
  ResumeSubscriptionOrder,
  AutoResumeSubscriptionOrder
};
