const Coupon=require("../Models/Coupon");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { DeliverySearchSchema, upsertCouponSchema, CouponDeleteSchema, getCouponByIdSchema } = require("../utils/validation");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/awss3Config");
const uploadToS3 = require("../config/fileUpload.aws");

const upsertCoupon = async (req, res) => {
    const store_id=1;
    const {
      id,
      title,
      status,
      coupon_code,
      subtitle,
      expire_date,
      min_amt,
      coupon_val,
      description,
    } = req.body;
    console.log(req.body)

    const { error } = upsertCouponSchema.validate({
      id,
      title,
      status,
      coupon_code,
      subtitle,
      expire_date,
      min_amt,
      coupon_val,
      description,
    });
  
    if (error) {
      logger.error(error)
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: error.details[0].message,
      });
    }
  
    try {
      let imageUrl;
      if (req.file) {
        imageUrl = await uploadToS3(req.file, "image");
      }
  
      let coupon;
      if (id) {
        coupon = await Coupon.findByPk(id);
        if (!coupon) {
          logger.error("coupon not found")
          return res.status(404).json({
            ResponseCode: "404",
            Result: "false",
            ResponseMsg: "Coupon not found.",
          });
        }
  
        await coupon.update({
          title,
          coupon_img: imageUrl || coupon.coupon_img,
          status,
          coupon_code,
          subtitle,
          expire_date,
          min_amt,
          coupon_val,
          description,
          store_id
        });
  
        logger.info("Coupon updated successfully:", coupon);
        return res.status(200).json({
          ResponseCode: "200",
          Result: "true",
          ResponseMsg: "Coupon updated successfully.",
          coupon,
        });
      } else {
        // Create a new coupon
        if (!req.file) {
          logger.error('Image is required for a new coupon.')
          return res.status(400).json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "Image is required for a new coupon.",
          });
        }
  
        coupon = await Coupon.create({
          coupon_img: imageUrl,
          title,
          status,
          coupon_code,
          subtitle,
          expire_date,
          min_amt,
          coupon_val,
          description,
          store_id
        });
  
        logger.info("Coupon created successfully:", coupon);
        return res.status(201).json({
          ResponseCode: "201",
          Result: "true",
          ResponseMsg: "Coupon created successfully.",
          coupon,
        });
      }
    } catch (error) {
      logger.error("Error processing request:", error);
      return res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Internal Server Error",
      });
    }
};
   
const getAllCoupon=asynHandler(async(req,res,next)=>{
    const CouponDetails=await Coupon.findAll();
    logger.info("sucessfully get all Coupon");
    res.status(200).json(CouponDetails);
});

const getCouponCount=asynHandler(async(req,res)=>{
    const CouponCount=await Coupon.count();
    const CouponAll=await Coupon.findAll();
    logger.info("Delivery",CouponCount)
    res.status(200).json({CouponAll,Delivery:CouponCount})
});

const getCouponById=asynHandler(async(req,res)=>{
    const {error}=getCouponByIdSchema.validate(req.params)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
    }

    const {id}=req.params;
    const CouponById=await Coupon.findOne({where:{id:id}});
    if(!CouponById){
        logger.error('Coupon not found')
        return res.status(404).json({error:"Coupon not found"})
    }
    logger.info("Delivery found");
    res.status(200).json(CouponById)
});

const deleteCoupon = asynHandler(async (req, res) => {
    const { error } = CouponDeleteSchema.validate({ ...req.params, ...req.body });
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return res.status(400).json({ error: error.details[0].message });
    }
  
    const { id } = req.params;
    const { forceDelete } = req.body;
  
    try {
      const couponToDelete = await Coupon.findOne({ where: { id }, paranoid: false });
  
      if (!couponToDelete) {
        logger.error("Coupon not found");
        return res.status(404).json({ error: "Coupon not found" });
      }
  
      if (couponToDelete.deletedAt && forceDelete !== "true") {
        logger.error("Coupon is already soft-deleted");
        return res.status(400).json({
          error: "Coupon is already soft-deleted. Use forceDelete=true to permanently delete it.",
        });
      }
  
      if (forceDelete === "true") {
        await Coupon.destroy({ where: { id }, force: true });
        logger.info(`Coupon with ID ${id} permanently deleted`);
        return res.status(200).json({ message: "Coupon permanently deleted successfully" });
      }
  
      await Coupon.destroy({ where: { id } });
      logger.info(`Coupon with ID ${id} soft-deleted`);
      return res.status(200).json({ message: "Coupon soft deleted successfully" });
    } catch (error) {
      logger.error(`Error deleting coupon: ${error.message}`);
      return res.status(500).json({ error: "Internal Server Error" });
    }
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

const toggleCouponStatus = asynHandler(async (req, res) => {
    console.log("Request received:", req.body);
    const { id, value } = req.body;
  
    try {
      const delivery = await Coupon.findByPk(id);
  
      if (!delivery) {
        logger.error("Coupon not found");
        return res.status(404).json({ message: "Coupon not found." });
      }
  
      delivery.status = value;
      await delivery.save();
  
      logger.info("Coupon updated successfully:", delivery);
      res.status(200).json({
        message: "delivery status updated successfully.",
        updatedStatus: delivery.status,
      });
    } catch (error) {
      logger.error("Error updating delivery status:", error);
      res.status(500).json({ message: "Internal server error." });
    }
});

module.exports={
    upsertCoupon,
    getAllCoupon,
    getCouponCount,
    getCouponById,
    deleteCoupon,
    searchDelivery,
    toggleCouponStatus
}