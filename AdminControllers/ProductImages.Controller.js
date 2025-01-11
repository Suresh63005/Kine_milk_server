const ProductImages=require("../Models/Photo");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { ProductImagesByIdSchema, ProductImagesDeleteSchema, ProductImagesSearchSchema} = require("../utils/validation");


const getAllProductImages=asynHandler(async(req,res,next)=>{
    const Photo=await ProductImages.findAll();
    logger.info("sucessfully get all ProductImages");
    res.status(200).json(Photo);
});

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
    getAllProductImages,
    getProductImagesCount,
    getProductImagesById,
    deleteProductImages,
    deleteProductImages,
    searchProductImages
}