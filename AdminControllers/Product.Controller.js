const Product=require("../Models/Product");
const {Op}=require("sequelize")
const asyncHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/awss3Config");
const uploadToS3 = require("../config/fileUpload.aws");
const { upsertProductSchema } = require("../utils/validation");

const upsertProduct = async (req, res) => {
  try {
    const {
      id,
      title,
      status,
      cat_id,
      discount,
      normal_price,
      subscribe_price,
      subscription_required,
      out_of_stock,
      description,
    } = req.body;

    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files); // Log the files to debug

    const store_id = 1;

    const files = req.files;
    const img = files?.img?.[0] || null;  // Get the first image file (ensure it's the right format)
    const ext_img = Array.isArray(files?.ext_img) ? files.ext_img : [];  // Ensure ext_img is always an array

    if (!img) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Main image (img) is required for a new product.",
      });
    }

    // Log to check how many external images are there
    console.log("External Images (ext_img):", ext_img);

    // Upload to S3
    const imgURL = await uploadToS3([img], "product-images"); // Upload main image (always an array)
    console.log("Main Image URL:", imgURL);

    // Upload external images if they exist
    const ext_imgURLs = ext_img.length ? await uploadToS3(ext_img, "product-images") : []; // Upload external images
    console.log("External Image URLs:", ext_imgURLs);

    // If product ID exists, update existing product
    let product;
    if (id) {
      product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Product not found.",
        });
      }

      await product.update({
        title,
        img: imgURL[0],  // Use the first URL from the uploaded image array
        ext_img: JSON.stringify(ext_imgURLs),  // Convert external images array to JSON string
        status,
        cat_id,
        discount,
        normal_price,
        subscribe_price,
        subscription_required,
        out_of_stock,
        description,
        store_id,
      });

      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Product updated successfully.",
        product,
      });
    } else {
      // Create new product if no ID is provided
      product = await Product.create({
        title,
        img: imgURL[0],  // Use the first URL from the uploaded image array
        ext_img: JSON.stringify(ext_imgURLs),  // Convert external images array to JSON string
        status,
        cat_id,
        discount,
        normal_price,
        subscribe_price,
        subscription_required,
        out_of_stock,
        description,
        store_id,
      });

      return res.status(201).json({
        ResponseCode: "201",
        Result: "true",
        ResponseMsg: "Product created successfully.",
        product,
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
    });
  }
};


const getAllProducts=asyncHandler(async(req,res,next)=>{
    const Products=await Product.findAll();
    logger.info('successfully get all products')
    res.status(200).json(Products);
});

const getProductCount=asyncHandler(async(req,res)=>{
    const ProductCount=await Product.count();
    const Products=await Product.findAll();
    logger.info('product counted successfully')
    res.status(200).json({Products,Product:ProductCount})
});

const getProductById=asyncHandler(async(req,res)=>{
    // const {error}=getproductByIdSchema.validate(req.params)
    // if (error) {
    //     logger.error(error.details[0].message)
    //     return res.status(400).json({ error: error.details[0].message });
    // }
    const {id}=req.params;
    const product=await Product.findOne({where:{id:id}});
    if(!product){
        logger.error('Product not found')
        return res.status(404).json({error:"Product not found"})
    }
    res.status(200).json(product)
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { forceDelete } = req.body;

        const Product = await Product.findOne({ where: { id }, paranoid: false });

        if (!Product) {
            logger.error('')
            return res.status(404).json({ error: "Product not found" });
        }

        if (Product.deletedAt && forceDelete !== "true") {
            logger.error('Product is already soft-deleted. Use forceDelete=true to permanently delete it.')
            return res.status(400).json({ error: "Product is already soft-deleted. Use forceDelete=true to permanently delete it." });
        }

        if (forceDelete === "true") {
            await Product.destroy({ force: true });
            logger.info('Product permanently deleted successfully')
            return res.status(200).json({ message: "Product permanently deleted successfully" });
        }

        await Product.destroy();
        logger.info('Product soft deleted successfully')
        return res.status(200).json({ message: "Product soft deleted successfully" });
});

const searchProduct=asyncHandler(async(req,res)=>{
    const {id,title}=req.body;
        const whereClause={};
        if(id){
            whereClause.id=id;
        }

        if(title && title.trim()!=""){
            whereClause.title={[Sequelize.Op.like]: `%${title.trim()}%`};
        }

        const Product=await Product.findAll({where:whereClause});

        if(Product.length === 0){
            logger.error('No matching admins found')
            return res.status(404).json({ error: "No matching admins found" });
        }
        res.status(200).json(Product)
});

const toggleproductStatus = async (req, res) => {
    console.log("Request received:", req.body);
  
    const { id, value } = req.body;
  
    try {
      const product = await Product.findByPk(id);
  
      if (!product) {
        console.log("product not found");
        return res.status(404).json({ message: "product not found." });
      }
  
      product.status = value;
      await product.save();
  
      console.log("product updated successfully:", product);
      res.status(200).json({
        message: "product status updated successfully.",
        updatedStatus: product.status,
      });
    } catch (error) {
      console.error("Error updating product status:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };

module.exports={upsertProduct,getAllProducts,getProductCount,getProductById,deleteProduct,searchProduct,toggleproductStatus}