const express=require("express")
const router=express.Router();
const categoryController=require("../AdminControllers/Category.Controller");
const upload = require("../utils/multerConfig");

router.post("/add", upload.single("img"),categoryController.upsertCategory);
router.get("/all",categoryController.getAllCategories)
router.get("/getbyid/:id",categoryController.getCategoryById)
router.delete("/delete/:id",categoryController.deleteCategory)
router.patch("/update/:id",categoryController.upsertCategory)
router.get("/count",categoryController.getCategoryCount)
module.exports=router