const Rider=require("../Models/Rider");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { getRiderIdBySchema, RiderDeleteSchema, RiderSearchSchema, upsertRiderSchema, RiderStatusSchema } = require("../utils/validation");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/awss3Config");
const uploadToS3 = require("../config/fileUpload.aws");

const upsertRider = async (req, res) => {
  try {
    const { id, store_id, title, email, mobile, password, rdate, status, ccode } = req.body;
    console.log(req.body);  

    let imageUrl = null; 
    if (req.file) { 
      // Pass file correctly to uploadToS3
      imageUrl = await uploadToS3(req.file, "img");
    }

    const storeId = store_id ; 
    const riderDate = rdate || new Date().toISOString().split('T')[0]; 

    if (id) {
      // Update existing rider
      const rider = await Rider.findByPk(id);
      if (!rider) {
        return res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Rider not found",
        });
      }

      await rider.update({
        title,
        email,
        mobile,
        password,
        status,
        img: imageUrl || rider.img, 
        store_id: storeId,
        rdate: riderDate,
        ccode
      });

      console.log("Rider updated successfully:", rider);
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Rider updated successfully",
        rider,
      });
    } else {
      if (!req.file) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Image is required for a new Rider.",
        });
      }

      // Check email uniqueness
      const existingRider = await Rider.findOne({ where: { email } });
      if (existingRider) { 
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Email is already in use.",
        });
      }

      // Check mobile uniqueness
      const mobileCheck = await Rider.findOne({ where: { mobile } });
      if (mobileCheck) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Mobile is already in use.",
        });
      }

      // Create new rider
      const newRider = await Rider.create({
        title,
        email,
        mobile,
        password,
        status,
        img: imageUrl, 
        store_id: storeId,
        rdate: riderDate,
        ccode
      });

      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Rider created successfully",
        rider: newRider,
      });
    }
  } catch (error) {
    console.error("Error in upsertRider:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal server error",
      details: error.message,
    });
  }
};

  
const getAllRidersbyStoreid = async (req, res, next) => {
  const { store_id } = req.params; // Get store_id from request params

  if (!store_id) {
      return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "store_id is required",
      });
  }

  try {
      const riders = await Rider.findAll({
          where: { store_id }, // Filter by store_id
      });

      logger.info("Successfully fetched all riders for store_id:", store_id);
      res.status(200).json(riders);
  } catch (error) {
      logger.error("Error fetching riders:", error);
      res.status(500).json({
          ResponseCode: "500",
          Result: "false",
          ResponseMsg: "Internal server error",
          details: error.message,
      });
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
    const {id,name}=req.body;
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

const toggleRiderStatus = async (req, res) => {
    console.log("Request received:", req.body);
    // const { error } = RiderStatusSchema.validate(req.body, { abortEarly: false });
    // if (error) {
    //   return res.status(400).json({
    //     ResponseCode: "400",
    //     Result: "false",
    //     ResponseMsg: error.details.map((detail) => detail.message).join(", "),
    //   });
    // }
  
    const { id, value } = req.body;
  
    try {
      const rider = await Rider .findByPk(id);
  
      if (!rider) {
        console.log("Rider not found");
        return res.status(404).json({ message: "Rider not found." });
      }
  
      rider.status = value;
      await rider.save();
  
      console.log("Rider updated successfully:", rider);
      res.status(200).json({
        message: "delivery status updated successfully.",
        updatedStatus: rider.status,
      });
    } catch (error) {
      console.error("Error updating Rider status:", error);
      res.status(500).json({ message: "Internal server error." });
    }
};

module.exports={
  getAllRiders,
    upsertRider,
    getAllRidersbyStoreid,
    getRiderCount,
    getRiderById,
    deleteRider,
    searchRider,
    toggleRiderStatus,
}