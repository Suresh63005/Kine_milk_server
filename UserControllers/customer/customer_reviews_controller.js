const { Op } = require('sequelize');
const NormalOrder = require('../../Models/NormalOrder');
const NormalOrderProduct = require("../../Models/NormalOrderProduct");
const Product = require('../../Models/Product');
const Rider = require('../../Models/Rider');
const User = require('../../Models/User');
const WeightOption = require('../../Models/WeightOption');
const Review = require('../../Models/review');
const asyncHandler = require('../../middlewares/errorHandler');
const SubscribeOrder = require('../../Models/SubscribeOrder');
const SubscribeOrderProduct = require('../../Models/SubscribeOrderProduct');
const ProductReview = require('../../Models/ProductReview');

const PostProductReviewForInstantOrder = asyncHandler(async (req, res) => {
  const uid = req.user.userId;
  if (!uid) {
    return res.status(401).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "Unauthorized! User not found.",
    });
  }

  const { storeId, reviews } = req.body;
  if (!storeId || !reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Store ID and at least one review are required!",
    });
  }

  try {
    // Validate and create reviews
    const createdReviews = await Promise.all(
      reviews.map(async (r) => {
        // Validate review fields
        if (!r.productId || !r.totalRate || !r.rateText) {
          throw new Error("Product ID, rating, and review text are required!");
        }

        // Validate product exists
        const product = await Product.findOne({
          where: { id: r.productId },
          attributes: ["id", "title", "img", "description", "discount", "cat_id"],
        });

        if (!product) {
          throw new Error(`Product with ID ${r.productId} not found`);
        }

        // Check if the product was ordered in a completed NormalOrder
        const orderProduct = await NormalOrderProduct.findOne({
          where: { product_id: r.productId },
          include: [
            {
              model: NormalOrder,
              as: "NormalProducts",
              where: { uid, status: "Completed" },
              attributes: ["id", "store_id"],
            },
          ],
        });

        if (!orderProduct || !orderProduct.NormalProducts) {
          throw new Error(
            `Product ${r.productId} has not been ordered in any completed instant order!`
          );
        }

        // Validate store
        if (orderProduct.NormalProducts.store_id !== storeId) {
          throw new Error(
            `Product ${r.productId} was not ordered from store ${storeId}!`
          );
        }

        // Create review (no duplicate check, per subscription controller)
        const newReview = await ProductReview.create({
          user_id: uid,
          product_id: r.productId,
          store_id: storeId,
          order_id: orderProduct.NormalProducts.id,
          category_id: product.cat_id,
          rating: r.totalRate,
          review: r.rateText,
          status: 1,
        });

        // Calculate average rating
        const allReviews = await ProductReview.findAll({
          where: { product_id: r.productId, status: 1 },
          attributes: ["rating"],
        });
        const totalRatings = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const avgRating = allReviews.length
          ? Number((totalRatings / allReviews.length).toFixed(1))
          : 0;

        const productData = product.toJSON();
        productData.avgRating = avgRating;

        return {
          review: newReview,
          product: productData,
        };
      })
    );

    // Fetch customer details
    const customer = await User.findOne({
      where: { id: uid },
      attributes: ["id", "name", "email", "img"],
    });

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Reviews submitted successfully!",
      reviews: createdReviews,
      customer,
    });
  } catch (error) {
    console.error("Error posting review:", error.message);
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: `Error posting review: ${error.message}`,
    });
  }
});


const PostProductReviewForSubscribeOrder = asyncHandler(async (req, res) => {
  const uid = req.user.userId;
  if (!uid) {
    return res.status(401).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "Unauthorized! User not found.",
    });
  }

  const { storeId, reviews } = req.body;
  if (!storeId || !reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Store ID and at least one review are required!",
    });
  }

  try {
    // Validate and create reviews
    const createdReviews = await Promise.all(
      reviews.map(async (r) => {
        // Validate review fields
        if (!r.productId || !r.totalRate || !r.rateText) {
          throw new Error("Product ID, rating, and review text are required!");
        }

        // Validate product exists
        const product = await Product.findOne({
          where: { id: r.productId },
          attributes: ["id", "title", "img", "description", "discount", "cat_id"],
        });

        if (!product) {
          throw new Error(`Product with ID ${r.productId} not found`);
        }

        // Check if the product was ordered in a completed SubscribeOrder
        const orderProduct = await SubscribeOrderProduct.findOne({
          where: { product_id: r.productId },
          include: [
            {
              model: SubscribeOrder,
              as: "orderDetails",
              where: { uid, status: "Completed" },
              attributes: ["id", "store_id"],
            },
          ],
        });

        if (!orderProduct || !orderProduct.orderDetails) {
          throw new Error(
            `Product ${r.productId} has not been ordered in any completed subscription order!`
          );
        }

        // Validate store
        if (orderProduct.orderDetails.store_id !== storeId) {
          throw new Error(
            `Product ${r.productId} was not ordered from store ${storeId}!`
          );
        }

        // Create review (no duplicate check)
        const newReview = await ProductReview.create({
          user_id: uid,
          product_id: r.productId,
          store_id: storeId,
          order_id: orderProduct.orderDetails.id,
          category_id: product.cat_id,
          rating: r.totalRate,
          review: r.rateText,
          status: 1,
        });

        // Calculate average rating
        const allReviews = await ProductReview.findAll({
          where: { product_id: r.productId, status: 1 },
          attributes: ["rating"],
        });
        const totalRatings = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const avgRating = allReviews.length
          ? Number((totalRatings / allReviews.length).toFixed(1))
          : 0;

        const productData = product.toJSON();
        productData.avgRating = avgRating;

        return {
          review: newReview,
          product: productData,
        };
      })
    );

    // Fetch customer details
    const customer = await User.findOne({
      where: { id: uid },
      attributes: ["id", "name", "email", "img"],
    });

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Reviews submitted successfully!",
      reviews: createdReviews,
      customer,
    });
  } catch (error) {
    console.error("Error posting review:", error.message);
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: `Error posting review: ${error.message}`,
    });
  }
});
    

const PostDeliveryBoyReview = asyncHandler (async (req, res) => {
    
    const user_id = req.user.userId; 

    if (!user_id) {
        return res.status(401).json({ message: "Unauthorized! User not found." });
    }

    const{rider_id,rating,review,store_id,order_id,order_type} = req.body;

    if (!rider_id || !rating || !review || !store_id || !order_id) {
        return res.status(400).json({ message: "All Fields Required!" });
    }
    try {
       
        const deliveryBoy = await Rider.findByPk(rider_id);

        if(!deliveryBoy){
            return res.status(404).json({ message: "Delivery Boy Not Found!" });
        }

        const createreview = await Review.create({
            user_id: user_id,
            rider_id: rider_id,
            rating: rating,
            review: review,
            store_id:store_id,
            order_id:order_id,
            order_type:order_type

        });

        return res.status(200).json({ 
            ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Review submitted successfully!",
        review: createreview,
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

});


const FetchMyReviewsOnProducts = asyncHandler(async (req, res) => {
  const uid = req.user.userId;
  if (!uid) {
    return res.status(401).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "Unauthorized! User not found.",
    });
  }

  try {
    // Fetch all product reviews for the user
    const productReviews = await ProductReview.findAll({
      where: { user_id: uid, status: 1 },
    });

    // Extract unique order_ids from product reviews
    const orderIds = [...new Set(productReviews.map((pr) => pr.order_id))];

    if (orderIds.length === 0) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "No orders with product reviews found!",
      });
    }

    // Fetch NormalOrders with reviews
    const normalOrders = await NormalOrder.findAll({
      where: {
        uid,
        status: "Completed",
        id: orderIds,
      },
      include: [
        {
          model: NormalOrderProduct,
          as: "NormalProducts",
          attributes:["product_id"],
          include: [
            {
              model: Product,
              as: "ProductDetails",
              attributes:["id"],
            },
            {
              model: WeightOption,
              as: "productWeight",
              required: false,
            },
          ],
        },
        {
          model: Review,
          as: "normalorderdeliveryreview",
          where: { user_id: uid, status: 1, order_type: "normal" },
          required: false,
        },
      ],
    });

    // Fetch SubscribeOrders with reviews
    const subscribeOrders = await SubscribeOrder.findAll({
      where: {
        uid,
        status: "Completed",
        id: orderIds,
      },
      include: [
        {
          model: SubscribeOrderProduct,
          as: "orderProducts",
          include: [
            {
              model: Product,
              as: "productDetails",
            },
            {
              model: WeightOption,
              as: "subscribeProductWeight",
              required: false,
            },
          ],
        },
        {
          model: Review,
          as: "suborderdeliveryreview",
          where: { user_id: uid, status: 1, order_type: "subscribe" },
          required: false,
        },
      ],
    });

    // Structure the response
    const orders = [];

    // Process NormalOrders
    for (const order of normalOrders) {
      const orderData = order.toJSON();
      const products = orderData.NormalProducts.map((np) => {
        const productReviewsForThisProduct = productReviews
          .filter(
            (pr) => pr.product_id === np.product_id && pr.order_id === order.id
          )
          .map((pr) => pr.toJSON());

        return {
          ...np.ProductDetails,
          weight: np.productWeight || null,
          reviews: productReviewsForThisProduct,
        };
      });

      // Only include orders with at least one product review
      if (products.some((p) => p.reviews.length > 0)) {
        orders.push({
          ...orderData,
          products,
        });
      }
    }

    // Process SubscribeOrders
    for (const order of subscribeOrders) {
      const orderData = order.toJSON();
      const products = orderData.orderProducts.map((sp) => {
        const productReviewsForThisProduct = productReviews
          .filter(
            (pr) => pr.product_id === sp.product_id && pr.order_id === order.id
          )
          .map((pr) => pr.toJSON());

        return {
          ...sp.productDetails,
          weight: sp.subscribeProductWeight || null,
          reviews: productReviewsForThisProduct,
        };
      });

      // Only include orders with at least one product review
      if (products.some((p) => p.reviews.length > 0)) {
        orders.push({
          ...orderData,
          products,
        });
      }
    }

    // Sort orders by createdAt DESC
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (orders.length === 0) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "No orders with product reviews found!",
      });
    }

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Reviews and orders fetched successfully!",
      orders,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: `Internal server error: ${error.message}`,
    });
  }
});

const FetchMyReviewsOnDeliveryBoys = asyncHandler(async (req, res) => {
  const uid = req.user.userId;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized! User not found." });
  }
  
  try {
    const reviews = await Review.findAll({
      where: { user_id: uid, },
      attributes: ['id', 'rating', 'review', 'order_id', 'rider_id', 'store_id', 'order_type'],
      include: [
        {
          model: Rider,
          as: 'rider',
          attributes: ['id', 'title', 'img']
        },
        {
          model: User,
          as: "user",
          attributes: ['id', 'name', 'email', 'img'],
          where: { id: uid }
        },
        {
          model: NormalOrder,
          as: "normalorderdeliveryreview",
          where: { uid: uid, status: "Completed" },
          attributes: ['id', 'status'],
          required: false,
          include: [
            {
              model: NormalOrderProduct,
              as: 'NormalProducts',
              attributes: ['product_id', 'weight_id', 'pquantity', 'price'],
              include: [
                {
                  model: Product,
                  as: 'ProductDetails',
                  attributes: ['id', 'title', 'img', 'description', 'discount'],
                  include: [
                    {
                      model: WeightOption,
                      as: 'weightOptions',
                      attributes: ['id', 'weight', 'subscribe_price', 'normal_price', 'mrp_price'],
                      where: {
                        id: { [Op.col]: 'normalorderdeliveryreview.NormalProducts.weight_id' }
                      },
                      required: false
                    }
                  ]
                }
              ]
            }
          ]
        },
        // {
        //   model: SubscribeOrder,
        //   as: "suborderdeliveryreview",
        //   where: { uid: uid, status: "Completed" },
        //   attributes: ['id', 'status',],
        //   required: false,
        //   include: [
        //     {
        //       model: SubscribeOrderProduct,
        //       as: 'orderProducts',
        //       attributes: ['product_id', 'weight_id', 'pquantity', 'price'],
        //       include: [
        //         {
        //           model: Product,
        //           as: 'productDetails',
        //           attributes: ['id', 'title', 'img', 'description', 'discount'],
        //           include: [
        //             {
        //               model: WeightOption,
        //               as: 'weightOptions',
        //               attributes: ['id', 'weight', 'subscribe_price', 'normal_price', 'mrp_price'],
        //               where: {
        //                 id: { [Op.col]: 'suborderdeliveryreview.orderProducts.weight_id' }
        //               },
        //               required: false
        //             }
        //           ]
        //         }
        //       ]
        //     }
        //   ]
        // }
      ]
    });

    if (reviews.length === 0) {
      return res.status(404).json({ message: "No Reviews Found!" });
    }

    return res.status(200).json({ message: "Reviews fetched successfully", reviews });
  } catch (error) {
    console.error("Error Occurs while fetching reviews:", error);
    return res.status(500).json({ message: "Internal server error: " + error.message });
  }
});

module.exports = {
  PostProductReviewForInstantOrder,
  PostProductReviewForSubscribeOrder,
  PostDeliveryBoyReview,
  FetchMyReviewsOnProducts,
  FetchMyReviewsOnDeliveryBoys,
};
