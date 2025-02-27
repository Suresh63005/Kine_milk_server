const ProductImages=require("../Models/Photo");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { ProductImagesByIdSchema, ProductImagesDeleteSchema, ProductImagesSearchSchema} = require("../utils/validation");


// const getAllProductImages=asynHandler(async(req,res,next)=>{
//     const Photo=await ProductImages.findAll();
//     logger.info("sucessfully get all ProductImages");
//     res.status(200).json(Photo);
// });

const upsertProductImages = async (req, res) => {
    const { product_id, status } = req.body; // Getting data from the body
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);
  
    const add_user_id = 1; // Assuming this is the logged-in user or something similar
  
    try {
      // Handling file uploads (if any)
      const files = req.files;
      const img = files?.img ? (Array.isArray(files.img) ? files.img : [files.img]) : [];
  
      let product_imgUrls = [];
  
      // If there are images to upload, we upload them to S3 or other cloud storage
      if (files && files.img) {
        product_imgUrls = await uploadToS3(img, "Product-Images");
        if (!Array.isArray(product_imgUrls)) {
          product_imgUrls = [product_imgUrls]; // If only one image is uploaded, convert it to an array
        }
      }
  
      // Check if the product image already exists
      if (product_id) {
        const productImage = await ProductImages.findOne({ where: { product_id } });
  
        // If the product image exists, update it
        if (productImage) {
          productImage.status = status;
          productImage.add_user_id = add_user_id;
  
          await productImage.save();
  
          // If there are new images, delete the old images and upload the new ones
          if (product_imgUrls.length > 0) {
            // Remove previous images related to this product
            await ProductImages.destroy({ where: { product_id } });
  
            // Insert new images
            const newImages = product_imgUrls.map(url => ({ product_id, url }));
            await ProductImages.bulkCreate(newImages);
          }
  
          return res.status(200).json({ message: "Product image updated successfully", productImage });
        } else {
          return res.status(404).json({ error: "Product image not found" });
        }
      } else {
        // If product image doesn't exist, create a new one
        const newProductImage = await ProductImages.create({
          product_id,
          status,
          add_user_id,
        });
  
        // If there are new images to associate, insert them into the ProductImages table
        if (product_imgUrls.length > 0) {
          const newImages = product_imgUrls.map(url => ({ product_id: newProductImage.id, url }));
          await ProductImages.bulkCreate(newImages);
        }
  
        return res.status(201).json({ message: "Product image added successfully", newProductImage });
      }
    } catch (error) {
      console.error("Error in upsertProductImages:", error);
      return res.status(500).json({ error: "Internal server error", details: error.message });
    }
  };
  
const getProductImagesCount=asynHandler(async(req,res)=>{
    const ProductImagesCount=await ProductImages.count();
    const categories=await ProductImages.findAll();
    logger.info("categories",ProductImagesCount)
    res.status(200).json({categories,ProductImages:ProductImagesCount})
});

const getProductImagesById=asynHandler(async(req,res)=>{
    const {error}=ProductImagesByIdSchema.validate(req.params)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
    }

    const {id}=req.params;
    const getById=await ProductImages.findOne({where:{id:id}});
    if(!getById){
        logger.error('ProductImages not found')
        return res.status(404).json({error:"ProductImages not found"})
    }
    logger.info("ProductImages found");
    res.status(200).json(getById)
});

const deleteProductImages = asynHandler(async (req, res) => {
    const dataToValidate = { ...req.params, ...req.body };

    const { error } = ProductImagesDeleteSchema.validate(dataToValidate);
    if (error) {
        logger.error(error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;
    const { forceDelete } = req.body;

    const getProductImagesById = await ProductImages.findOne({ where: { id }, paranoid: false });

    if (!getProductImagesById) {
        logger.error("ProductImages not found");
        return res.status(404).json({ error: "ProductImages not found" });
    }

    if (getProductImagesById.deletedAt && forceDelete !== "true") {
        logger.error("ProductImages is already soft-deleted");
        return res.status(400).json({
            error: "ProductImages is already soft-deleted. Use forceDelete=true to permanently delete it.",
        });
    }

    if (forceDelete === "true") {
        await getProductImagesById.destroy({ force: true });
        logger.info("ProductImages permanently deleted");
        return res.status(200).json({ message: "ProductImages permanently deleted successfully" });
    }

    await getProductImagesById.destroy();
    logger.info("ProductImages soft-deleted");
    return res.status(200).json({ message: "ProductImages soft deleted successfully" });
});


const searchProductImages=asynHandler(async(req,res)=>{
    const {error}=ProductImagesSearchSchema.validate(req.body);
    if(error){
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
    }
    const {id,title}=req.body;
        const whereClause={};
        if(id){
            whereClause.id=id;
        }

        if(title && title.trim()!=""){
            whereClause.title={[Sequelize.Op.like]: `%${title.trim()}%`};
        }

        const ProductImages=await ProductImages.findAll({where:whereClause});

        if(ProductImages.length === 0){
            logger.error("No matching admins found")
            return res.status(404).json({ error: "No matching admins found" });
        }
        logger.info("Categories found ")
        res.status(200).json(ProductImages)
});

module.exports={
    // getAllProductImages,
    // getProductImagesCount,
    // getProductImagesById,
    // deleteProductImages,
    // deleteProductImages,
    // searchProductImages,
    upsertProductImages
}