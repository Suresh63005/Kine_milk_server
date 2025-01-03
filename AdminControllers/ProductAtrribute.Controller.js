const ProductAttribute=require("../Models/ProductAttribute");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { getProductAttributeByIdSchema, ProductAttributeDeleteSchema, ProductAttributeSearchSchema, } = require("../utils/validation");

const getAllProductAttribute=asynHandler(async(req,res,next)=>{
    const getProductAttribute=await ProductAttribute.findAll();
    logger.info("sucessfully get all ProductAttribute");
    res.status(200).json(getProductAttribute);
});

const getProductAttributeCount=asynHandler(async(req,res)=>{
    const ProductAttributeCount=await ProductAttribute.count();
    const getProductAttribute=await ProductAttribute.findAll();
    logger.info("ProductAttribute",ProductAttributeCount)
    res.status(200).json({getProductAttribute,ProductAttribute:ProductAttributeCount})
});

const getProductAttributeById=asynHandler(async(req,res)=>{
    const {error}=getProductAttributeByIdSchema.validate(req.params)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
    }

    const {id}=req.params;
    const ProductAttributegetById=await ProductAttribute.findOne({where:{id:id}});
    if(!ProductAttributegetById){
        logger.error('ProductAttribute not found')
        return res.status(404).json({error:"ProductAttribute not found"})
    }
    logger.info("ProductAttribute found");
    res.status(200).json(ProductAttributegetById)
});

const deleteProductAttribute = asynHandler(async (req, res) => {
    const dataToValidate={...req.params,...req.body}
    const {error}=ProductAttributeDeleteSchema.validate(dataToValidate)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
      }
    const { id } = req.params;
    const { forceDelete } = req.body;

        const getProductAttributeById = await ProductAttribute.findOne({ where: { id }, paranoid: false });

        if (!getProductAttributeById) {
            logger.error("ProductAttribute not found");
            return res.status(404).json({ error: "ProductAttribute not found" });
        }

        if (getProductAttributeById.deletedAt && forceDelete !== "true") {
            logger.error("ProductAttribute is already soft-deleted");
            return res.status(400).json({ error: "ProductAttribute is already soft-deleted. Use forceDelete=true to permanently delete it." });
        }

        if (forceDelete === "true") {
            await getProductAttributeById.destroy({ force: true });
            logger.info("ProductAttribute permanently deleted");
            return res.status(200).json({ message: "ProductAttribute permanently deleted successfully" });
        }

        await getProductAttributeById.destroy();
        logger.info("ProductAttribute soft-deleted");
        return res.status(200).json({ message: "ProductAttribute soft deleted successfully" });
});

const searchProductAttribute=asynHandler(async(req,res)=>{
    const {error}=ProductAttributeSearchSchema.validate(req.body);
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

        const ProductAttribute=await ProductAttribute.findAll({where:whereClause});

        if(ProductAttribute.length === 0){
            logger.error("No matching admins found")
            return res.status(404).json({ error: "No matching admins found" });
        }
        logger.info("ProductAttribute found ")
        res.status(200).json(ProductAttribute)
});

module.exports={
    getAllProductAttribute,
    getProductAttributeCount,
    getProductAttributeById,
    deleteProductAttribute,
    searchProductAttribute
}