const Banner = require("../Models/Banner");
const asyncHandler = require("../middlewares/errorHandler");
const s3 = require("../config/awss3Config");
const uploadToS3 = require("../config/fileUpload.aws");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const {bannerUpsertSchema,bannerListSchema}=require('../utils/validation');
const logger = require('../utils/logger');

const upsertBanner = asyncHandler(async (req, res, next) => {
    try {
      // Validate other fields except img
      const { error } = bannerUpsertSchema.validate({
        id: req.body.id,
        status: req.body.status
      });
  
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
  
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
  
const fetchbannerbyid = async (req,res)=>{
  const {id} =req.params
  try{
    let banner;
    banner = await Banner.findByPk(id)
  }
  catch(error){
    res.status(500).json({message: "server error at fetch banner"})
  }
}
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
  module.exports = {upsertBanner, fetchBanners, toggleBannerStatus}