const { messaging } = require("firebase-admin");
const Settings = require("../Models/Setting");
const { response } = require("express");
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
            weblogo
        } = req.body;

        console.log(req.body,"wwwwwwwwwwwwwwebname");

        let imageUrl = null;
        console.log(req.files,"rtyuiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
        if (req.files?.weblogo) {
            imageUrl = await uploadToS3(req.files.weblogo[0], "weblogo");
        }

        let settings;

        if (id) {
            settings = await Settings.findByPk(id);
            if (!settings) {
                return res.status(404).json({ message: "Settings not found" });
            }
            await settings.update({
                webname,
                weblogo: "imageUrl" || settings.weblogo, // Keep old logo if no new one
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
            });
            return res.status(200).json({ message: "Settings updated successfully", settings });
        } else {
            settings = await Settings.create({
                webname,
                weblogo: "imageUrl",
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

const getSettingsAll = async(req,res)=>{
    try{
        let settings;
        settings = await Settings.findAll()
        
        if(!settings){
            res.status(404).json({response:"settings not founf",settings})
        }
        
        return res.status(200).json({response:"settings fetched successfully",settings})
    }
    catch(error){
        return res.status(500).json({response:"server error"})

    }
}

module.exports = { UpsertSettings,getSettingsAll };
