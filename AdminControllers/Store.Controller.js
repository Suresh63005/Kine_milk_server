const Store = require("../Models/Store");
const asyncHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const uploadToS3 = require("../config/fileUpload.aws");
const { upsertStoreSchema, storeDeleteSchema } = require("../utils/validation");
const {storeFirebase} = require("../config/firebase-config");

const upsertStore = asyncHandler(async (req, res) => {
  try {
    // const { error } = upsertStoreSchema.validate(req.body);
    // if (error) {
    //   return res.status(400).json({ error: error.details[0].message });
    // }
    const {
      id,
      title,
      status,
      rate,
      slogan,
      lcode,
      catid,
      full_address,
      pincode,
      landmark,
      lats,
      longs,
      store_charge,
      // dcharge,
      morder,
      commission,
      bank_name,
      ifsc,
      receipt_name,
      acc_number,
      paypal_id,
      upi_id,
      email,
      rstatus,
      mobile, // Required for Firebase
      password,
      sdesc,
      cancle_policy,
      charge_type,
      
      // ukm,
      // uprice,
      // aprice,
      zone_id,
      slogan_title,
      // cdesc,
      opentime,
      closetime,
      is_pickup,
      owner_name,
      tags,
    } = req.body;

    
  
    console.log(req.body,"nallaaaaaaaaaaaaa jilakarraaaaaaa moggaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    let rimg, cover_img;


    

    if (req.files?.rimg) {
      rimg = await uploadToS3(req.files.rimg[0], "store-logos");
    } else if (!id) {
      return res.status(400).json({ error: "Store logo is required for a new store." });
    }

    if (req.files?.cover_img?.[0]) {
      cover_img = await uploadToS3(req.files.cover_img[0], "store-covers");
    } else if (!id) {
      return res.status(400).json({ error: "Cover image is required for a new store." });
    }
   
    

    let store;
    if (id) {
      store = await Store.findByPk(id);
      if (!store) {
        return res.status(404).json({ ResponseCode: "404", Result: "false", ResponseMsg: "Store not found." });
      }
      await store.update({
        title,
        status,
        rate,
        slogan,
        lcode,
        catid: catid,
        full_address,
        pincode,
        landmark,
        lats,
        longs,
        store_charge,
        // dcharge,
        morder,
        commission,
        bank_name,
        ifsc,
        receipt_name,
        acc_number,
        paypal_id,
        upi_id,
        email,
        rstatus,
        mobile,
        password,
        sdesc,
        cancle_policy,
        charge_type,
        // ukm,
        // uprice,
        // aprice,
        tags: tags,
        zone_id,
        slogan_title,
        // cdesc,
        opentime,
        closetime,
        is_pickup,
        rimg: rimg || store.rimg,
        cover_img: cover_img || store.cover_img,
        owner_name
      });
      
      return res.status(200).json({ message: "Store updated successfully!", store });
    } else {
      // **Create new store**
      store = await Store.create({
        title,
        status,
        rate,
        slogan,
        lcode,
        catid: catid,
        full_address,
        pincode,
        landmark,
        lats,
        longs,
        store_charge,
        // dcharge,
        morder,
        commission,
        bank_name,
        ifsc,
        receipt_name,
        acc_number,
        paypal_id,
        upi_id,
        email,
        rstatus,
        mobile,
        password,
        sdesc,
        cancle_policy,
        charge_type,
        // ukm,
        // uprice,
        // aprice,
        zone_id,
        slogan_title,
        // cdesc,
        opentime,
        closetime,
        is_pickup,
        rimg,
        cover_img,
        owner_name,
        tags: tags,
      });
      
      // **Check if the mobile number already exists in Firebase Authentication**
      try {
        const userRecord = await storeFirebase.auth().getUserByPhoneNumber(`+${mobile}`);
        console.log("User already exists in Firebase:", userRecord.uid);
      } catch (firebaseError) {
        if (firebaseError.code === "auth/user-not-found") {
          // **Create a new Firebase Authentication user with only the mobile number**
          try {
            const newUser = await storeFirebase.auth().createUser({
              phoneNumber: `+${mobile}`,
            });

            console.log("New Firebase user created:", newUser.uid);
          } catch (createError) {
            console.error("Error creating Firebase user:", createError);
            return res.status(500).json({ success: false, message: "Error creating Firebase user", error: createError.message });
          }
        } else {
          console.error("Error fetching Firebase user:", firebaseError);
          return res.status(500).json({ success: false, message: "Error checking Firebase user", error: firebaseError.message });
        }
      }
    }

    return res.status(200).json({ success: true, message: "Store saved successfully", store });
  } catch (error) {
    console.error("Error in upsertStore:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

const fetchStores = asyncHandler(async(req,res)=>{
  try {
    const stores = await Store.findAll();

    

    if(!stores){
      res.status(400).json({message:"Store not found!"})
    }
    return res.status(200).json({success:true,message:"Store Fetched Successfully",stores})
  } catch (error) {
    logger.error("Error in Fetching Store:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
})

const fetchStoreById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(400).json({ message: "Store not found!" });
    }

    // Parse catid from JSON string to array
  

    return res.status(200).json({
      success: true,
      message: "Single Store Fetched Successfully",
      store
    });
  } catch (error) {
    logger.error("Error in Fetching Store:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

const deleteStore = asyncHandler(async (req, res) => {
  const dataToValidate = { ...req.params, ...req.body };
  const { error } = storeDeleteSchema.validate(dataToValidate);

  // if (error) {
  //   logger.error(error.details[0].message);
  //   return res.status(400).json({ error: error.details[0].message });
  // }

  try {
    const { id } = req.params;
    const { forceDelete } = req.query;

    const store = await Store.findOne({ where: { id }, paranoid: false });

    if (!store) {
      logger.error("Store not found!");
      return res.status(404).json({ error: "Store not found!" });
    }

    if (store.deletedAt && forceDelete !== "true") {
      logger.error("Store already Soft Deleted");
      return res.status(400).json({ error: "Store is already soft-deleted" });
    }

    if (forceDelete === "true") {
      await store.destroy({ force: true }); 
      logger.info("Store Permanently Deleted");
      return res.status(200).json({ message: "Store Permanently Deleted Successfully." });
    }

    await store.destroy();
    logger.info("Store Soft Deleted");
    return res.status(200).json({ message: "Store Soft Deleted Successfully." });

  } catch (error) {
    console.error("Error Occurred while deleting Store.");
    logger.error("Error Occurred while deleting Store.");
    res.status(500).json({ message: "Internal Server Error." });
  }
});

const toggleStoreStatus = async (req, res) => {
  console.log("Request received:", req.body);
  const { id, value } = req.body;

  try {
    const store = await Store.findByPk(id);

    if (!store) {
      logger.error("Store not found");
      return res.status(404).json({ message: "Store not found." });
    }

    store.status = value;
    await store.save();

    logger.info("Store updated successfully:", store);
    res.status(200).json({
      message: "Store status updated successfully.",
      updatedStatus: store.status,
    });
  } catch (error) {
    logger.error("Error updating Store status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = { upsertStore,fetchStores,fetchStoreById,deleteStore,toggleStoreStatus };
