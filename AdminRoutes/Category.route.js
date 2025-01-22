const express=require("express")
const router=express.Router();
const categoryController=require("../AdminControllers/Category.Controller");
const upload = require("../utils/multerConfig");
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post("/upsert",adminMiddleware.authMiddleware, upload.single("img"),categoryController.upsertCategory);
router.get("/all",categoryController.getAllCategories)
router.get("/getbyid/:id",categoryController.getCategoryById)
router.delete("/delete/:id",adminMiddleware.authMiddleware,categoryController.deleteCategory)
router.patch("/update/:id",adminMiddleware.authMiddleware,categoryController.upsertCategory)
router.get("/count",adminMiddleware.authMiddleware,categoryController.getCategoryCount)
router.patch("/toggle-status",adminMiddleware.authMiddleware,categoryController.toggleCategoryStatus)

module.exports=router