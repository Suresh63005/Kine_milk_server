const Product=require("../Models/Product");
const {Op}=require("sequelize")
const asyncHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");

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

    const {id}=req.params;
    const Product=await Product.findByPk({where:{id:id}});
    if(!Product){
        logger.error('Product not found')
        return res.status(404).json({error:"Product not found"})
    }
        res.status(200).json(Product)
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

module.exports={getAllProducts,getProductCount,getProductById,deleteProduct,searchProduct}