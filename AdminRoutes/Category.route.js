const express=require("express")
const router=express.Router();
const categoryController=require("../AdminControllers/Category.Controller");
const upload = require("../utils/multerConfig");

// router.post("/add",categoryController,upload.single("category_iamge"));
router.get("/all",categoryController.getAllCategories)
router.get("/getbyid/:id",categoryController.getAllCategories)
router.delete("/delete/:id",categoryController.getAllCategories)
router.patch("/update/:id",categoryController.getAllCategories)
router.get("/count",categoryController.getCategoryCount)
module.exports=router