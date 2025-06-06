const Settings = require("../Models/Setting");
const uploadToS3 = require("../config/fileUpload.aws");

const UpsertSettings = async (req, res) => {
  try {
    const {
      id,
      webname,
      timezone,
      pstore,
      onesignal_keyId,
      onesignal_apikey,
      onesignal_appId,
      scredit,
      rcredit,
      delivery_charges,
      store_charges,
      tax,
      admin_tax,
      sms_type,
      one_key,
      terms_conditions,
      privacy_policy,
      cancellation_policy,
      refferal_amount, // Optional field
    } = req.body;

    console.log(
      terms_conditions,
      privacy_policy,
      cancellation_policy,
      refferal_amount,
      "Request Body"
    );

    let imageUrl = null;
    console.log(req.file, "Uploaded File");

    // Handle file upload if `weblogo` is present in `req.file`
    if (req.file) {
      try {
        imageUrl = await uploadToS3(req.file, "weblogo");
        console.log("Uploaded image URL:", imageUrl);
      } catch (uploadError) {
        console.error("Error uploading to S3:", uploadError);
        return res.status(500).json({
          message: "Failed to upload weblogo to S3",
          error: uploadError.message,
        });
      }
    }

    let settings;

    if (id) {
      // Update existing settings
      settings = await Settings.findByPk(id);
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      await settings.update({
        webname,
        weblogo: imageUrl || settings.weblogo,
        timezone,
        pstore,
        onesignal_keyId,
        onesignal_apikey,
        onesignal_appId,
        scredit,
        rcredit,
        delivery_charges,
        store_charges,
        tax,
        admin_tax,
        sms_type,
        one_key,
        terms_conditions,
        privacy_policy,
        cancellation_policy,
        refferal_amount: refferal_amount !== undefined && refferal_amount !== "" ? refferal_amount : settings.refferal_amount, // Optional field
      });

      return res.status(200).json({ message: "Settings updated successfully", settings });
    } else {
      // Create new settings
      settings = await Settings.create({
        webname,
        weblogo: imageUrl,
        timezone,
        pstore,
        onesignal_keyId,
        onesignal_apikey,
        onesignal_appId,
        scredit,
        rcredit,
        delivery_charges,
        store_charges,
        tax,
        admin_tax,
        sms_type,
        one_key,
        terms_conditions,
        privacy_policy,
        cancellation_policy,
        refferal_amount: refferal_amount !== undefined && refferal_amount !== "" ? refferal_amount : null, // Optional field
      });

      return res.status(201).json({ message: "Settings created successfully", settings });
    }
  } catch (error) {
    console.error("Error in UpsertSettings:", error);
    res.status(500).json({
      message: "Server error while creating/updating settings",
      error: error.message,
    });
  }
};



const getSettingsAll = async (req, res) => {
    try {
        let settings;
        settings = await Settings.findAll();

        if (!settings || settings.length === 0) {
            return res.status(404).json({ response: "Settings not found", settings });
        }

        return res.status(200).json({ response: "Settings fetched successfully", settings });
    } catch (error) {
        console.error("Error in getSettingsAll:", error);
        return res.status(500).json({ response: "Server error" });
    }
};

module.exports = { UpsertSettings, getSettingsAll };