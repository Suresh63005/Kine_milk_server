const express=require("express")
const router=express.Router();
const categoryController=require("../AdminControllers/Category.Controller");
const upload = require("../utils/multerConfig");
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post("/upsert",adminMiddleware.isAdmin, upload.single("img"),categoryController.upsertCategory);
router.get("/all",adminMiddleware.isAdmin,categoryController.getAllCategories)
router.get("/getbyid/:id",categoryController.getCategoryById)
router.delete("/delete/:id",adminMiddleware.isAdmin,categoryController.deleteCategory)
router.patch("/update/:id",adminMiddleware.isAdmin,categoryController.upsertCategory)
router.get("/count",adminMiddleware.isAdmin,categoryController.getCategoryCount)
router.patch("/toggle-status",adminMiddleware.isAdmin,categoryController.toggleCategoryStatus)

module.exports=router