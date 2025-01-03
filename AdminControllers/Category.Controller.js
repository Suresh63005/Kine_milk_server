const Category=require("../Models/Category");
const {Op}=require("sequelize")

const getAllCategories=async(req,res,next)=>{
    try {
        const categories=await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getCategoryCount=async(req,res)=>{
    try {
        const categoryCount=await Category.count();
        const categories=await Category.findAll();
        res.status(200).json({categories,category:categoryCount})
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const getCategoryById=async(req,res)=>{
    try {
        const {id}=req.params;
        const category=await Category.findByPk({where:{id:id}});
        if(!category){
            return res.status(404).json({error:"Category not found"})
        }
        res.status(200).json(category)
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const { forceDelete } = req.body;

    try {
        const category = await Category.findOne({ where: { id }, paranoid: false });

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        if (category.deletedAt && forceDelete !== "true") {
            return res.status(400).json({ error: "Category is already soft-deleted. Use forceDelete=true to permanently delete it." });
        }

        if (forceDelete === "true") {
            await category.destroy({ force: true });
            return res.status(200).json({ message: "Category permanently deleted successfully" });
        }

        await category.destroy();
        return res.status(200).json({ message: "Category soft deleted successfully" });

    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const searchCategory=async(req,res)=>{
    const {id,title}=req.body;
    try {
        const whereClause={};
        if(id){
            whereClause.id=id;
        }

        if(title && title.trim()!=""){
            whereClause.title={[Sequelize.Op.like]: `%${title.trim()}%`};
        }

        const category=await Category.findAll({where:whereClause});

        if(category.length === 0){
            return res.status(404).json({ error: "No matching admins found" });
        }
        res.status(200).json(category)
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}



module.exports={getAllCategories,getCategoryCount,getCategoryById,deleteCategory,searchCategory}