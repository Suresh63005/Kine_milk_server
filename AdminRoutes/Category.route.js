const express=require("express")
const router=express.Router();
const categoryController=require("../AdminControllers/Category.Controller");
const upload = require("../utils/multerConfig");

router.post("/upsert", upload.single("img"),categoryController.upsertCategory);
router.get("/all",categoryController.getAllCategories)
router.get("/getbyid/:id",categoryController.getCategoryById)
router.delete("/delete/:id",categoryController.deleteCategory)
router.patch("/update/:id",categoryController.upsertCategory)
router.get("/count",categoryController.getCategoryCount)
router.patch("/toggle-status",categoryController.toggleCategoryStatus)

module.exports=router