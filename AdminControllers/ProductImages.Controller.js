const ProductImages=require("../Models/productImages");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const uploadToS3 = require("../config/fileUpload.aws");
const { ProductImagesByIdSchema, ProductImagesDeleteSchema, ProductImagesSearchSchema} = require("../utils/validation");
const Product = require("../Models/Product");


const getAllProductImages = async (req, res, next) => {
    try {

        const photos = await ProductImages.findAll({
            include:[
                {
                    model:Product,
                    attributes:['title'],
                    as:'product'
                }
            ]
        });

        const formattedPhotos = photos.map(photo => {
            let parsedImages;

            try {
                parsedImages = JSON.parse(photo.img); 
                if (!Array.isArray(parsedImages)) {
                    parsedImages = [photo.img]; // Convert single string to an array
                }
            } catch (error) {
                parsedImages = [photo.img]; // If parsing fails, keep it as a single-item array
            }


            return {
                ...photo.toJSON(),
                img: parsedImages
            };
        });

        logger.info("Successfully retrieved all ProductImages");
        res.status(200).json(formattedPhotos);
    } catch (error) {
        console.error("Error fetching product images:", error);
        res.status(500).json({ error: "Failed to fetch product images" });
    }
};


const toggleProductImageStatus = asynHandler(async(req, res)=>{
    console.log("Request received:", req.body);
    const {id, value}= req.body;
    try {
        const productImage = await ProductImages.findByPk(id);
        if(!productImage){
            console.log("product Image not found!");
            return res.status(404).json({message:"product Image not found!"})
        }
        productImage.status=value;
        await productImage.save();
        console.log("product Image status updated successfully.");
        res.status(200).json({
            message:"product Image status updated successfully.",
            updatedStatus:productImage.status,
        })
    } catch (error) {
        console.error("Error updating product Image status:", error);
        res.status(500).json({ message: "Internal server error." });    
    }
})


// const getAllProductImagesbyId = async (req, res, next) => {
//     const photos = await ProductImages.findByPk(id);

//     // Convert 'img' field from string to JSON array
//     const formattedPhotos = photos.map(photo => ({
//         ...photo.toJSON(),
//         img: photo.img ? JSON.parse(photo.img) : [] // Parse only if not null
//     }));

//     logger.info("Successfully retrieved all ProductImages");
//     res.status(200).json(formattedPhotos);
// };

const upsertProductImages = async (req, res) => {
    const { id, product_id, status } = req.body;
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    try {
        if (!product_id) {
            return res.status(400).json({ error: "Product ID is required." });
        }

        const files = req.files;
        const imgFiles = files?.img ? (Array.isArray(files.img) ? files.img : [files.img]) : [];

        let product_imgUrls = [];

        if (imgFiles.length > 0) {
            product_imgUrls = await uploadToS3(imgFiles, "Product-Images");
            if (!Array.isArray(product_imgUrls)) {
                product_imgUrls = [product_imgUrls];
            }
        }

        // Convert the array to a string (using JSON format for easy retrieval)
        const imgString = product_imgUrls.length > 0 ? JSON.stringify(product_imgUrls) : null;

        if (id) {
            const existingProductImage = await ProductImages.findByPk(id);
            if (!existingProductImage) {
                return res.status(404).json({ error: "Product image not found" });
            }

            existingProductImage.product_id = product_id;
            existingProductImage.status = status;
            if (imgString) existingProductImage.img = imgString; // Update image URLs if provided
            await existingProductImage.save();

            return res.status(200).json({ message: "Product image updated successfully!", productImage: existingProductImage });
        } else {
            if (!imgString) {
                return res.status(400).json({ error: "At least one image is required." });
            }

            const newProductImage = await ProductImages.create({
                product_id,
                status,
                img: imgString, // Store images as a single string
            });

            return res.status(201).json({ message: "Product image created successfully!", productImage: newProductImage });
        }

  
        return res.status(200).json({ message: "Product image added successfully", newProductImage });
      }
    catch (error) {
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
    // const {error}=ProductImagesByIdSchema.validate(req.params)
    // if (error) {
    //     logger.error(error.details[0].message)
    //     return res.status(400).json({ error: error.details[0].message });
    // }

    const {id}=req.params;

    console.log(id,"jjjjjjjjjjjjj")
    const getById=await ProductImages.findOne({where:{id:id}});
    if(!getById){
        logger.error('ProductImages not found')
        return res.status(404).json({error:"ProductImages not found"})
    }
    logger.info("ProductImages found");
    res.status(200).json(getById)
});

const deleteProductImages = asynHandler(async (req, res) => {
    // const dataToValidate = { ...req.params, ...req.body };

    // const { error } = ProductImagesDeleteSchema.validate(dataToValidate);
    // if (error) {
    //     logger.error(error.details[0].message);
    //     return res.status(400).json({ error: error.details[0].message });
    // }

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
    // getAllProductImagesbyId,
    getAllProductImages,
    toggleProductImageStatus,
    getProductImagesCount,
    getProductImagesById,
    deleteProductImages,
    deleteProductImages,
    searchProductImages,
    upsertProductImages
}