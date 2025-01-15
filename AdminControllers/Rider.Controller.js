const Rider=require("../Models/Rider");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { getRiderIdBySchema, RiderDeleteSchema, RiderSearchSchema, upsertRiderSchema } = require("../utils/validation");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/awss3Config");
const uploadToS3 = require("../config/fileUpload.aws");

const upsertRider = async (req, res) => {
    const { id, name, email, mobile,password,status } = req.body;
    if (!req.file || !email || !status || !mobile || !name || !password) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "name, status, file,email ,mobile and password are required.",
        });
      }
      const imageUrl = await uploadToS3(req.file, "image");
      let rider;
    try {
      if (id) {
        // Update Rider
        const rider = await Rider.findByPk(id);
        if (!rider) {
          return res.status(404).json({ error: "Rider not found" });
        }
  
        await rider.update({
            name,
            email,
            mobile,
            password,
            status,
            img:imageUrl || rider.img
        })
  
        console.log("Rider updated successfully:", rider);
        res.status(200).json({ message: "Rider updated successfully", rider });
      } else {
        // Create new Rider
        rider = await Rider.create({
            name,
            email,
            mobile,
            password,
            status,
            img:imageUrl,
            store_id:1,
            ccode:"text",
            rdate:"11-01-2025"
        });
        res.status(201).json({ message: "Rider created successfully", rider });
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