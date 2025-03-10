const Banner = require("../Models/Banner");
const asyncHandler = require("../middlewares/errorHandler");
const s3 = require("../config/awss3Config");
const uploadToS3 = require("../config/fileUpload.aws");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const {bannerUpsertSchema,bannerListSchema}=require('../utils/validation');
const logger = require('../utils/logger');

const upsertBanner = asyncHandler(async (req, res, next) => {
    try {
  //     // Validate other fields except img
  //     const { error } = bannerUpsertSchema.validate({
  //       id: req.body.id,
  //       status: req.body.status
  //     });
  // console.log(req.body)
  //     if (error) {
  //       return res.status(400).json({ error: error.details[0].message });
  //     }
  
      const { id, status } = req.body;
      let imageUrl;
  
      // Check if file is provided
      if (req.file) {
        imageUrl = await uploadToS3(req.file, "image");
      } else if (!id) {
        return res.status(400).json({ error: "Image is required for a new banner." });
      }
  
      let banner;
      if (id) {
        banner = await Banner.findByPk(id);
        if (!banner) {
          return res.status(404).json({ ResponseCode: "404", Result: "false", ResponseMsg: "Banner not found." });
        }
  
        // Update banner details
        await banner.update({
          img: imageUrl || banner.img,  // Use existing image if new one not provided
          status,
        });
  
        return res.status(200).json({
          ResponseCode: "200",
          Result: "true",
          ResponseMsg: "Banner updated successfully.",
          banner
        });
      } else {
        banner = await Banner.create({ img: imageUrl, status });
  
        return res.status(200).json({
          ResponseCode: "200",
          Result: "true",
          ResponseMsg: "Banner created successfully.",
          banner
        });
      }
    } catch (error) {
      console.error("Error processing banner:", error);
      res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Internal Server Error"
      });
    }
  });
  
  
const fetchBanners = asyncHandler(async(req, res, next)=>{
   try {
    const banners = await Banner.findAll();
    logger.info("Successfully fetch all Banners");
    res.status(200).json(banners)
   } catch (error) {
    console.error(error);
    return res.status(400).json({message:"Failed to fetch Banners"})
   }
})

const fetchBannersById=asyncHandler(async(req,res,next)=>{
  const {id}=req.params;
  console.log(id)
  try {
    const bannerid=await Banner.findByPk(id);
    if(!bannerid){
      return res.status(404).json({message:"Banner not found"})
    }
    res.status(200).json(bannerid)
  } catch (error) {
    
  }
})
const toggleBannerStatus = asyncHandler(async(req, res)=>{
    console.log("Request received:", req.body);
    const {id, value}= req.body;
    try {
        const banner = await Banner.findByPk(id);
        if(!banner){
            console.log("Banner not found!");
            return res.status(404).json({message:"Banner not found!"})
        }
        banner.status=value;
        await banner.save();
        console.log("Banner status updated successfully.");
        res.status(200).json({
            message:"Banner status updated successfully.",
            updatedStatus:banner.status,
        })
    } catch (error) {
        console.error("Error updating banner status:", error);
        res.status(500).json({ message: "Internal server error." });    
    }
})

const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { forceDelete } = req.body;

  // Find the banner, allowing for soft-deleted items to be fetched as well
  const banner = await Banner.findOne({ where: { id }, paranoid: false });

  if (!banner) {
    logger.error(`Banner with ID ${id} not found`);
    return res.status(404).json({ error: "Banner not found" });
  }

  // If the banner is already soft-deleted and forceDelete isn't provided
  if (banner.deletedAt && forceDelete !== "true") {
    logger.error(
      `Banner with ID ${id} is already soft-deleted. Use forceDelete=true to permanently delete it.`
    );
    return res.status(400).json({
      error: "Banner is already soft-deleted. Use forceDelete=true to permanently delete it.",
    });
  }

  if (forceDelete === "true") {
    // Perform a permanent delete
    await banner.destroy({ force: true });
    logger.info(`Banner with ID ${id} permanently deleted successfully`);
    return res.status(200).json({ message: "Banner permanently deleted successfully" });
  }

  // Soft delete the banner
  await banner.destroy();
  logger.info(`Banner with ID ${id} soft deleted successfully`);
  return res.status(200).json({ message: "Banner soft deleted successfully" });
});

  module.exports = {upsertBanner, fetchBanners,fetchBannersById, toggleBannerStatus,deleteBanner}