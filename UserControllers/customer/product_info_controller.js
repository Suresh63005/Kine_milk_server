const { where } = require("sequelize");
const Product = require("../../Models/Product");
const ProductImage = require("../../Models/productImages");
const Category = require("../../Models/Category");
const WeightOption = require("../../Models/WeightOption");

const productInfo = async (req, res) => {
    try {
        const {  pid } = req.body;
        

        if ( !pid) {
            return res.status(400).json({
                ResponseCode: "401",
                Result: "false",
                ResponseMsg: "Something Went Wrong!"
            });
        }

        // Fetch the product
        const product = await Product.findOne({
          where: { id: pid },
          include: [
            {
                model:Category,
                as:"category",
                attributes:["id","title"]
            },
            {
              model: ProductImage,
              as: "extraImages",
              attributes: ["img"],
              required: false,
            },
            {
                model: WeightOption,
                as: "weightOptions", // Alias for the association (ensure this matches your model definition)
                attributes: ["weight", "subscribe_price", "normal_price", "mrp_price"], // Select specific fields
              }
          ],
        });

        if (!product) {
            return res.status(404).json({
                ResponseCode: "404",
                Result: "false",
                ResponseMsg: "Product Not Found!"
            });
        }

        return res.json({
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "Product Information Get Successfully!",
            ProductData: product
        });

    } catch (error) {
        console.error("Error fetching product information:", error);
        return res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Internal Server Error"
        });
    }
}


module.exports = productInfo;