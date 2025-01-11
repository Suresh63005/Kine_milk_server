const Delivery=require("../Models/Delivery");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { getDeliveryByIdSchema, DeliveryDeleteSchema, DeliverySearchSchema } = require("../utils/validation");

const getAllDelivery=asynHandler(async(req,res,next)=>{
    const DeliveryDetails=await Delivery.findAll();
    logger.info("sucessfully get all Delivery");
    res.status(200).json(DeliveryDetails);
});

const getDeliveryCount=asynHandler(async(req,res)=>{
    const DeliveryCount=await Delivery.count();
    const DeliveryAll=await Delivery.findAll();
    logger.info("Delivery",DeliveryCount)
    res.status(200).json({DeliveryAll,Delivery:DeliveryCount})
});

const getDeliveryById=asynHandler(async(req,res)=>{
    const {error}=getDeliveryByIdSchema.validate(req.params)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
    }

    const {id}=req.params;
    const DeliverybyId=await Delivery.findOne({where:{id:id}});
    if(!DeliverybyId){
        logger.error('Delivery not found')
        return res.status(404).json({error:"Delivery not found"})
    }
    logger.info("Delivery found");
    res.status(200).json(DeliverybyId)
});

const deleteDelivery = asynHandler(async (req, res) => {
    const {error}=DeliveryDeleteSchema.validate(...req.params,...req.body)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
      }
    const { id } = req.params;
    const { forceDelete } = req.body;

        const DeliveryDelete = await Delivery.findOne({ where: { id }, paranoid: false });

        if (!DeliveryDelete) {
            logger.error("Delivery not found");
            return res.status(404).json({ error: "Delivery not found" });
        }

        if (DeliveryDelete.deletedAt && forceDelete !== "true") {
            logger.error("Delivery is already soft-deleted");
            return res.status(400).json({ error: "Delivery is already soft-deleted. Use forceDelete=true to permanently delete it." });
        }

        if (forceDelete === "true") {
            await DeliveryDelete.destroy({ force: true });
            logger.info("Delivery permanently deleted");
            return res.status(200).json({ message: "Delivery permanently deleted successfully" });
        }

        await DeliveryDelete.destroy();
        logger.info("Delivery soft-deleted");
        return res.status(200).json({ message: "Delivery soft deleted successfully" });
});

const searchDelivery=asynHandler(async(req,res)=>{
    const {error}=DeliverySearchSchema.validate(req.body);
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

        const Delivery=await Delivery.findAll({where:whereClause});

        if(Delivery.length === 0){
            logger.error("No matching admins found")
            return res.status(404).json({ error: "No matching admins found" });
        }
        logger.info("Delivery found ")
        res.status(200).json(Delivery)
});

module.exports={
    getAllDelivery,
    getDeliveryCount,
    getDeliveryById,
    deleteDelivery,
    searchDelivery
}