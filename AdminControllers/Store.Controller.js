const Store = require("../Models/Store");
const logger = require("../utils/logger");
const asyncHandler = require("../middlewares/errorHandler");
const { upsertStoreSchema } = require("../utils/validation");
const uploadToS3 = require("../config/fileUpload.aws");
const { where } = require("sequelize");
const AWS = require('aws-sdk');
const s3 = new AWS.S3();


const upsertStore = asyncHandler(async (req, res, next) => {
  const { error } = upsertStoreSchema.validate({
    id: req.body.id,
    store_name: req.body.store_name,
    status: req.body.status,
    rating: req.body.rating,
    c_license_code: req.body.c_license_code,
    mobile: req.body.mobile,
    slogan: req.body.slogan,
    slogan_subtitle: req.body.slogan_subtitle,
    s_open_time: req.body.s_open_time,
    s_close_time: req.body.s_close_time,
    s_pickup_status: req.body.s_pickup_status,
    tags: req.body.tags,
    short_desc: req.body.short_desc,
    cancel_policy: req.body.cancel_policy,
    email: req.body.email,
    password: req.body.password,
    s_type: req.body.s_type,
    full_address: req.body.full_address,
    pincode: req.body.pincode,
    select_zone: req.body.select_zone,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    service_charge_type: req.body.service_charge_type,
    s_charge: req.body.s_charge,
    min_order_price: req.body.min_order_price,
    commission_rate: req.body.commission_rate,
    bank_name: req.body.bank_name,
    recipient_name: req.body.recipient_name,
    paypal_id: req.body.paypal_id,
    bank_ifsc: req.body.bank_ifsc,
    acc_number: req.body.acc_number,
    upi_id: req.body.upi_id,
  });

  if (error) {
    logger.error("Validation error:", error.details[0].message);
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const {
      id, store_name, status, rating, c_license_code, mobile, slogan, slogan_subtitle,
      s_open_time, s_close_time, s_pickup_status, tags, short_desc, cancel_policy, 
      email, password, s_type, full_address, pincode, select_zone, latitude, longitude, 
      service_charge_type, s_charge, min_order_price, commission_rate, bank_name, recipient_name, 
      paypal_id, bank_ifsc, acc_number, upi_id
    } = req.body;

    let store;
    let storeLogoUrl, storeCoverUrl;
  
    if (req.files) {
      if (req.files.store_logo && req.files.store_logo[0]) {
        storeLogoUrl = await uploadToS3(req.files.store_logo[0], "store-logos");
      } else {
        return res.status(400).json({
          success: false,
          message: "Store logo is required."
        });
      }
    
      if (req.files.store_cover_image && req.files.store_cover_image[0]) {
        storeCoverUrl = await uploadToS3(req.files.store_cover_image[0], "store-covers");
      }
    }

    if (id) {
      store = await Store.findByPk(id);
      if (!store) {
        return res
          .status(404)
          .json({ success: false, message: "Store not found." });
      }

      if (req.user.role !== "admin" && req.store_id !== store.id) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      await Store.update({
        store_name, store_logo: storeLogoUrl || store.store_logo,
        store_cover_image: storeCoverUrl || store.store_cover_image,
        status, rating, c_license_code, mobile, slogan, slogan_subtitle,
        s_open_time, s_close_time, s_pickup_status, tags, short_desc, cancel_policy,
        email, password, s_type, full_address, pincode, select_zone, latitude, longitude,
        service_charge_type, s_charge, min_order_price, commission_rate, bank_name,
        recipient_name, paypal_id, bank_ifsc, acc_number, upi_id,
      },{where: { id }});

      logger.info(`Store with ID ${id} updated successfully.`);
      return res.status(200).json({
        success: true,
        message: "Store updated successfully.",
        store,
      });
    } else {
      store = await Store.create({
        store_name, store_logo: storeLogoUrl,
        store_cover_image: storeCoverUrl, status, rating, c_license_code, mobile,
        slogan, slogan_subtitle, s_open_time, s_close_time, s_pickup_status, tags,
        short_desc, cancel_policy, email, password, s_type, full_address, pincode,
        select_zone, latitude, longitude, service_charge_type, s_charge, min_order_price,
        commission_rate, bank_name, recipient_name, paypal_id, bank_ifsc, acc_number, upi_id,
      });

      logger.info("New store created successfully.");
      return res.status(201).json({
        success: true,
        message: "Store created successfully.",
        store,
      });
    }
  } catch (err) {
    logger.error("Error upserting store:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the store.",
      error: err.message,
    });
  }
});

const fetchStores = asyncHandler(async (req, res, next) => {
  try {
    const stores = await Store.findAll();
    logger.info("Successfully fetch all stores");
    res.status(200).json({message:"Stores Fetched Successfully.",stores});
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Failed to fetch stores" });
  }
});

const fetchStoresById = asyncHandler(async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    logger.info("Successfully fetch store by ID");
    res.status(200).json(store);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Failed to fetch store by ID" });
  }
});


const deleteStore = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { forceDelete } = req.query;

  try {
    const store = await Store.findOne({ where: { id }, paranoid: false });

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    if (store.deletedAt && forceDelete !== "true") {
      return res
        .status(400)
        .json({ success: false, message: "Store is already soft-deleted" });
    }

    if (forceDelete === "true") {
      if (store.store_logo && !store.store_logo.startsWith("http")) {
        const logoKey = store.store_logo.split("/").pop(); 
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: logoKey,
        };
        
        await s3.deleteObject(params).promise().catch((err) => {
          console.warn(`Failed to delete logo from S3: ${err.message}`);
        });
      }

      if (store.store_cover_image && !store.store_cover_image.startsWith("http")) {
        const coverKey = store.store_cover_image.split("/").pop();
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: coverKey,
        };
        
        await s3.deleteObject(params).promise().catch((err) => {
          console.warn(`Failed to delete cover image from S3: ${err.message}`);
        });
      }

      await store.destroy({ force: true });

      return res
        .status(200)
        .json({ success: true, message: "Store permanently deleted successfully" });
    } else {
      await store.destroy();

      return res.status(200).json({
        success: true,
        message: "Store soft-deleted successfully",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error.message });
  }
});


module.exports = {
  upsertStore,
  fetchStores,
  fetchStoresById,
  deleteStore
};
