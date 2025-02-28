const express=require("express")
const router=express.Router();
const ProductImagesController=require("../AdminControllers/ProductImages.Controller");
const upload = require("../utils/multerConfig");

// router.post("/add",upload.single("category_iamge"),ProductImagesController.upsertCategory);
router.get("/all",ProductImagesController.getAllProductImages)
router.get("/getbyid/:id",ProductImagesController.getProductImagesById)
router.delete("/delete/:id",ProductImagesController.deleteProductImages)
router.patch("/update/:id",ProductImagesController.getProductImagesById)
router.get("/count",ProductImagesController.getProductImagesCount)
router.post("/imgupsert", upload.fields([{name:'img',maxCount:10}]) ,ProductImagesController.upsertProductImages)

module.exports=router