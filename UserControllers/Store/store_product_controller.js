const Product = require("../../Models/Product");
const Category = require("../../Models/Category"); // Import Category Model
const asyncHandler = require("../../middlewares/errorHandler");
const { Op, Sequelize } = require("sequelize");
const Store = require("../../Models/Store");
const NormalOrder = require("../../Models/NormalOrder");
const User = require("../../Models/User");

const AllProducts = asyncHandler(async (req, res) => {
  try {
    console.log("Decoded User:", req.user);

    const uid = req.user.userId;
    if (!uid) {
      return res.status(400).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "User ID not provided",
      });
    }

    console.log("Fetching products for user ID:", uid);

    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "title"],
        },
      ],
    });

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Products fetched successfully",
      Data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
      Error: error.message,
    });
  }
});

const ViewSingleProduct = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);

  const uid = req.user.userId;
  if (!uid) {
    return res.status(400).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "User ID not provided",
    });
  }

  console.log("Fetching products for user ID:", uid);
  const { productId } = req.params; 
  try {
    if (!productId) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Product ID is required",
      });
    }

    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "title"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Product not found",
      });
    }

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Product fetched successfully",
      Data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
      Error: error.message,
    });
  }
});

const GetProductsByCategory = asyncHandler(async(req,res)=>{
  console.log("Decoded User:", req.user);

  const uid = req.user.userId;
  if (!uid) {
    return res.status(400).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "User ID not provided",
    });
  }

  console.log("Fetching products for user ID:", uid);

  const {categoryId}=req.params;
  try {
    if (!categoryId) {
        return res.status(400).json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "Category ID is required",
        });
    }

    const products = await Product.findAll({
        where: { cat_id: categoryId },
        include: [
            {
                model: Category,
                as: "category",
                attributes: ["id", "title"],
            },
        ],
    });

    if (products.length === 0) {
        return res.status(404).json({
            ResponseCode: "404",
            Result: "false",
            ResponseMsg: "No products found for this category",
        });
    }

    return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Products fetched successfully",
        Data: products,
    });

} catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Internal Server Error",
        Error: error.message,
    });
}
})

const SearchProductByTitle = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);

  const uid = req.user.userId;
  if (!uid) {
    return res.status(400).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "User ID not provided",
    });
  }

  console.log("Fetching products for user ID:", uid);
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Product name is required",
    });
  }

  try {
    const products = await Product.findAll({
      where: {
        title: {
          [Op.like]: `%${title}%`, // Case-insensitive partial match
        },
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "title"], // Include category ID and title
        },
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "No matching products found",
      });
    }

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Products fetched successfully",
      Data: products,
    });

  } catch (error) {
    console.error("Error searching for products:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
      Error: error.message,
    });
  }
});

const FetchAllProductReviews = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);

  const uid = req.user?.userId;
  if (!uid) {
      return res.status(400).json({
          ResponseCode: "401",
          Result: "false",
          ResponseMsg: "User ID not provided",
      });
  }

  console.log("Fetching reviews for user ID:", uid);

  const { storeId } = req.params;
  if (!storeId) {
      return res.status(400).json({ message: "Store ID is required!" });
  }

  try {
      const reviews = await NormalOrder.findAll({
          where: { is_rate: 1, store_id: storeId },
          attributes: ["id", "uid", "odate","rate_text", "total_rate", "createdAt"],
          include: [
              {
                  model: Product, 
                  as:"product",
                  attributes: ["title", "img"],
              },
              { 
                  model: User,
                  as:"user",
                  attributes: ["name",],
              },
          ],
      });

      if (!reviews.length) {
          return res.status(404).json({ message: "No reviews found for this store." });
      }

      return res.status(200).json({
          success: true,
          message: "Reviews fetched successfully",
          reviews,
      });

  } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

const ViewProductReviews = asyncHandler(async(req,res)=>{
  console.log("Decoded User:", req.user);

  const uid = req.user?.userId;
  if (!uid) {
      return res.status(400).json({
          ResponseCode: "401",
          Result: "false",
          ResponseMsg: "User ID not provided",
      });
  }

  console.log("Fetching reviews for user ID:", uid);

  const { storeId, productId } = req.body;
  if (!storeId) {
      return res.status(400).json({ message: "Store ID is required!" });
  }

  try {
      // Fetch Reviews with Product & User details
      const reviews = await NormalOrder.findAll({
          where: { 
              is_rate: 1, 
              store_id: storeId,
              ...(productId && { product_id: productId }) // Apply filter if productId is provided
          },
          attributes: ["id", "uid", "odate", "rate_text", "total_rate", "createdAt"],
          include: [
              {
                  model: Product,
                  as: "product",
                  attributes: ["title", "img"],
              },
              {
                  model: User,
                  as: "user",
                  attributes: ["name"],
              },
          ],
      });

      if (!reviews.length) {
          return res.status(404).json({ message: "No reviews found for this store." });
      }

      // Aggregate Ratings Data for the Product
      const ratingStats = await NormalOrder.findAll({
          where: { 
              is_rate: 1, 
              store_id: storeId,
              ...(productId && { product_id: productId }) // Apply filter if productId is provided
          },
          attributes: [
              [Sequelize.fn("AVG", Sequelize.col("total_rate")), "average_rating"], // Calculate average rating
              [Sequelize.fn("COUNT", Sequelize.col("id")), "total_reviews"], // Count total reviews
              [Sequelize.literal(`SUM(CASE WHEN total_rate = 1 THEN 1 ELSE 0 END)`), "1"],
              [Sequelize.literal(`SUM(CASE WHEN total_rate = 2 THEN 1 ELSE 0 END)`), "2"],
              [Sequelize.literal(`SUM(CASE WHEN total_rate = 3 THEN 1 ELSE 0 END)`), "3"],
              [Sequelize.literal(`SUM(CASE WHEN total_rate = 4 THEN 1 ELSE 0 END)`), "4"],
              [Sequelize.literal(`SUM(CASE WHEN total_rate = 5 THEN 1 ELSE 0 END)`), "5"],
          ],
      });

      return res.status(200).json({
          success: true,
          message: "Reviews fetched successfully",
          ratingSummary: ratingStats[0], // Aggregated rating data
          reviews,
      });

  } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
})

module.exports = { 
  AllProducts,
  ViewSingleProduct,
  GetProductsByCategory,
  SearchProductByTitle,
  FetchAllProductReviews,
  ViewProductReviews
 };
