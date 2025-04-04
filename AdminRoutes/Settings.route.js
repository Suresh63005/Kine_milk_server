const express = require("express");
const router = express.Router();
const upload = require("../utils/multerConfig");
const SettingsController = require("../AdminControllers/Settings.Controller");

router.post("/upsertSettings", upload.single("weblogo"), SettingsController.UpsertSettings);
router.get("/allsettings", SettingsController.getSettingsAll);

module.exports = router;