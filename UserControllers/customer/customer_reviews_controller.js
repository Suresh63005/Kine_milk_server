const { Op } = require('sequelize');
const NormalOrder = require('../../Models/NormalOrder');
const NormalOrderProduct = require('../../Models/NormalOrderProduct');
const Product = require('../../Models/Product');
const Rider = require('../../Models/Rider');
const User = require('../../Models/User');
const WeightOption = require('../../Models/WeightOption');
const Review = require('../../Models/review');
const asyncHandler = require('../../middlewares/errorHandler');
const SubscribeOrder = require('../../Models/SubscribeOrder');
const SubscribeOrderProduct = require('../../Models/SubscribeOrderProduct');
const ProductReview = require('../../Models/ProductReview');

// const PostProductReview = asyncHandler(async (req, res) => {
//     const uid = req.user.userId; 

//     if (!uid) {
//         return res.status(401).json({ message: "Unauthorized! User not found." });
//     }

//     const { orderId, rateText, totalRate } = req.body;

//     if (!orderId || !rateText || !totalRate) {
//         return res.status(400).json({ message: "All Fields Required!" });
//     }

//     try {
//         // Fetch order with product_id
//         const order = await NormalOrder.findOne({
//             where: { id: orderId, uid: uid },
//             attributes: ['id', 'status', 'product_id'],
//             include: [{ model: Product, as: "ordered_product", attributes: ['id', 'title'] }] // Use updated alias
//         });
              
        
//         console.log("Fetched Order:", order);
        
//         if (!order) {
//             return res.status(403).json({ message: "Order not found or does not belong to you!" });
//         }
        
//         if (!order.product) {
//             return res.status(404).json({ message: "Order has no associated product!" });
//         }
        

//         if (order.status !== 'Completed') {
//             return res.status(403).json({ message: `You can only review delivered products! Current status: ${order.status}` });
//         }

//         // Fetch product details using product_id
//         const product = await Product.findOne({
//             where: { id: order.product_id },
//             attributes: ['id', 'title', 'img', 'description', 'normal_price', 'mrp_price', 'discount']
//         });

//         console.log("Fetched Product Data:", product);

//         if (!product) {
//             return res.status(404).json({ message: "Product not found!" });
//         }

//         // Update review fields
//         await NormalOrder.update(
//             {
//                 is_rate: 1,
//                 rate_text: rateText,
//                 total_rate: totalRate,
//                 review_date: new Date()
//             },
//             { where: { id: orderId } }
//         );

//         // Fetch updated review details
//         const updatedReview = await NormalOrder.findOne({
//             where: { id: orderId },
//             attributes: ['id', 'rate_text', 'total_rate', 'review_date']
//         });

//         // Fetch customer details
//         const customer = await User.findOne({
//             where: { id: uid },
//             attributes: ['id', 'name', 'email']
//         });

//         return res.status(200).json({ 
//             message: "Review submitted successfully!",
//             review: updatedReview,
//             customer,
//             product
//         });

//     } catch (error) {
//         console.error("Error posting review:", error);
//         return res.status(500).json({ message: "Error posting review: " + error.message });
//     }
// });

const PostProductReviewForInstantOrder = asyncHandler(async (req, res) => {
  const uid = req.user.userId;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized! User not found." });
  }

  const { storeId, orderId, reviews } = req.body;
  if (!orderId || !storeId || !reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json({ message: "All fields required! Provide orderId, storeId, and at least one review." });
  }

  try {
    const order = await NormalOrder.findOne({
      where: { id: orderId, uid },
      attributes: ["id", "status"],
      include: [
        {
          model: NormalOrderProduct,
          as: "NormalProducts",
          attributes: ["product_id"],
        },
      ],
    });

    console.log("Fetched Order:", order?.toJSON());

    if (!order) {
      return res.status(403).json({ message: "Order not found or does not belong to you!" });
    }

    if (!order.NormalProducts || order.NormalProducts.length === 0) {
      return res.status(404).json({ message: "Order has no associated products!" });
    }

    if (order.status !== "Completed") {
      return res.status(403).json({ message: `You can only review completed orders! Current status: ${order.status}` });
    }

    const orderProductIds = order.NormalProducts.map((p) => p.product_id);

    // Validate reviews
    for (const r of reviews) {
      if (!orderProductIds.includes(r.productId)) {
        return res.status(400).json({ message: `Product ${r.productId} is not part of this order!` });
      }
      // Prevent duplicate reviews for same order and product
      const existingReview = await ProductReview.findOne({
        where: { user_id: uid, order_id: orderId, product_id: r.productId },
      });
      if (existingReview) {
        return res.status(400).json({ message: `You already reviewed product ${r.productId} for this order!` });
      }
    }

    const createdReviews = await Promise.all(
      reviews.map(async (r) => {
        const product = await Product.findOne({
          where: { id: r.productId },
          attributes: ["id", "title", "img", "description", "discount", "cat_id"],
        });

        if (!product) {
          throw new Error(`Product with id ${r.productId} not found`);
        }

        const newReview = await ProductReview.create({
          user_id: uid,
          product_id: r.productId,
          store_id: storeId,
          order_id: orderId,
          category_id: product.cat_id,
          rating: r.totalRate,
          review: r.rateText,
          status: 1,
        });

        const allReviews = await ProductReview.findAll({
          where: { product_id: r.productId, status: 1 },
          attributes: ["rating"],
        });
        const totalRatings = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const avgRating = allReviews.length ? totalRatings / allReviews.length : 0;

        const productData = product.toJSON();
        productData.avgRating = avgRating;

        return {
          review: newReview,
          product: productData,
        };
      })
    );

    const customer = await User.findOne({
      where: { id: uid },
      attributes: ["id", "name", "email", "img"],
    });

    return res.status(200).json({
      message: "Reviews submitted successfully!",
      reviews: createdReviews,
      customer,
    });
  } catch (error) {
    console.error("Error posting review:", error.message);
    return res.status(500).json({ message: "Error posting review: " + error.message });
  }
});

const PostProductReviewForSubscribeOrder = asyncHandler(async (req, res) => {
  const uid = req.user.userId;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized! User not found." });
  }

  const { storeId, orderId, reviews } = req.body;
  if (!orderId || !storeId || !reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json({ message: "All fields required! Provide orderId, storeId, and at least one review." });
  }

  try {
    const order = await SubscribeOrder.findOne({
      where: { id: orderId, uid },
      attributes: ["id", "status"],
      include: [
        {
          model: SubscribeOrderProduct,
          as: "orderProducts",
          attributes: ["product_id"],
        },
      ],
    });

    console.log("Fetched Order:", order?.toJSON());

    if (!order) {
      return res.status(403).json({ message: "Order not found or does not belong to you!" });
    }

    if (!order.orderProducts || order.orderProducts.length === 0) {
      return res.status(404).json({ message: "Order has no associated products!" });
    }

    if (order.status !== "Completed") {
      return res.status(403).json({ message: `You can only review completed orders! Current status: ${order.status}` });
    }

    const orderProductIds = order.orderProducts.map((p) => p.product_id);

    // Validate reviews
    for (const r of reviews) {
      if (!orderProductIds.includes(r.productId)) {
        return res.status(400).json({ message: `Product ${r.productId} is not part of this order!` });
      }
      // Prevent duplicate reviews
      const existingReview = await ProductReview.findOne({
        where: { user_id: uid, order_id: orderId, product_id: r.productId },
      });
      if (existingReview) {
        return res.status(400).json({ message: `You already reviewed product ${r.productId} for this order!` });
      }
    }

    const createdReviews = await Promise.all(
      reviews.map(async (r) => {
        const product = await Product.findOne({
          where: { id: r.productId },
          attributes: ["id", "title", "img", "description", "discount", "cat_id"],
        });

        if (!product) {
          throw new Error(`Product with id ${r.productId} not found`);
        }

        const newReview = await ProductReview.create({
          user_id: uid,
          product_id: r.productId,
          store_id: storeId,
          order_id: orderId,
          category_id: product.cat_id,
          rating: r.totalRate,
          review: r.rateText,
          status: 1,
        });

        const allReviews = await ProductReview.findAll({
          where: { product_id: r.productId, status: 1 },
          attributes: ["rating"],
        });
        const totalRatings = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const avgRating = allReviews.length ? totalRatings / allReviews.length : 0;

        const productData = product.toJSON();
        productData.avgRating = avgRating;

        return {
          review: newReview,
          product: productData,
        };
      })
    );

    const customer = await User.findOne({
      where: { id: uid },
      attributes: ["id", "name", "email", "img"],
    });

    return res.status(200).json({
      message: "Reviews submitted successfully!",
      reviews: createdReviews,
      customer,
    });
  } catch (error) {
    console.error("Error posting review:", error.message);
    return res.status(500).json({ message: "Error posting review: " + error.message });
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

const gteDeliveryBoyReview = asyncHandler (async (req, res) => {

    const rider_id = req.body;

    try {

        const deliveryBoy = await Rider.findByPk(rider_id);

        if(!deliveryBoy){
            return res.status(404).json({ ResponseCode: "404",
                Result: "false",
                ResponseMsg: "Rider not Found!",
                 });
        }

        const reviews = await Review.findAll({
            where: {rider_id,status:1}
        });

        return res.status(200).json({
            ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Review Retrived successfully!",
        review: reviews,
        })
        
    } catch (error) {
        res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Server Error",
            error: error.message,
          });
    }
})

const FetchMyReviewsOnProducts = asyncHandler(async (req, res) => {
  const uid = req.user.userId;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized! User not found." });
  }

  try {
    const reviews = await ProductReview.findAll({
      where: { user_id: uid },
      attributes: ["id", "rating", "review", "order_id", "product_id", "createdAt"],
      include: [
        {
          model: NormalOrder,
          as: "normalOrder",
          attributes: ["id", "status", "createdAt"],
          where: { uid, status: "Completed" },
          required: false,
          include: [
            {
              model: NormalOrderProduct,
              as: "NormalProducts",
              attributes: ["product_id", "oid", "weight_id"],
              include: [
                {
                  model: Product,
                  as: "ProductDetails",
                  attributes: ["id", "title", "img", "description", "discount"],
                },
                {
                  model: WeightOption,
                  as: "productWeight",
                  attributes: ["id", "product_id", "weight", "subscribe_price", "normal_price", "mrp_price"],
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: SubscribeOrder,
          as: "subscribeOrder",
          attributes: ["id", "status", "createdAt"],
          where: { uid, status: "Completed" },
          required: false,
          include: [
            {
              model: SubscribeOrderProduct,
              as: "orderProducts",
              attributes: ["product_id", "oid", "weight_id"],
              include: [
                {
                  model: Product,
                  as: "productDetails",
                  attributes: ["id", "title", "img", "description", "discount"],
                },
                {
                  model: WeightOption,
                  as: "subscribeProductWeight",
                  attributes: ["id", "product_id", "weight", "subscribe_price", "normal_price", "mrp_price"],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]], // Latest reviews first
    });

    // Post-process to add orderType and consolidate ProductDetails
    const formattedReviews = reviews.map((review) => {
      const reviewData = review.toJSON();
      let orderType = null;
      let productDetails = null;
      let orderProducts = null;

      if (review.normalOrder && review.normalOrder.NormalProducts) {
        orderType = "Normal";
        productDetails = review.normalOrder.NormalProducts[0]?.ProductDetails || null;
        orderProducts = review.normalOrder.NormalProducts;
      } else if (review.subscribeOrder && review.subscribeOrder.orderProducts) {
        orderType = "Subscribe";
        productDetails = review.subscribeOrder.orderProducts[0]?.productDetails || null;
        orderProducts = review.subscribeOrder.orderProducts;
      }

      return {
        ...reviewData,
        orderType,
        productDetails,
        normalOrder: reviewData.normalOrder
          ? { ...reviewData.normalOrder, NormalProducts: orderProducts }
          : null,
        subscribeOrder: reviewData.subscribeOrder
          ? { ...reviewData.subscribeOrder, orderProducts }
          : null,
      };
    });

    if (formattedReviews.length === 0) {
      return res.status(404).json({ message: "No reviews found!" });
    }

    return res.status(200).json({ message: "Reviews fetched successfully", reviews: formattedReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    return res.status(500).json({ message: "Internal server error: " + error.message });
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
