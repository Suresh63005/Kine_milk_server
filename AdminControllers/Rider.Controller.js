const Rider=require("../Models/Rider");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { getRiderIdBySchema, RiderDeleteSchema, RiderSearchSchema, upsertRiderSchema } = require("../utils/validation");

const upsertRider = async (req, res) => {
    console.log(req);
    const { id, question, answer, status } = req.body;
    console.log(req.body);
    try {
      if (id) {
        // Update Rider
        const Rider = await Rider.findByPk(id);
        if (!Rider) {
          return res.status(404).json({ error: "Rider not found" });
        }
  
        Rider.question = question;
        Rider.answer = answer;
        Rider.status = status;
  
        await Rider.save();
        res.status(200).json({ message: "Rider updated successfully", Rider });
      } else {
        // Create new Rider
        const Rider = await Rider.create({
          question,
          answer,
          status,
        });
        res.status(201).json({ message: "Rider created successfully", Rider });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  };

const getAllRiders=asynHandler(async(req,res,next)=>{
    const Riders=await Rider.findAll();
    logger.info("sucessfully get all Rider's");
    res.status(200).json(Riders);
});

const getRiderCount=asynHandler(async(req,res)=>{
    const RiderCount=await Rider.count();
    const Riders=await Rider.findAll();
    logger.info("Riders",RiderCount)
    res.status(200).json({Riders,Rider:RiderCount})
});

const getRiderById=asynHandler(async(req,res)=>{
    const {error}=getRiderIdBySchema.validate(req.params)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
    }

    const {id}=req.params;
    console.log(id)
    const RiderDetails=await Rider.findOne({where:{id:id}});
    if(!RiderDetails){
        logger.error('Rider not found')
        return res.status(404).json({error:"Rider not found"})
    }
    logger.info("Rider found");
    res.status(200).json(RiderDetails)
});

const deleteRider = asynHandler(async (req, res) => {
    const dataToValidate = { ...req.params, ...req.body };
    const {error}=RiderDeleteSchema.validate(dataToValidate)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
      }
    const { id } = req.params;
    const { forceDelete } = req.body;

        const RiderDel = await Rider.findOne({ where: { id }, paranoid: false });

        if (!RiderDel) {
            logger.error("Rider not found");
            return res.status(404).json({ error: "Rider not found" });
        }

        if (RiderDel.deletedAt && forceDelete !== "true") {
            logger.error("Rider is already soft-deleted");
            return res.status(400).json({ error: "Rider is already soft-deleted. Use forceDelete=true to permanently delete it." });
        }

        if (forceDelete === "true") {
            await RiderDel.destroy({ force: true });
            logger.info("Rider permanently deleted");
            return res.status(200).json({ message: "Rider permanently deleted successfully" });
        }

        await RiderDel.destroy();
        logger.info("Rider soft-deleted");
        return res.status(200).json({ message: "Rider soft deleted successfully" });
});

const searchRider=asynHandler(async(req,res)=>{
    const {error}=RiderSearchSchema.validate(req.body);
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

        const Rider=await Rider.findAll({where:whereClause});

        if(Rider.length === 0){
            logger.error("No matching admins found")
            return res.status(404).json({ error: "No matching admins found" });
        }
        logger.info("Riders found ")
        res.status(200).json(Rider)
});

module.exports={
    upsertRider,
    getAllRiders,
    getRiderCount,
    getRiderById,
    deleteRider,
    searchRider
}