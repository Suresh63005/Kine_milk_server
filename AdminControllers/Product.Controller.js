const Product=require("../Models/Product");
const {Op}=require("sequelize")

const getAllProducts=async(req,res,next)=>{
    try {
        const Products=await Product.findAll();
        res.status(200).json(Products);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getProductCount=async(req,res)=>{
    try {
        const ProductCount=await Product.count();
        const Products=await Product.findAll();
        res.status(200).json({Products,Product:ProductCount})
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getProductById=async(req,res)=>{
    try {
        const {id}=req.params;
        const Product=await Product.findByPk({where:{id:id}});
        if(!Product){
            return res.status(404).json({error:"Product not found"})
        }
        res.status(200).json(Product)
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const { forceDelete } = req.body;

    try {
        const Product = await Product.findOne({ where: { id }, paranoid: false });

        if (!Product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (Product.deletedAt && forceDelete !== "true") {
            return res.status(400).json({ error: "Product is already soft-deleted. Use forceDelete=true to permanently delete it." });
        }

        if (forceDelete === "true") {
            await Product.destroy({ force: true });
            return res.status(200).json({ message: "Product permanently deleted successfully" });
        }

        await Product.destroy();
        return res.status(200).json({ message: "Product soft deleted successfully" });

    } catch (error) {
        console.error("Error deleting Product:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const searchProduct=async(req,res)=>{
    const {id,title}=req.body;
    try {
        const whereClause={};
        if(id){
            whereClause.id=id;
        }

        if(title && title.trim()!=""){
            whereClause.title={[Sequelize.Op.like]: `%${title.trim()}%`};
        }

        const Product=await Product.findAll({where:whereClause});

        if(Product.length === 0){
            return res.status(404).json({ error: "No matching admins found" });
        }
        res.status(200).json(Product)
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}



module.exports={getAllProducts,getProductCount,getProductById,deleteProduct,searchProduct}